package ai.dstack.server.local.services

import ai.dstack.server.model.*
import ai.dstack.server.model.Stack
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
import java.lang.IllegalStateException
import java.util.*
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingQueue
import java.io.BufferedOutputStream

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

    override fun execute(stack: Stack, user: User, frame: Frame, attachment: Attachment,
                         views: List<Map<String, Any?>>?, apply: Boolean): ExecutionStatus {
        val id = UUID.randomUUID().toString()
        val minorPythonVersion = frame.minorPythonVersion
        val pythonExecutable = config.findPythonExecutable(minorPythonVersion)
        return if (pythonExecutable != null) {
            extractApplicationIfMissing(attachment)

            writeExecutionMetaFile(stack.path, id)
            writeStagedExecutionFile(id, views)

            installVenvAndStartProcessIfNeeded(attachment, pythonExecutable, user)
            addExecutionRequestToQueue(attachment, ExecutionRequest(id, views, apply))
            return poll(id)!!
        } else {
            val failedExecution = failedExecution(id,
                    "The required Python version is not supported: $minorPythonVersion")
                    .toByteArray()
            ExecutionStatus(stack.path, failedExecution.inputStream(), failedExecution.size.toLong())
        }
    }

    private fun failedExecution(id: String, logs: String): String {
        val execution = mutableMapOf<String, Any?>("id" to id, "status" to "SCHEDULED")
        return executionFileObjectMapper.writeValueAsString(execution)
    }

    private fun addExecutionRequestToQueue(attachment: Attachment, request: ExecutionRequest) {
        val queue = executionRequestQueues[attachment.filePath]
        queue!!.put(request)
    }

    private fun AppConfig.findPythonExecutable(minorPythonVersion: String?): String? =
            (minorPythonVersion?.let { this@LocalExecutionService.config.pythonExecutables[it] }
                    ?: this.pythonExecutables.values.firstOrNull())

    private fun installVenvAndStartProcessIfNeeded(attachment: Attachment, pythonExecutable: String, user: User) =
            executionRequestQueues.putIfAbsent(attachment.filePath,
                    LinkedBlockingQueue<ExecutionRequest>().also {
                        object : Thread() {
                            override fun run() {
                                val venvPythonExecutableFile = installVenvPythonExecutableIfMissing(attachment, pythonExecutable)
                                val p = startVenvPythonProcess(user, attachment, venvPythonExecutableFile.absolutePath)
                                while (true) {
                                    val request = it.take()
                                    synchronized(p) {
                                        // TODO: Make sure the virtual environment is set up correctly,
                                        //  as well as the process is started correctly.
                                        //  Otherwise, update the finished execution status
                                        p.outputStream.write((executionRequestsObjectMapper.writeValueAsString(request) + "\n").toByteArray())
                                        p.outputStream.flush()
                                    }
                                }
                            }
                        }.start()
                    })

    private data class ExecutionRequest(
            val id: String,
            val views: List<Map<String, Any?>>?,
            val apply: Boolean
    )

    private val executionRequestQueues = mutableMapOf<String, BlockingQueue<ExecutionRequest>>()

    private fun installVenvPythonExecutableIfMissing(attachment: Attachment, pythonExecutable: String): File {
        val destDir = destDir(attachment)
        val venvFile = File(destDir, "venv")
        val flagFile = File(venvFile, "flag")
        if (!flagFile.exists()) {
            venvFile.deleteRecursively()
            val venvCommands = mutableListOf(pythonExecutable, "-m", "venv", "venv", "--system-site-packages")
            ProcessBuilder(venvCommands).directory(destDir).start().also {
                ErrorLogger(it.errorStream).start()
            }.waitFor()
            val requirementsFile = File(destDir, "requirements.txt")
            if (requirementsFile.exists()) {
                val pipMacLinuxExecutableFile = File(File(venvFile, "bin"), "pip")
                val pipWinExecutableFile = File(File(venvFile, "Scripts"), "pip.exe")
                val pipExecutableFile = when {
                    pipMacLinuxExecutableFile.exists() -> pipMacLinuxExecutableFile
                    pipWinExecutableFile.exists() -> pipWinExecutableFile
                    else -> throw IllegalStateException("Can't find pip in " + venvFile.absolutePath)
                }
                val pipCommands = mutableListOf(pipExecutableFile.absolutePath, "install", "--disable-pip-version-check", "-r", requirementsFile.absolutePath)
                // TODO: In case of a problem, save the output and return as a FAILED Execution with logs
                ProcessBuilder(pipCommands).directory(destDir).start().also {
                    ErrorLogger(it.errorStream).start()
                }.waitFor()
            }
            flagFile.createNewFile()
        }
        val pythonMacLinuxExecutableFile = File(File(venvFile, "bin"), "python")
        val pythonWinExecutableFile = File(File(venvFile, "Scripts"), "python.exe")
        return when {
            pythonMacLinuxExecutableFile.exists() -> pythonMacLinuxExecutableFile
            pythonWinExecutableFile.exists() -> pythonWinExecutableFile
            else -> throw IllegalStateException("Can't find a Python executable in " + venvFile.absolutePath)
        }
    }

    private fun startVenvPythonProcess(user: User, attachment: Attachment, venvPythonExecutable: String): Process {
        val executorFile = executorFile(attachment)
        val attachmentSettings = attachment.settings["function"] as Map<*, *>
        val functionType = attachmentSettings["type"] as String
        val functionData = attachmentSettings["data"] as String
        val server = "http://localhost${if (config.internalPort != 80) ":${config.internalPort}" else ""}/api"
        val commands = mutableListOf(venvPythonExecutable, executorFile.name,
                executionHome, functionType, functionData, user.name, user.token, server)
        return ProcessBuilder(commands).directory(destDir(attachment)).start().also {
            ErrorLogger(it.errorStream).start()
        }
    }

    private class ErrorLogger(var inputStream: InputStream) : Thread() {
        override fun run() {
            try {
                val isr = InputStreamReader(inputStream)
                val br = BufferedReader(isr)
                var line: String?
                while (br.readLine().also { line = it } != null) logger.error { line }
            } catch (ex: IOException) {
                logger.error { ex }
            }
        }
    }

    private val Frame.minorPythonVersion: String?
        get() {
            val python = pythonSettings
            return python?.let { "${it["major"]}.${it["minor"]}" }
        }

    private val Frame.pythonSettings: Map<*, *>?
        get() {
            val python = settings["python"]?.let { if (it is Map<*, *>) it else null }
            return python
        }

    override fun poll(id: String): ExecutionStatus? {
        val stackPath = getExecutionStackPath(id)
        val executionFile = (executionFileIfExists(id, EXECUTION_STAGE_FINAL)
                ?: executionFileIfExists(id, EXECUTION_STAGE_UPDATED)
                ?: executionFileIfExists(id, EXECUTION_STAGE_ORIGINAL))
        return if (stackPath != null && executionFile != null) {
            ExecutionStatus(stackPath, executionFile.inputStream(), executionFile.length())
        } else {
            null
        }
    }

    private fun getExecutionStackPath(id: String): String? {
        val executionMetaFile = executionMetaFile(id)
        return if (executionMetaFile.exists()) executionMetaFile.readText() else null
    }

    private fun executionFileIfExists(id: String, stage: String): File? {
        val executionFile = executionFile(id, stage)
        return if (executionFile.exists()) {
            executionFile
        } else {
            null
        }
    }

    private fun writeExecutionMetaFile(stackPath: String, id: String) {
        val executionMetaFile = executionMetaFile(id)
        executionMetaFile.parentFile.mkdirs()
        executionMetaFile.writeText(stackPath)
    }

    private val executionFileObjectMapper = ObjectMapper()
            .registerModule(KotlinModule())
    private val executionRequestsObjectMapper = ObjectMapper()
            .registerModule(KotlinModule())

    private fun writeStagedExecutionFile(id: String, views: List<Map<String, Any?>>?) {
        val executionFile = executionFile(id, EXECUTION_STAGE_ORIGINAL)
        executionFile.parentFile.mkdirs()
        val execution = mutableMapOf<String, Any?>("id" to id, "status" to "SCHEDULED")
        views?.let {
            execution["views"] = it
        }
        executionFileObjectMapper.writeValue(executionFile, execution)
    }

    private fun extractApplicationIfMissing(attachment: Attachment) {
        val destDir = destDir(attachment)
        if (!destDir.exists()) {
            destDir.mkdirs()
            val zipIn = ZipInputStream(ByteArrayInputStream(fileService.get(attachment.filePath)))
            var entry = zipIn.nextEntry
            while (entry != null) {
                val destFile = File(destDir, entry.name)
                if (!entry.isDirectory) {
                    extractFile(zipIn, destFile)
                } else {
                    destFile.mkdirs()
                }
                zipIn.closeEntry()
                entry = zipIn.nextEntry
            }
            zipIn.close()
        }
        val executorFile = executorFile(attachment)
        if (!executorFile.exists()) {
            writeExecutorFile(executorFile)
        }
    }

    private val BUFFER_SIZE = 4096

    private fun extractFile(zipIn: ZipInputStream, destFile: File) {
        val bos = BufferedOutputStream(FileOutputStream(destFile))
        val bytesIn = ByteArray(BUFFER_SIZE)
        var read = 0
        while (zipIn.read(bytesIn).also { read = it } != -1) {
            bos.write(bytesIn, 0, read)
        }
        bos.close()
    }

    private fun destDir(attachment: Attachment) =
            File(config.appDirectory + "/" + attachment.filePath)

    private val executorVersion = 14

    private fun executorFile(attachment: Attachment) = File(destDir(attachment), "execute_v${executorVersion}.py")

    private fun executionFile(id: String, stage: String) = File(File(File(config.executionDirectory), stage), "$id.json")

    private fun executionMetaFile(id: String) = File(File(File(config.executionDirectory), "meta"), "$id.txt")

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