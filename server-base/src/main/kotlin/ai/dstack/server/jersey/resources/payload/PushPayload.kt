package ai.dstack.server.jersey.resources.payload

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
data class PushPayload(
        val stack: String?,
        val id: String?,
        val timestamp: Long?,
        @JsonProperty("application")
        val application: String?,
        @JsonProperty("content_type")
        val contentType: String?,
        val index: Int?,
        val attachments: List<PushPayloadAttachment>?,
        val size: Int?,
        val params: Map<String, Any>?,
        val settings: Map<String, Any>?
)

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
data class PushPayloadAttachment(
        @JsonProperty("application")
        val application: String?,
        @JsonProperty("content_type")
        val contentType: String?,
        val data: String?,
        val length: Long?,
        val params: Map<String, Any>?,
        val settings: Map<String, Any>?
)