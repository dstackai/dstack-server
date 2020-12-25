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
                val session = headers.bearer?.let { sessionService.get(it) }
                val userByToken = headers.bearer?.let { if (session == null) userService.findByToken(it) else null }
                val permitted = stack.accessLevel == AccessLevel.Public
                        || (stack.accessLevel == AccessLevel.Internal && userByToken != null)
                        || (session != null &&
                        (session.userName == stack.userName
                                || permissionService.get(stack.path, session.userName) != null))
                        || (userByToken != null &&
                        (userByToken.name == stack.userName
                                || permissionService.get(stack.path, userByToken.name) != null))
                if (permitted) {
                    val frame = frameService.get(stack.path, payload.frame!!)
                    if (frame != null) {
                        val attachment = attachmentService.get(frame.path, payload.attachment!!)
                        if (attachment != null) {
                            if (attachment.application == "application/python") {
                                // TODO: Cache session, userByToken, stack, frame, attachment
                                val execution = executionService.execute(stack.path, attachment,
                                        payload.views, payload.apply == true)
                                ok(execution.toStatus())
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
            } else {
                stackNotFound()
            }
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
            val execution = executionService.poll(id)
            if (execution != null) {
                val (u, s) = execution.stackPath.parseStackPath()
                val stack = stackService.get(u, s)
                if (stack != null) {
                    val session = headers.bearer?.let { sessionService.get(it) }
                    val userByToken = headers.bearer?.let { if (session == null) userService.findByToken(it) else null }
                    val permitted = stack.accessLevel == AccessLevel.Public
                            || (stack.accessLevel == AccessLevel.Internal && userByToken != null)
                            || (session != null &&
                            (session.userName == stack.userName
                                    || permissionService.get(stack.path, session.userName) != null))
                            || (userByToken != null &&
                            (userByToken.name == stack.userName
                                    || permissionService.get(stack.path, userByToken.name) != null))
                    if (permitted) {
                        ok(execution.toStatus())
                    } else {
                        badCredentials()
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
