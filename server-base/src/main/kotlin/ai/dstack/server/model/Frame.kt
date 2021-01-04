package ai.dstack.server.model

data class Frame(
    val stackPath: String,
    val id: String,
    val timestampMillis: Long,
    val size: Int?,
    val params: Map<String, Any>,
    val settings: Map<String, Any>
) {
    val path: String
        get() = "$stackPath/$id"
}