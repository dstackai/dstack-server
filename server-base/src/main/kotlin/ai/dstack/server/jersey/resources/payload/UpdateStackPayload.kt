package ai.dstack.server.jersey.resources.payload

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
data class UpdateStackPayload(
    val stack: String?,
    val private: Boolean?,
    @JsonProperty("access_level")
    val accessLevel: String?,
    val head: String?,
    val readme: String?
)