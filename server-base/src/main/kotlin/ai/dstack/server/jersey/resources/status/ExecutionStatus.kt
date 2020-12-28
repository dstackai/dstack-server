package ai.dstack.server.jersey.resources.status

import ai.dstack.server.model.*
import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty
import java.lang.UnsupportedOperationException

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ExecutionOutputInfo(
        val application: String,
        @JsonProperty("content_type")
        val contentType: String,
        val data: String? = null
)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ExecutionStatus(
        val id: String,
        val views: List<Map<String, Any?>>?,
        val status: String,
        val logs: String?
)

fun Execution.toStatus(): ExecutionStatus {
    return ExecutionStatus(this.id, this.views?.map {
        it.toMap()
    }?.toList(), this.status.code, this.logs)
}

