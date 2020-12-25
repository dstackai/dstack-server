package ai.dstack.server.jersey.resources.status

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty

@JsonInclude(JsonInclude.Include.NON_NULL)
data class HeadInfo(
    val id: String,
    @JsonProperty("timestamp")
    val timestampMillis: Long,
    val preview: PreviewInfo?
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class BasicStackInfo(
    @JsonProperty("user")
    val userName: String,
    val name: String,
    @Deprecated("Must be dropped eventually")
    val private: Boolean?,
    @JsonProperty("access_level")
    val accessLevel: String?,
    val head: HeadInfo?,
    val permissions: List<PermissionInfo>?
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class PreviewInfo(
    val application: String?,
    @JsonProperty("content_type")
    val contentType: String
)