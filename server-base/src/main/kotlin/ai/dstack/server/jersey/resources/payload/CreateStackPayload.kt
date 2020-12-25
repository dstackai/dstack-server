package ai.dstack.server.jersey.resources.payload

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty

// TODO: Add UpdateStackPayload
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
data class CreateStackPayload(
    val user: String?,
    val name: String?,
    val private: Boolean?,
    @JsonProperty("access_level")
    val accessLevel: String?,
    val readme: String?
)