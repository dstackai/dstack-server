package ai.dstack.server.jersey.resources.status

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty

@JsonInclude(JsonInclude.Include.NON_NULL)
data class FrameInfo(
    val id: String,
    @JsonProperty("timestamp")
    val timestampMillis: Long,
    val attachments: List<AttachmentInfo>,
    val params: Map<String, Any>,
    val settings: Map<String, Any>
)
