package ai.dstack.server.jersey.resources.apps

import ai.dstack.server.jersey.resources.*
import ai.dstack.server.jersey.resources.attachmentNotFound
import ai.dstack.server.jersey.resources.frameNotFound
import ai.dstack.server.jersey.resources.malformedRequest
import ai.dstack.server.jersey.resources.ok
import ai.dstack.server.jersey.resources.payload.ExecutePayload
import ai.dstack.server.jersey.resources.stackNotFound
import ai.dstack.server.jersey.resources.stacks.parseStackPath
import ai.dstack.server.jersey.resources.status.toStatus
import ai.dstack.server.model.AccessLevel
import ai.dstack.server.services.*
import mu.KLogging
import javax.inject.Inject
import javax.ws.rs.*
import javax.ws.rs.core.Context
import javax.ws.rs.core.HttpHeaders
import javax.ws.rs.core.Response
import javax.ws.rs.core.StreamingOutput

@Path("/apps")
class AppResources {
    @Inject
    private lateinit var config: AppConfig

    @Inject
    private lateinit var userService: UserService

    @Inject
    private lateinit var stackService: StackService

    @Inject
    private lateinit var frameService: FrameService

    @Inject
    private lateinit var attachmentService: AttachmentService

    @Inject
    private lateinit var sessionService: SessionService

    @Inject
    private lateinit var permissionService: PermissionService

    @Inject
    private lateinit var executionService: ExecutionService

    companion object : KLogging()

    @POST
    @Path("/execute")
    @Produces(JSON_UTF8)
    @Consumes(JSON_UTF8)
    fun execute(payload: ExecutePayload, @Context headers: HttpHeaders): Response {
        logger.debug { "payload: $payload" }
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val stack = stackService.get(payload.user!!, payload.stack!!)
            return if (stack != null) {
                val currentUser = headers.getCurrentUser()
                return if (headers.bearer != null && currentUser == null) {
                    badCredentials()
                } else {
                    val owner = currentUser == stack.userName
                    val permitted = stack.accessLevel == AccessLevel.Public
                            || owner
                            || (stack.accessLevel == AccessLevel.Internal && currentUser != null)
                            || (currentUser != null && permissionService.get(stack.path, currentUser) != null)
                    if (permitted) {
                        val frame = frameService.get(stack.path, payload.frame!!)
                        if (frame != null) {
                            val attachment = attachmentService.get(frame.path, payload.attachment!!)
                            if (attachment != null) {
                                if (attachment.application == "application/python") {
                                    // TODO: Cache session, stackUser, stack, frame, attachment
                                    val stackUser = userService.get(stack.userName)!!
                                    val pair = executionService.execute(stack.path, stackUser, frame, attachment,
                                            payload.views, payload.apply == true)
                                    if (pair.first != null)
                                        ok(pair.first!!.toStatus())
                                    else {
                                        val streamingOutput = StreamingOutput { output ->
                                            try {
                                                pair.second!!.inputStream().copyTo(output)
                                            } catch (e: Exception) {
                                                throw WebApplicationException(e)
                                            }
                                        }
                                        Response.ok(streamingOutput)
                                                .header("content-type", "application/json;charset=UTF-8")
                                                .header("content-length", pair.second!!.length()).build()
                                    }
                                } else {
                                    unsupportedApplication(attachment.application)
                                }
                            } else {
                                attachmentNotFound()
                            }
                        } else {
                            frameNotFound()
                        }
                    } else {
                        badCredentials()
                    }
                }
            } else {
                stackNotFound()
            }
        }
    }

    private fun HttpHeaders.getCurrentUser(): String? {
        return bearer?.let {
            sessionService.get(it)?.let { session ->
                if (session.valid) {
                    sessionService.renew(session)
                    session.userName
                } else null
            } ?: userService.findByToken(it)?.name
        }
    }

    @GET
    @Path("/poll")
    @Produces(JSON_UTF8)
    @Consumes(JSON_UTF8)
    fun poll(@QueryParam("id") id: String?, @Context headers: HttpHeaders): Response {
        logger.debug { "id: $id" }
        return if (id.isNullOrBlank()) {
            malformedRequest()
        } else {
            val (stackPath, executionFile) = executionService.poll(id)
            if (stackPath != null && executionFile != null) {
                val (u, s) = stackPath.parseStackPath()
                val stack = stackService.get(u, s)
                if (stack != null) {
                    val currentUser = headers.getCurrentUser()
                    return if (headers.bearer != null && currentUser == null) {
                        badCredentials()
                    } else {
                        val owner = currentUser == stack.userName
                        val permitted = stack.accessLevel == AccessLevel.Public
                                || owner
                                || (stack.accessLevel == AccessLevel.Internal && currentUser != null)
                                || (currentUser != null && permissionService.get(stack.path, currentUser) != null)
                        if (permitted) {
                            val streamingOutput = StreamingOutput { output ->
                                try {
                                    executionFile.inputStream().copyTo(output)
                                } catch (e: Exception) {
                                    throw WebApplicationException(e)
                                }
                            }
                            Response.ok(streamingOutput)
                                    .header("content-type", "application/json;charset=UTF-8")
                                    .header("content-length", executionFile.length()).build()
                        } else {
                            badCredentials()
                        }
                    }
                } else {
                    stackNotFound()
                }
            } else {
                executionNotFound()
            }
        }
    }
}

private val ExecutePayload.isMalformed: Boolean
    get() {
        return this.user == null || this.stack == null || this.frame == null
                || this.attachment == null
    }
