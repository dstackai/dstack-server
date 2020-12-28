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
    companion object : KLogging() {
        const val EXECUTION_STAGE_ORIGINAL = "staged"
        const val EXECUTION_STAGE_UPDATED = "running"
        const val EXECUTION_STAGE_FINAL = "finished"
    }

    private val executionHome = File(config.executionDirectory).absolutePath

    // TODO: Split into update (returning UpdateStatus) and apply (returning ExecutionStatus (stack, InputStream, and length))
    override fun execute(stackPath: String, attachment: Attachment, views: List<Map<String, Any?>>?, apply: Boolean): Pair<Execution?, File?> {
        val id = UUID.randomUUID().toString()
        return if (config.pythonExecutable != null) {
            extractApplicationIfMissing(attachment)

            val executionFile = executionFile(id, EXECUTION_STAGE_ORIGINAL)
            if (apply) {
                writeStackPathFile(stackPath, id)
                writeExecutionFile(executionFile, id, views)
            }

            // TODO: Move to to ExecutionProcess and ExecutionProcessFactory
            val p = getProcess(attachment, stackPath)
            val command = mutableMapOf<String, Any?>()
            command["views"] = views
            return if (apply) {
                command["id"] = id
                command["stack"] = stackPath
                sendCommand(p, command)
                Pair(null, poll(id).second)
            } else {
                val updatedViews = synchronized(p) {
                    sendCommand(p, command)
                    receiveResponse(p)
                }.toUpdatedViews()
                Pair(Execution(id, updatedViews.views, ExecutionStatus.fromCode(updatedViews.status), updatedViews.logs), null)
            }
        } else {
            Pair(Execution(id, emptyList(), ExecutionStatus.Failed, logs = "The Python executable is not configured."), null)
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

    // TODO: Introduce ExecutionStatus (stack, InputStream, and length)
    override fun poll(id: String): Pair<String?, File?> {
        return Pair(stackPath(id), executionFileIfExists(id, EXECUTION_STAGE_FINAL)
                ?: executionFileIfExists(id, EXECUTION_STAGE_UPDATED)
                ?: executionFileIfExists(id, EXECUTION_STAGE_ORIGINAL))
    }

    private fun stackPath(id: String): String? {
        val stackPathFile = stackPathFile(id)
        return if (stackPathFile.exists()) stackPathFile.readText() else null
    }

    private fun executionFileIfExists(id: String, stage: String): File? {
        val executionFile = executionFile(id, stage)
        return if (executionFile.exists()) {
            executionFile
        } else {
            null
        }
    }

    private fun writeStackPathFile(stackPath: String, id: String) {
        val stackPathFile = stackPathFile(id)
        stackPathFile.parentFile.mkdirs()
        stackPathFile.writeText(stackPath)
    }

    private val executionFileObjectMapper = ObjectMapper()
            .registerModule(KotlinModule())
    private val commandObjectMapper = ObjectMapper()
            .registerModule(KotlinModule())

    private fun writeExecutionFile(executionFile: File, id: String, views: List<Map<String, Any?>>?) {
        executionFile.parentFile.mkdirs()
        val execution = mutableMapOf<String, Any?>()
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

    private val executorVersion = 12

    private fun executorFile(attachment: Attachment) = File(destDir(attachment), "execute_v${executorVersion}.py")

    private fun executionFile(id: String, stage: String) = File(File(File(config.executionDirectory), stage), "$id.json")

    private fun stackPathFile(id: String) = File(File(File(config.executionDirectory), "meta"), "$id.txt")

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