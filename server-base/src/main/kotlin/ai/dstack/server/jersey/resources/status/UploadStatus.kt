package ai.dstack.server.jersey.resources.status

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty

@JsonInclude(JsonInclude.Include.NON_NULL)
data class UploadStatus(
        val id: String,
        @JsonProperty("file_name")
        val fileName: String?,
        val length: Long,
        @JsonProperty("upload_url")
        val uploadUrl: String?
)