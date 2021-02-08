package ai.dstack.server.jersey.resources.apps

import ai.dstack.server.jersey.resources.*
import ai.dstack.server.jersey.resources.attachmentNotFound
import ai.dstack.server.jersey.resources.frameNotFound
import ai.dstack.server.jersey.resources.malformedRequest
import ai.dstack.server.jersey.resources.payload.ExecutePayload
import ai.dstack.server.jersey.resources.payload.UpdateExecutionPayload
import ai.dstack.server.jersey.resources.stackNotFound
import ai.dstack.server.jersey.resources.stacks.parseStackPath
import ai.dstack.server.model.AccessLevel
import ai.dstack.server.model.Execution
import ai.dstack.server.services.*
import mu.KLogging
import java.util.*
import javax.inject.Inject
import javax.ws.rs.*
import javax.ws.rs.core.Context
import javax.ws.rs.core.HttpHeaders
import javax.ws.rs.core.Response

@Path("/apps")
class AppResources {
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
    private lateinit var executorService: ExecutorService

    @Inject
    private lateinit var executionService: ExecutionService

    companion object : KLogging() {
        val cachedPermissions: MutableSet<String> = mutableSetOf()
    }

    @POST
    @Path("/update")
    @Produces(JSON_UTF8)
    @Consumes(JSON_UTF8)
    fun update(payload: UpdateExecutionPayload?, @Context headers: HttpHeaders): Response {
        logger.debug { "payload: $payload" }
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val execution = executionService.get(payload!!.id!!)
            if (execution == null) {
                executionNotFound()
            } else {
                val permission = payload.id + "/" + headers.bearer.orEmpty()
                if (cachedPermissions.contains(permission)) {
                    update(execution, payload)
                } else {
                    val currentUser = headers.getCurrentUser()
                    return if (headers.bearer != null && currentUser == null) {
                        badCredentials()
                    } else {
                        val (u, s) = execution.stackPath.parseStackPath()
                        val stack = stackService.get(u, s)
                        if (stack != null) {
                            val owner = currentUser == stack.userName
                            val permitted = stack.accessLevel == AccessLevel.Public
                                    || owner
                                    || (stack.accessLevel == AccessLevel.Internal && currentUser != null)
                                    || (currentUser != null && permissionService.get(stack.path, currentUser) != null)
                            if (permitted) {
                                update(execution, payload)
                                cachedPermissions.add(permission)
                                ok()
                            } else {
                                badCredentials()
                            }
                        } else {
                            stackNotFound()
                        }
                    }
                }
            }
        }
    }

    private fun update(execution: Execution, payload: UpdateExecutionPayload): Response {
        executionService.update(execution.copy(tqdm = payload.tqdm ?: execution.tqdm))
        return ok()
    }

    @POST
    @Path("/execute")
    @Produces(JSON_UTF8)
    @Consumes(JSON_UTF8)
    fun execute(payload: ExecutePayload?, @Context headers: HttpHeaders): Response {
        logger.debug { "payload: $payload" }
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val stack = stackService.get(payload!!.user!!, payload.stack!!)
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
                                    val stackUser = userService.get(stack.userName)!!
                                    val id = UUID.randomUUID().toString()
                                    executionService.create(Execution(id, stack.path, null))
                                    val status = executorService.execute(id, stackUser, frame, attachment,
                                            payload.views, payload.apply == true)
                                    ok(status)
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
            val execution = executionService.get(id)
            if (execution != null) {
                val permission = id + "/" + headers.bearer.orEmpty()
                if (cachedPermissions.contains(permission)) {
                    poll(id, execution)
                } else {
                    val (u, s) = execution.stackPath.parseStackPath()
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
                                cachedPermissions.add(permission)
                                poll(id, execution)
                            } else {
                                badCredentials()
                            }
                        }
                    } else {
                        stackNotFound()
                    }
                }
            } else {
                executionNotFound()
            }
        }
    }

    private fun poll(id: String, execution: Execution): Response {
        val result = executorService.poll(id)
        return if (result != null) {
            ok(execution.tqdm?.let { result + ("tqdm" to it) } ?: result)
        } else {
            executionNotFound()
        }
    }
}

private val ExecutePayload?.isMalformed: Boolean
    get() {
        return this == null || this.user == null || this.stack == null || this.frame == null || this.attachment == null
    }

private val UpdateExecutionPayload?.isMalformed: Boolean
    get() {
        return this == null || this.id == null || (this.tqdm == null)
    }
