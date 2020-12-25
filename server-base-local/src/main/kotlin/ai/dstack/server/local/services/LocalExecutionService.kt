package ai.dstack.server.local.services

import ai.dstack.server.model.*
import ai.dstack.server.services.*
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.KotlinModule
import mu.KLogging
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.core.io.ClassPathResource
import org.springframework.stereotype.Component
import java.io.*
import java.util.zip.ZipInputStream
import java.io.IOException
import java.util.zip.ZipEntry
import java.io.FileOutputStream
import java.util.*


@Component
class LocalExecutionService @Autowired constructor(
        private val config: AppConfig,
        private val fileService: FileService
) : ExecutionService {
    companion object : KLogging()

    private val executionHome = File(config.executionDirectory).absolutePath

    override fun execute(stackPath: String, attachment: Attachment, views: List<Map<String, Any?>>?, apply: Boolean): Execution {
        val id = UUID.randomUUID().toString()
        return if (config.pythonExecutable != null) {
            extractApplicationIfMissing(attachment)

            val executionFile = executionFile(id)
            if (apply) {
                writeExecutionFile(stackPath, executionFile, id, views)
            }

            val p = getProcess(attachment, stackPath)
            val command = mutableMapOf<String, Any?>()
            command["views"] = views
            return if (apply) {
                command["id"] = id
                command["stack"] = stackPath
                sendCommand(p, command)
                poll(id)!!
            } else {
                val updatedViews = synchronized(p) {
                    sendCommand(p, command)
                    receiveResponse(p)
                }.toUpdatedViews()

                Execution(stackPath, id, updatedViews.views, ExecutionStatus.fromCode(updatedViews.status), null, updatedViews.logs)
            }
        } else {
            Execution(stackPath, id = id, views = emptyList(), status = ExecutionStatus.Failed, output = null,
                    logs = "The Python executable is not configured.")
        }
    }

    private fun receiveResponse(p: Process) = p.inputStream.bufferedReader().readLine()

    private fun sendCommand(p: Process, command: MutableMap<String, Any?>) {
        p.outputStream.write((commandObjectMapper.writeValueAsString(command) + "\n").toByteArray())
        p.outputStream.flush()
    }

    data class UpdatedViews (
        val views: List<Map<String, Any?>>,
        val logs: String,
        val status: String
    )

    private fun String?.toUpdatedViews() =
            commandObjectMapper.readValue(this, UpdatedViews::class.java)

    private val processes = mutableMapOf<String, Process>()

    private fun getProcess(attachment: Attachment, stackPath: String): Process {
        val p = processes.getOrPut(attachment.filePath) {
            val executorFile = executorFile(attachment)
            val attachmentSettings = attachment.settings["function"] as Map<*, *>
            val functionType = attachmentSettings["type"] as String
            val functionData = attachmentSettings["data"] as String
            val commands = mutableListOf(config.pythonExecutable, executorFile.name,
                    executionHome, functionType, functionData)
            ProcessBuilder(commands).directory(destDir(attachment)).start().also {
                LocalSchedulerService.ErrorLogger(it.errorStream).start()
            }
        }
        return if (p.isAlive) {
            p
        } else {
            processes.remove(attachment.filePath, p)
            getProcess(attachment, stackPath)
        }
    }

    override fun poll(id: String): Execution? {
        val executionFile = executionFile(id)
        return if (executionFile.exists()) {
            readExecution(executionFile, id)
        } else {
            null
        }
    }

    private val executionFileObjectMapper = ObjectMapper()
            .registerModule(KotlinModule())
    private val commandObjectMapper = ObjectMapper()
            .registerModule(KotlinModule())

    private fun readExecution(executionFile: File, id: String): Execution {
        val execution = executionFileObjectMapper.readValue(executionFile, Map::class.java)
        val views = execution["views"] as List<Map<String, Any?>>?
        return Execution(execution["stack"] as String, id, views,
                ExecutionStatus.fromCode(execution["status"]!!.toString()),
                execution["output"]?.let {
                    val output = it as Map<*, *>
                    ExecutionOutput(output["application"] as String,
                            output["content_type"] as String,
                            output["data"] as String?)
                }, execution["logs"] as String?
        )
    }

    private fun writeExecutionFile(stackPath: String, executionFile: File, id: String, views: List<Map<String, Any?>>?) {
        executionFile.parentFile.mkdirs()
        val execution = mutableMapOf<String, Any?>()
        execution["stack"] = stackPath
        execution["id"] = id
        if (views != null) {
            execution["views"] = views
        }
        execution["status"] = "SCHEDULED"
        executionFileObjectMapper.writeValue(executionFile, execution)
    }

    private fun extractApplicationIfMissing(attachment: Attachment) {
        val destDir = destDir(attachment)
        val buffer = ByteArray(1024)
        if (!destDir.exists()) {
            destDir.mkdirs()
            val zis = ZipInputStream(ByteArrayInputStream(fileService.get(attachment.filePath)))
            var zipEntry = zis.nextEntry
            while (zipEntry != null) {
                val newFile = newFile(destDir, zipEntry)
                val fos = FileOutputStream(newFile)
                var len: Int
                while (zis.read(buffer).also { len = it } > 0) {
                    fos.write(buffer, 0, len)
                }
                fos.close()
                zipEntry = zis.nextEntry
            }
            zis.closeEntry()
            zis.close()
        }
        val executorFile = executorFile(attachment)
        if (!executorFile.exists()) {
            writeExecutorFile(executorFile)
        }
    }

    private fun destDir(attachment: Attachment) =
            File(config.appDirectory + "/" + attachment.filePath)

    private val executorVersion = 5

    private fun executorFile(attachment: Attachment) = File(destDir(attachment), "execute_v${executorVersion}.py")

    private fun executionFile(id: String) = File(File(config.executionDirectory), "$id.json")

    private fun newFile(destinationDir: File, zipEntry: ZipEntry): File {
        val destFile = File(destinationDir, zipEntry.name)
        val destDirPath = destinationDir.canonicalPath
        val destFilePath = destFile.canonicalPath
        if (!destFilePath.startsWith(destDirPath + File.separator)) {
            throw IOException("Entry is outside of the target dir: " + zipEntry.name)
        }
        return destFile
    }

    private fun writeExecutorFile(executorFile: File) {
        ClassPathResource("executor.py", this.javaClass.classLoader).inputStream.copyTo(FileOutputStream(executorFile))
    }
}