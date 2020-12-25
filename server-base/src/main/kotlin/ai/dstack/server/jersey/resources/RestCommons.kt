package ai.dstack.server.jersey.resources

import ai.dstack.server.jersey.resources.status.OpStatus
import javax.ws.rs.core.CacheControl
import javax.ws.rs.core.HttpHeaders
import javax.ws.rs.core.MediaType
import javax.ws.rs.core.Response

const val JSON_UTF8 = MediaType.APPLICATION_JSON + ";charset=UTF-8"

internal val HttpHeaders.bearer
    get() = getRequestHeader(HttpHeaders.AUTHORIZATION)?.firstOrNull()?.substringAfter("Bearer", "")
        ?.let { if (it.isNotBlank()) it.trim() else null }

internal fun response(status: Response.Status, entity: Any, cache: Boolean = false): Response {
    return Response.status(status)
        .entity(entity)
        .cacheControl(
            if (cache)
                CacheControl.valueOf("max-age=31536000")
            else
                CacheControl.valueOf("no-cache, no-store")
        )
        .build()
}

internal fun ok(entity: Any = OpStatus(), cache: Boolean = false) = response(Response.Status.OK, entity, cache)

internal fun malformedRequest() = response(
    Response.Status.BAD_REQUEST,
    OpStatus("malformed request")
)

internal fun badCredentials() = response(
    Response.Status.FORBIDDEN,
    OpStatus("bad credentials")
)

internal fun userNotVerified() = response(
    Response.Status.FORBIDDEN,
    OpStatus("email not verified")
)

internal fun userAlreadyExists() = response(
    Response.Status.BAD_REQUEST,
    OpStatus("user already exists")
)

internal fun jobAlreadyExists() = response(
    Response.Status.BAD_REQUEST,
    OpStatus("job already exists")
)

internal fun userNotFound() = response(
    Response.Status.NOT_FOUND,
    OpStatus("user not found")
)

internal fun userEmailAlreadyRegistered() =
    response(
        Response.Status.BAD_REQUEST,
        OpStatus("user email already registered")
    )

internal fun stackNotFound() = response(
    Response.Status.NOT_FOUND,
    OpStatus("stack not found")
)

internal fun jobNotFound() = response(
    Response.Status.NOT_FOUND,
    OpStatus("job not found")
)

internal fun jobIsInProgress() = response(
    Response.Status.NOT_ACCEPTABLE,
    OpStatus("job is in progress")
)

internal fun jobIsNotInProgress() = response(
    Response.Status.NOT_ACCEPTABLE,
    OpStatus("job is not in progress")
)

internal fun attachmentAlreadyExists(): Response =
    response(
        Response.Status.BAD_REQUEST,
        OpStatus("attachment already exists")
    )

internal fun frameNotFound() = response(
    Response.Status.NOT_FOUND,
    OpStatus("frame not found")
)

internal fun attachmentNotFound() = response(
    Response.Status.NOT_FOUND,
    OpStatus("attachment not found")
)

internal fun unsupportedApplication(application: String?) = response(
    Response.Status.UNSUPPORTED_MEDIA_TYPE,
    OpStatus("unsupported application: $application")
)

internal fun executionNotFound() = response(
        Response.Status.NOT_FOUND,
        OpStatus("execution not found")
)

data class ExistStatus(val exists: Boolean)

internal fun userExists(status: Boolean) = ok(ExistStatus(status))