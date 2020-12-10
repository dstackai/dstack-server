package ai.dstack.server.model

import com.fasterxml.jackson.annotation.JsonProperty

data class Notifications(
    @Deprecated("Gonna be removed in October")
    @Evolution(default = true, booleanDefault = true)
    val newsletter: Boolean
)

enum class AccessLevel {
    @JsonProperty("private")
    Private,

    @JsonProperty("public")
    Public
}

data class General(
    @JsonProperty("default_access_level")
    val defaultAccessLevel: AccessLevel
)

data class Settings(
    val general: General,
    val notifications: Notifications
)