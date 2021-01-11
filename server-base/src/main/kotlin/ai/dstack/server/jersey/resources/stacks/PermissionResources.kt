package ai.dstack.server.jersey.resources.stacks

import ai.dstack.server.model.Permission
import ai.dstack.server.services.*
import ai.dstack.server.jersey.resources.*
import ai.dstack.server.jersey.resources.payload.UpdatePermissionPayload
import ai.dstack.server.jersey.resources.users.emailToVerificationCode
import mu.KLogging
import javax.inject.Inject
import javax.ws.rs.Consumes
import javax.ws.rs.POST
import javax.ws.rs.Path
import javax.ws.rs.Produces
import javax.ws.rs.container.ResourceContext
import javax.ws.rs.core.Context
import javax.ws.rs.core.HttpHeaders
import javax.ws.rs.core.Response

@Path("/permissions")
class PermissionResources {
    @Context
    private lateinit var resourceContext: ResourceContext

    @Inject
    private lateinit var userService: UserService

    @Inject
    private lateinit var sessionService: SessionService

    @Inject
    private lateinit var stackService: StackService

    @Inject
    private lateinit var permissionService: PermissionService

    @Inject
    private lateinit var emailService: EmailService

    @Inject
    private lateinit var config: AppConfig

    companion object : KLogging()

    @POST
    @Path("add")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun addPermission(payload: UpdatePermissionPayload?, @Context headers: HttpHeaders): Response {
        logger.debug { "payload: $payload" }
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val session = headers.bearer?.let { sessionService.get(it) }
            val user = session?.let { userService.get(it.userName) }
            val (userNameOrEmail, invitedUser) = if (payload!!.user != null) {
                val invitedUser = userService.get(payload.user!!)
                Pair(invitedUser?.name, invitedUser)
            } else {
                val invitedUser = userService.findByEmail(payload.email!!)
                Pair(invitedUser?.name ?: payload.email, invitedUser)
            }
            if (session == null || !session.valid || user == null) {
                badCredentials()
            } else if (!user.verified) {
                userNotVerified()
            } else if (userNameOrEmail == null) {
                userNotFound()
            } else {
                val (u, obj) = payload.path!!.parseStackPath()
                val stack = stackService.get(u, obj)
                when {
                    stack == null -> stackNotFound()
                    u != user.name -> badCredentials()
                    else -> {
                        sessionService.renew(session)
                        val p = permissionService.get(payload.path, userNameOrEmail)
                        if (p == null && user.name != payload.user) {
                            val permission = Permission(payload.path, userNameOrEmail)
                            permissionService.add(permission)
                            if (config.emailEnabled) {
                                // TODO: Send invite emails with a 1 minute delay (via SQS)
                                if (invitedUser != null) {
                                    emailService.sendInviteEmail(user, payload.path, invitedUser)
                                } else {
                                    emailService.sendInviteEmail(
                                        user, payload.path, permission.emailOrThrow,
                                        permission.emailOrThrow.emailToVerificationCode
                                    )
                                }
                            }
                        }
                        ok()
                    }
                }
            }
        }
    }

    @POST
    @Path("delete")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun deletePermission(payload: UpdatePermissionPayload?, @Context headers: HttpHeaders): Response {
        logger.debug { "payload: $payload" }
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val session = headers.bearer?.let { sessionService.get(it) }
            val user = session?.let { userService.get(it.userName) }
            if (session == null || !session.valid || user == null) {
                badCredentials()
            } else if (!user.verified) {
                userNotVerified()
            } else {
                val (u, obj) = payload!!.path!!.parseStackPath()
                val stack = stackService.get(u, obj)
                when {
                    stack == null -> stackNotFound()
                    u != user.name -> badCredentials()
                    else -> {
                        sessionService.renew(session)
                        val p = if (payload.user != null)
                            permissionService.get(payload.path!!, payload.user)
                        else
                            permissionService.get(payload.path!!, payload.email!!) ?: userService.findByEmail(payload.email)
                                ?.let {
                                    permissionService.get(payload.path, it.name)
                                }

                        if (p != null) {
                            permissionService.delete(p)
                        }
                        ok()
                    }
                }
            }
        }
    }
}