package ai.dstack.server.model

import com.fasterxml.jackson.annotation.JsonProperty

enum class AccessLevel {
    @JsonProperty("private")
    Private,

    @JsonProperty("internal")
    Internal,

    @JsonProperty("public")
    Public;

    companion object {
        fun fromCode(code: String): AccessLevel {
            return AccessLevel.values().find { it.name.equals(code, ignoreCase = true) }!!
        }
    }

    val code: String
        get() {
            return name.toLowerCase()
        }
}

data class General(
    @JsonProperty("default_access_level")
    val defaultAccessLevel: AccessLevel
)

data class Settings(
    val general: General
)