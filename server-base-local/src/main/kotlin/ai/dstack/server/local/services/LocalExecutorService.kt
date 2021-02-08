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
import java.io.FileOutputStream
import java.lang.IllegalStateException
import java.util.*
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingQueue
import java.io.BufferedOutputStream

@Component
class LocalExecutorService @Autowired constructor(
        private val config: AppConfig,
        private val fileService: FileService
) : ExecutorService {
    companion object : KLogging() {
        const val EXECUTION_STAGE_ORIGINAL = "staged"
        const val EXECUTION_STAGE_UPDATED = "running"
        const val EXECUTION_STAGE_FINAL = "finished"
    }

    private val executionHome = File(config.executionDirectory).absolutePath

    override fun execute(id: String, stackUser: User, frame: Frame, attachment: Attachment,
                         views: List<Map<String, Any?>>?, apply: Boolean): ExecutionResult {
        val minorPythonVersion = frame.minorPythonVersion
        return  if (minorPythonVersion != null) {
            val pythonExecutable = config.pythonExecutables[minorPythonVersion]
            if (pythonExecutable != null) {
                init(stackUser, frame, attachment)
                queue(attachment, ExecutionRequest(id, views, apply))
                return poll(id)!!
            } else {
                failed(id, views, "The required Python version is not supported: $minorPythonVersion")
            }
        } else {
            failed(id, views, "The Python version is missing in the application. " +
                    "Make sure you use the latest client to push the application.")
        }
    }

    private fun failed(id: String, views: List<Map<String, Any?>>?, logs: String): ExecutionResult {
        val failedExecution = failedExecution(id, logs).toByteArray()
        writeExecutionFile(EXECUTION_STAGE_FINAL, id, views, "FAILED", logs)
        return executionFileObjectMapper.readValue(failedExecution, Map::class.java)
    }

    private fun failedExecution(id: String, logs: String): String {
        val execution = mutableMapOf<String, Any?>("id" to id, "status" to "FAILED", "logs" to logs)
        return executionFileObjectMapper.writeValueAsString(execution)
    }

    private fun queue(attachment: Attachment, request: ExecutionRequest) {
        writeExecutionFile(EXECUTION_STAGE_ORIGINAL, request.id, request.views, "SCHEDULED", null)
        val queue = executionRequestQueues[attachment.filePath]
        queue!!.put(request)
    }


    override fun init(stackUser: User, frame: Frame, attachment: Attachment): Boolean {
        val minorPythonVersion = frame.minorPythonVersion
        val pythonExecutable = config.pythonExecutables[minorPythonVersion]
        if (pythonExecutable !== null) {
            val newQueue = LinkedBlockingQueue<ExecutionRequest>()
            val existingQueue = executionRequestQueues.putIfAbsent(attachment.filePath, newQueue)
            if (existingQueue == null) {
                object : Thread() {
                    override fun run() {
                        extractApplicationIfMissing(attachment)
                        val destDir = destDir(attachment)
                        val requirementsFile = File(destDir, "requirements.txt")
                        val executable = if (requirementsFile.exists()) {
                            installVenvPythonExecutableIfMissing(attachment, pythonExecutable).absolutePath
                        } else {
                            pythonExecutable
                        }
                        var p: Process? = null
                        while (true) {
                            val request = newQueue.take()
                            if (p == null || !p.isAlive) {
                                p = startVenvPythonProcess(stackUser, attachment, executable)
                            }
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
            }
            return true
        } else {
            return false
        }
    }

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
        // TODO: Capture logs from installation and save them per application
        val executorFile = executorFile(attachment)
        val server = "http://localhost${if (config.internalPort != 80) ":${config.internalPort}" else ""}/api"
        val commands = mutableListOf(venvPythonExecutable, executorFile.name,
                executionHome, user.name, user.token, server)
        val attachmentSettings = attachment.settings["function"] as Map<*, *>?
        val functionType = attachmentSettings?.get("type") as String?
        val functionData = attachmentSettings?.get("data") as String?
        if (functionType != null && functionData != null) {
            commands.addAll(listOf(functionType, functionData))
        }
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

    override fun poll(id: String): ExecutionResult? {
        val executionFile = (executionFileIfExists(id, EXECUTION_STAGE_FINAL)
                ?: executionFileIfExists(id, EXECUTION_STAGE_UPDATED)
                ?: executionFileIfExists(id, EXECUTION_STAGE_ORIGINAL))
        return executionFile?.let {
            executionFileObjectMapper.readValue(it, Map::class.java)
        }
    }

    private fun getExecutionStackPath(id: String): String? {
        val executionMetaFile = executionMetaFile(id)
        return if (executionMetaFile.exists()) executionMetaFile.readText() else null
    }

    private fun executionFileIfExists(id: String, stage: String): File? {
        val executionFile = executionFile(id, stage)
        return if (executionFile.exists() && executionFile.length() > 0) {
            executionFile
        } else {
            null
        }
    }

    private val executionFileObjectMapper = ObjectMapper()
            .registerModule(KotlinModule())
    private val executionRequestsObjectMapper = ObjectMapper()
            .registerModule(KotlinModule())

    private fun writeExecutionFile(stage: String, id: String,
                                   views: List<Map<String, Any?>>?, status: String, logs: String?) {
        val executionFile = executionFile(id, stage)
        executionFile.parentFile.mkdirs()
        val execution = mutableMapOf<String, Any?>("id" to id, "status" to status)
        views?.let {
            execution["views"] = it
        }
        logs?.let {
            execution["logs"] = it
        }
        executionFileObjectMapper.writeValue(executionFile, execution)
    }

    private fun extractApplicationIfMissing(attachment: Attachment) {
        val destDir = destDir(attachment)
        val flagFile = File(destDir, "flag")
        if (!flagFile.exists()) {
            destDir.deleteRecursively()
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
            flagFile.createNewFile()
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

    private val executorVersion = 20

    private fun executorFile(attachment: Attachment) = File(destDir(attachment), "execute_v${executorVersion}.py")

    private fun executionFile(id: String, stage: String) = File(File(File(config.executionDirectory), stage), "$id.json")

    private fun executionMetaFile(id: String) = File(File(File(config.executionDirectory), "meta"), "$id.txt")

    private fun writeExecutorFile(executorFile: File) {
        ClassPathResource("executor.py", this.javaClass.classLoader).inputStream.copyTo(FileOutputStream(executorFile))
    }
}