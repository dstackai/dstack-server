package ai.dstack.server.jersey.resources.status

import com.fasterxml.jackson.annotation.JsonProperty

data class GeneralInfo(@JsonProperty("default_access_level") val defaultAccessLevel: String)

data class SettingsInfo(
        val general: GeneralInfo
)

data class RuntimeInfo(
        val name: String
)

data class SessionStatus(
        val user: String,
        val token: String,
        val email: String?,
        val verified: Boolean,
        val settings: SettingsInfo,
        val role: String
)