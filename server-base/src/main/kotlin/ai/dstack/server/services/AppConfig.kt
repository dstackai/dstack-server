package ai.dstack.server.services

interface AppConfig {
    val user: String?
    val password: String?
    val hostName: String
    val ssl: Boolean
    val port: Int?
    val internalPort: Int
    val address: String
    val homeDirectory: String
    val dataDirectory: String
    val fileDirectory: String
    val jobDirectory: String
    val appDirectory: String
    val executionDirectory: String
    val adminEmail: String?
    val smtpHost: String?
    val smtpPort: Int?
    val smtpUser: String?
    val smtpPassword: String?
    val smtpStartTLS: Boolean?
    val smtpFrom: String?
    val pythonExecutable: String?
    val emailEnabled: Boolean
}