package ai.dstack.server.model

enum class ExecutionStatus {
    Ready,
    Scheduled,
    Running,
    Failed,
    Finished;

    companion object {
        fun fromCode(code: String): ExecutionStatus {
            return values().find { it.name.equals(code, ignoreCase = true) }!!
        }
    }

    val code: String
        get() {
            return name.toUpperCase()
        }
}

data class Execution(
        val id: String,
        val views: List<Map<String, Any?>>?,
        val status: ExecutionStatus,
        val logs: String?
)