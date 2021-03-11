package ai.dstack.server.jersey.resources.payload

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
data class ExecutePayload(
        val user: String?,
        val stack: String?,
        val frame: String?,
        val attachment: Int?,
        val views: List<Map<String, Any?>>?,
        val event: Map<String, Any?>?
)