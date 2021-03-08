package ai.dstack.server.local.cli.services

import ai.dstack.server.services.AppConfig
import org.springframework.stereotype.Component

@Component
class LocalCliAppConfig : AppConfig {
    override val hostName: String
        get() {
            return getEnvIfNotEmpty("DSTACK_HOST_NAME") ?: "localhost"
        }

    override val port: Int
        get() {
            return getEnvIfNotEmpty("DSTACK_PORT")?.toInt() ?: internalPort
        }

    override val internalPort: Int
        get() {
            return getEnvIfNotEmpty("DSTACK_INTERNAL_PORT")?.toInt() ?: defaultInternalPort.toInt()
        }

    override val ssl: Boolean
        get() {
            return getEnvIfNotEmpty("DSTACK_SSL")?.toBoolean() ?: false
        }

    override val address: String
        get() {
            val p = if (port == 80 && !ssl || port == 443 && ssl) "" else port.toString()
            return ((if (ssl) "https" else "http") + "://") + hostName + (if (p.isNotBlank()) ":$p" else "")
        }

    override val homeDirectory: String
        get() {
            val dir = defaultHomeDirectory ?: "."
            return getEnvIfNotEmpty("DSTACK_HOME") ?: "$dir/.dstack"
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

    override val adminEmail: String?
        get() {
            return getEnvIfNotEmpty("DSTACK_ADMIN_EMAIL")
        }

    override val smtpHost: String?
        get() {
            return getEnvIfNotEmpty("DSTACK_SMTP_HOST")
        }

    override val smtpPort: Int?
        get() {
            return getEnvIfNotEmpty("DSTACK_SMTP_PORT")?.toInt()
        }

    override val smtpUser: String?
        get() {
            return getEnvIfNotEmpty("DSTACK_SMTP_USER")
        }

    override val smtpPassword: String?
        get() {
            return getEnvIfNotEmpty("DSTACK_SMTP_PASSWORD")
        }

    override val smtpStartTLS: Boolean
        get() {
            return getEnvIfNotEmpty("DSTACK_SMTP_STARTTLS")?.toBoolean() ?: true
        }

    override val smtpFrom: String?
        get() {
            return getEnvIfNotEmpty("DSTACK_SMTP_FROM")
        }

    override val user: String?
        get() {
            return getEnvIfNotEmpty("DSTACK_USER") ?: defaultUser
        }

    override val password: String?
        get() {
            return getEnvIfNotEmpty("DSTACK_PASSWORD") ?: defaultPassword
        }

    override val pythonExecutables: Map<String, String>
        get() {
            val value: String = getEnvIfNotEmpty("DSTACK_PYTHON_EXECUTABLES") ?: defaultPythonExecutables
            return value.split(";").map {
                val p = it.split("=")
                p[0] to p[1]
            }.toMap()
        }

    override val emailEnabled: Boolean
        get() {
            return smtpHost != null
        }

    override val gaTrackingId: String?
        get() {
            return getEnvIfNotEmpty("DSTACK_GA_TRACKING_ID")
        }

    private fun getEnvIfNotEmpty(name: String): String? {
        val e = System.getenv(name)
        return if (!e.isNullOrBlank()) e else null
    }

    companion object {
        var defaultUser: String? = null
        var defaultPassword: String? = null
        var defaultInternalPort: String = "8080"
        var defaultHomeDirectory: String? = System.getProperty("user.home")
        var defaultPythonExecutables: String = ""
        var overrideConfig: Boolean = false
    }
}