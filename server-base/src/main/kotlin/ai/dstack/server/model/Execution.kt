package ai.dstack.server.model

data class Execution(
        val id: String,
        val stackPath: String,
        val tqdm: Map<String, Any>?
)
