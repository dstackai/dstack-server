package ai.dstack.server.jersey.resources.status

import com.fasterxml.jackson.annotation.JsonClassDescription
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty

@JsonInclude(JsonInclude.Include.NON_NULL)
data class AttachmentInfo(
    val application: String?,
    @JsonProperty("content_type")
    val contentType: String,
    val params: Map<String, Any>,
    val settings: Map<String, Any>,
    val length: Long,
    val description: String?,
    val data: String? = null,
    @JsonProperty("download_url")
    val downloadUrl: String? = null,
    val preview: Boolean? =null,
    val index: Int? = null
)