package ai.dstack.server.jersey.resources.status

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty

@JsonInclude(JsonInclude.Include.NON_NULL)
data class GetUploadStatus(
        val id: String,
        @JsonProperty("file_name")
        val fileName: String?,
        val length: Long,
        @JsonProperty("created_date")
        val createdDate: String,
        val data: String?,
        @JsonProperty("download_url")
        val downloadUrl: String?
)