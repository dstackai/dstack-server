package ai.dstack.server.model

data class Head(
    val id: String,
    val timestampMillis: Long
)

data class Stack(
    val userName: String,
    val name: String,
    val accessLevel: AccessLevel,
    val head: Head?,
    val readme: String?
) {
    val path: String
        get() = "$userName/$name"
}