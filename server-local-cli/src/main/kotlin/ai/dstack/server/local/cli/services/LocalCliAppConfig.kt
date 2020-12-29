package ai.dstack.server.local.cli.services

import ai.dstack.server.services.AppConfig
import org.springframework.stereotype.Component

@Component
class LocalCliAppConfig : AppConfig {
    override val hostName: String
        get() {
            return System.getenv("DSTACK_HOST_NAME") ?: "localhost"
        }

    override val port: Int
        get() {
            return System.getenv("DSTACK_PORT")?.toInt() ?: internalPort
        }

    override val internalPort: Int
        get() {
            return System.getenv("DSTACK_INTERNAL_PORT")?.toInt() ?: defaultInternalPort.toInt()
        }

    override val ssl: Boolean
        get() {
            return System.getenv("DSTACK_SSL")?.toBoolean() ?: false
        }

    override val address: String
        get() {
            val p = if (port == 80 && !ssl || port == 443 && ssl) "" else port.toString()
            return ((if (ssl) "https" else "http") + "://") + hostName + (if (p.isNotBlank()) ":$p" else "")
        }

    override val homeDirectory: String
        get() {
            val dir = defaultHomeDirectory ?: "."
            return System.getenv("DSTACK_HOME") ?: "$dir/.dstack"
        }

    override val dataDirectory: String
        get() {
            return "${homeDirectory}/data"
        }

    override val fileDirectory: String
        get() {
            return "${homeDirectory}/files"
        }

    override val jobDirectory: String
        get() {
            return "${homeDirectory}/jobs"
        }

    override val appDirectory: String
        get() {
            return "${homeDirectory}/applications"
        }

    override val executionDirectory: String
        get() {
            return "${homeDirectory}/executions"
        }

    override val adminEmail: String
        get() {
            return System.getenv("DSTACK_ADMIN_EMAIL")
        }

    override val smtpHost: String?
        get() {
            return System.getenv("DSTACK_SMTP_HOST")
        }

    override val smtpPort: Int?
        get() {
            return System.getenv("DSTACK_SMTP_PORT").toInt()
        }

    override val smtpUser: String?
        get() {
            return System.getenv("DSTACK_SMTP_USER")
        }

    override val smtpPassword: String?
        get() {
            return System.getenv("DSTACK_SMTP_PASSWORD")
        }

    override val smtpStartTLS: Boolean
        get() {
            return System.getenv("DSTACK_SMTP_STARTTLS")?.toBoolean() ?: true
        }

    override val smtpFrom: String
        get() {
            return System.getenv("DSTACK_SMTP_FROM")
        }

    override val user: String?
        get() {
            return System.getenv("DSTACK_USER") ?: defaultUser
        }

    override val password: String?
        get() {
            return System.getenv("DSTACK_PASSWORD") ?: defaultPassword
        }

    override val pythonExecutable: String?
        get() {
            return System.getenv("DSTACK_PYTHON_EXECUTABLE") ?: defaultPythonExecutable
        }

    override val emailEnabled: Boolean
        get() {
            return smtpHost != null
        }

    companion object {
        var defaultUser: String? = null
        var defaultPassword: String? = null
        var defaultInternalPort: String = "8080"
        var defaultHomeDirectory: String? = System.getProperty("user.home")
        var defaultPythonExecutable: String? = null
    }
}