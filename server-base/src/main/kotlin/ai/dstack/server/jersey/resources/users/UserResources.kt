package ai.dstack.server.jersey.resources.users

import ai.dstack.server.model.*
import ai.dstack.server.services.*
import ai.dstack.server.jersey.resources.*
import ai.dstack.server.jersey.resources.badCredentials
import ai.dstack.server.jersey.resources.malformedRequest
import ai.dstack.server.jersey.resources.ok
import ai.dstack.server.jersey.resources.payload.*
import ai.dstack.server.jersey.resources.status.*
import ai.dstack.server.jersey.resources.userAlreadyExists
import ai.dstack.server.jersey.resources.userEmailAlreadyRegistered
import ai.dstack.server.jersey.resources.userExists
import ai.dstack.server.jersey.resources.userNotFound
import ai.dstack.server.jersey.resources.userNotVerified
import mu.KLogging
import java.security.SecureRandom
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*
import java.util.stream.Collectors
import javax.inject.Inject
import javax.ws.rs.*
import javax.ws.rs.container.ResourceContext
import javax.ws.rs.core.Context
import javax.ws.rs.core.HttpHeaders
import javax.ws.rs.core.Response


@Path("/users")
class UserResources {
    @Context
    private lateinit var resourceContext: ResourceContext

    @Inject
    private lateinit var userService: UserService

    @Inject
    private lateinit var newsletterService: NewsletterService

    @Inject
    private lateinit var sessionService: SessionService

    @Inject
    private lateinit var emailService: EmailService

    @Inject
    private lateinit var permissionService: PermissionService

    @Inject
    private lateinit var config: AppConfig

    companion object : KLogging()

    @POST
    @Path("/info")
    @Produces(JSON_UTF8)
    @Consumes(JSON_UTF8)
    fun info(payload: InfoPayload?, @Context headers: HttpHeaders): Response {
        logger.debug { "payload: $payload" }
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val u = payload?.user
            val user = headers.bearer?.let { userService.findByToken(it) }
            if (user == null || user.name != u || !user.verified) {
                badCredentials()
            } else {
                ok(UserStatus(user.name, user.token, user.email, user.verified,
                        SettingsInfo(
                                GeneralInfo(user.settings.general.defaultAccessLevel.name.toLowerCase())
                        ),
                        user.createdDate.toString(),
                        user.role.code,
                        null
                ))
            }
        }
    }

    @GET
    @Path("/login")
    @Produces(JSON_UTF8)
    fun login(@QueryParam("user") userName: String?, @QueryParam("password") password: String?): Response {
        logger.debug { "user: $userName" }
        return if (userName.isNullOrBlank() || password.isNullOrBlank()) {
            malformedRequest()
        } else {
            val user = userService.get(userName) ?: userService.findUnverified(userName, password = password)
            if (user != null && user.password == password) {
                val session = createSession(user)
                ok(AuthStatus(session.id, user.verified))
            } else {
                badCredentials()
            }
        }
    }

    @POST
    @Path("/register")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun register(payload: RegisterPayload?): Response {
        logger.debug { "payload: ${payload?.copy(password = "(hidden)")}" }
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            var user = userService.get(payload!!.name!!)
            if (user != null && user.verified) {
                userAlreadyExists()
            } else {
                user = userService.findByEmail(payload.email!!)
                if (user != null && user.verified) {
                    userEmailAlreadyRegistered()
                } else {
                    try {
                        val verified = payload.code != null || emailService is NonAvailable
                        if (verified && payload.code != payload.email.emailToVerificationCode) {
                            badCredentials()
                        } else {
                            val verificationCode = payload.code ?: UUID.randomUUID().toString()
                            val token = UUID.randomUUID().toString()
                            val userNamePostfix = if (!verified) "?$verificationCode" else ""
                            user = User(
                                    payload.name!! + userNamePostfix,
                                    payload.email,
                                    payload.password!!,
                                    token,
                                    verificationCode,
                                    verified,
                                    // TODO: Reconsider registration after introducing user management
                                    UserRole.Write,
                                    LocalDate.now(ZoneOffset.UTC),
                                    Settings(
                                            General(AccessLevel.Public)
                                    ),
                                    payload.name
                            )
                            userService.create(user)
                            if (verified) {
                                replaceEmailPermissionsWithUserPermissions(user)
                            } else {
                                emailService.sendVerificationEmail(user)
                            }
                            val session = createSession(user)
                            ok(
                                    AuthStatus(
                                            session.id,
                                            user.verified
                                    )
                            )
                        }
                    } catch (e: EntityAlreadyExists) {
                        userAlreadyExists()
                    }
                }
            }
        }
    }

    private fun replaceEmailPermissionsWithUserPermissions(user: User) {
        if (user.email != null) {
            val permissions = permissionService.findByIdentity(user.email)
            permissions.forEach { p ->
                permissionService.delete(p)
                permissionService.add(Permission(p.path, user.name))
            }
        }
    }

    @GET
    @Path("/verify")
    @Produces(JSON_UTF8)
    fun verify(@QueryParam("user") userName: String?, @QueryParam("code") verificationCode: String?): Response {
        logger.debug { "user: $userName" }
        return if (userName.isNullOrBlank() || verificationCode.isNullOrBlank()) {
            malformedRequest()
        } else {
            val unverifiedUser = userService.findUnverified(userName, verificationCode = verificationCode)
            if (unverifiedUser != null && !unverifiedUser.verified) {
                try {
                    val verifiedUser = User(
                            userName,
                            unverifiedUser.email,
                            unverifiedUser.password,
                            unverifiedUser.token,
                            unverifiedUser.verificationCode,
                            true,
                            unverifiedUser.role,
                            LocalDate.now(ZoneOffset.UTC),
                            unverifiedUser.settings,
                            userName
                    )
                    userService.create(verifiedUser)
                    userService.delete(unverifiedUser)
                    newsletterService.subscribe(verifiedUser)
                    val session = createSession(verifiedUser)
                    ok(AuthStatus(session.id, true))
                } catch (e: EntityAlreadyExists) {
                    userAlreadyExists()
                }
            } else if (unverifiedUser != null && unverifiedUser.verified) {
                val session = createSession(unverifiedUser)
                ok(AuthStatus(session.id, true))
            } else {
                badCredentials()
            }
        }
    }

    private fun createSession(user: User): Session {
        val expireAt = LocalDateTime.now(ZoneOffset.UTC).plusMinutes(60).toEpochSecond(ZoneOffset.UTC)
        val session = Session(UUID.randomUUID().toString(), user.name, expireAt)
        sessionService.create(session)
        return session
    }

    @GET
    @Path("/logout")
    @Produces(JSON_UTF8)
    fun logout(@Context headers: HttpHeaders): Response {
        val session = headers.bearer?.let { sessionService.get(it) }
        logger.debug { "session: ${headers.bearer}" }
        val now = LocalDateTime.now(ZoneOffset.UTC).toEpochSecond(ZoneOffset.UTC)
        if (session != null && session.expiresAtEpochSecond > now) {
            sessionService.update(session.copy(expiresAtEpochSecond = now))
        }
        return ok()
    }

    @POST
    @Path("update/token")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun createToken(payload: UpdateTokenPayload?, @Context headers: HttpHeaders): Response {
        logger.debug { "payload: $payload" }
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val user = userService.get(payload!!.user!!)
            val session = headers.bearer?.let { sessionService.get(it) }
            if (user == null) {
                userNotFound()
            } else if (!user.verified) {
                userNotVerified()
            } else if (session == null || session.userName != user.name || !session.valid) {
                badCredentials()
            } else {
                sessionService.renew(session)
                val newToken = UUID.randomUUID().toString()
                userService.update(user.copy(token = newToken))
                ok(UpdateTokenStatus(newToken))
            }
        }
    }

    @GET
    @Path("remember")
    @Produces(JSON_UTF8)
    fun remember(@Context headers: HttpHeaders): Response {
        val session = headers.bearer?.let { sessionService.get(it) }
        val user = session?.let { userService.get(it.userName) }
        logger.debug { "session: ${headers.bearer}" }
        return if (session == null || !session.valid || user == null) {
            badCredentials()
        } else {
            sessionService.renew(session)
            val userName = if (user.verified) user.name else user.name.substringBefore("?")
            ok(
                    SessionStatus(
                            userName,
                            user.token,
                            user.email,
                            user.verified,
                            SettingsInfo(
                                    GeneralInfo(user.settings.general.defaultAccessLevel.name.toLowerCase())
                            ),
                            user.role.code
                    )
            )
        }
    }

    @GET
    @Path("reset")
    @Produces(JSON_UTF8)
    fun requestReset(@QueryParam("email") email: String?): Response {
        logger.debug { "reset password: $email" }
        return if (email.isNullOrBlank()) {
            malformedRequest()
        } else {
            val user = userService.findByEmail(email)
            if (user == null) {
                userNotFound()
            } else if (!user.verified) {
                userNotVerified()
            } else {
                if (emailService !is NonAvailable) {
                    emailService.sendResetEmail(user)
                }
                ok(OpStatus())
            }
        }
    }

    @POST
    @Path("update/password")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun applyReset(payload: ResetPasswordPayload?): Response {
        logger.debug { "reset password: $payload" }
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val user = userService.findByEmail(payload!!.email!!)
            if (user == null) {
                userNotFound()
            } else if (!user.verified) {
                userNotVerified()
            } else if (user.verificationCode != payload.code) {
                badCredentials()
            } else {
                val u = user.copy(password = payload.password!!)
                userService.update(u)
                val session = createSession(u)
                ok(AuthStatus(session.id, u.verified))
            }
        }
    }

    @POST
    @Path("update/settings")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun applyReset(payload: UpdateSettingsPayload?, @Context headers: HttpHeaders): Response {
        logger.debug { "payload: $payload" }
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val user = userService.get(payload!!.user!!)
            val session = headers.bearer?.let { sessionService.get(it) }
            if (user == null) {
                userNotFound()
            } else if (!user.verified) {
                userNotVerified()
            } else if (session == null || session.userName != user.name || !session.valid) {
                badCredentials()
            } else {
                sessionService.renew(session)
                userService.update(
                        user.copy(
                                settings = user.settings.copy(
                                        general = user.settings.general.copy(
                                                defaultAccessLevel =
                                                when (payload.general?.defaultAccessLevel) {
                                                    "private" -> AccessLevel.Private
                                                    "internal" -> AccessLevel.Internal
                                                    "public" -> AccessLevel.Public
                                                    else -> user.settings.general.defaultAccessLevel
                                                }
                                        )
                                )
                        )
                )
                ok()
            }
        }
    }

    @GET
    @Path("exists/{user}")
    @Produces(JSON_UTF8)
    fun exists(@PathParam("user") u: String?, @Context headers: HttpHeaders): Response {
        logger.debug { "user: $u" }
        return if (u.isNullOrBlank()) {
            malformedRequest()
        } else {
            val session = headers.bearer?.let { sessionService.get(it) }
            if (session == null || !session.valid) {
                badCredentials()
            } else {
                userExists(userService.get(u) != null)
            }
        }
    }

    @GET
    @Path("admin/list")
    @Produces(JSON_UTF8)
    fun users(@Context headers: HttpHeaders): Response {
        val session = headers.bearer?.let { sessionService.get(it) }
        val user = session?.let { userService.get(it.userName) }
        logger.debug { "session: ${headers.bearer}" }
        return if (session == null || !session.valid || user == null || user.role != UserRole.Admin) {
            badCredentials()
        } else {
            sessionService.renew(session)
            val users = userService.findAll()
            ok(UsersStatus(users.map {
                UserStatus(it.name, it.token, it.email, it.verified,
                        SettingsInfo(
                                GeneralInfo(it.settings.general.defaultAccessLevel.name.toLowerCase())
                        ),
                        it.createdDate.toString(),
                        it.role.code,
                        it.verificationCode
                )
            }.toList()))
        }
    }

    @POST
    @Path("admin/create")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun create(payload: CreateUserPayload?, @Context headers: HttpHeaders): Response {
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val session = headers.bearer?.let { sessionService.get(it) }
            val u = session?.let { userService.get(it.userName) }
            logger.debug { "session: ${headers.bearer}" }
            return if (session == null || !session.valid || u == null || u.role != UserRole.Admin) {
                badCredentials()
            } else {
                var user = userService.get(payload!!.name!!)
                if (user != null && user.verified) {
                    userAlreadyExists()
                } else {
                    user = if (!payload.email.isNullOrBlank()) userService.findByEmail(payload.email) else null
                    if (user != null && user.verified) {
                        userEmailAlreadyRegistered()
                    } else {
                        try {
                            sessionService.renew(session)
                            val verificationCode = UUID.randomUUID().toString()
                            val token = UUID.randomUUID().toString()
                            val password = getRandomSpecialChars(8)
                            user = User(
                                    payload.name!!,
                                    if (!payload.email.isNullOrBlank()) payload.email else null,
                                    password,
                                    token,
                                    verificationCode,
                                    true,
                                    UserRole.Write,
                                    LocalDate.now(ZoneOffset.UTC),
                                    Settings(
                                            General(AccessLevel.Public)
                                    ),
                                    payload.name
                            )
                            userService.create(user)
                            if (config.emailEnabled && user.email != null) {
                                emailService.sendVerificationEmail(user)
                            }
                            ok(UserStatus(user.name, user.token, user.email, user.verified,
                                    SettingsInfo(
                                            GeneralInfo(user.settings.general.defaultAccessLevel.name.toLowerCase())
                                    ),
                                    user.createdDate.toString(),
                                    user.role.code,
                                    user.verificationCode
                            ))
                        } catch (e: EntityAlreadyExists) {
                            userAlreadyExists()
                        }
                    }
                }
            }
        }
    }

    fun getRandomSpecialChars(count: Int): String {
        val random: Random = SecureRandom()
        val specialChars = random.ints(count.toLong(), 33, 45)
        return String(specialChars.mapToObj<Char> { data: Int -> data.toChar() }.collect(Collectors.toList()).toCharArray())
    }

    @POST
    @Path("admin/reset")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun reset(payload: ResetVerificationCodePayload?, @Context headers: HttpHeaders): Response {
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val session = headers.bearer?.let { sessionService.get(it) }
            val u = session?.let { userService.get(it.userName) }
            logger.debug { "session: ${headers.bearer}" }
            return if (session == null || !session.valid || u == null || u.role != UserRole.Admin) {
                badCredentials()
            } else {
                var user = userService.get(payload!!.name!!)
                if (user == null) {
                    userNotFound()
                } else {
                    sessionService.renew(session)
                    val verificationCode = UUID.randomUUID().toString()
                    user = user.copy(verificationCode = verificationCode)
                    userService.update(user)
                    if (config.emailEnabled && user.email != null) {
                        emailService.sendVerificationEmail(user)
                    }
                    ok(UserStatus(user.name, user.token, user.email, user.verified,
                            SettingsInfo(
                                    GeneralInfo(user.settings.general.defaultAccessLevel.name.toLowerCase())
                            ),
                            user.createdDate.toString(),
                            user.role.code,
                            user.verificationCode
                    ))
                }
            }
        }

    }

    @POST
    @Path("admin/edit")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun reset(payload: EditUserPayload?, @Context headers: HttpHeaders): Response {
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val session = headers.bearer?.let { sessionService.get(it) }
            val u = session?.let { userService.get(it.userName) }
            logger.debug { "session: ${headers.bearer}" }
            return if (session == null || !session.valid || u == null || u.role != UserRole.Admin) {
                badCredentials()
            } else {
                var user = userService.get(payload!!.name!!)
                if (user == null) {
                    userNotFound()
                } else {
                    sessionService.renew(session)
                    user = user.copy(email = payload.email?.let { if (it.isBlank()) null else it } ?: user.email,
                            role = payload.role?.let { UserRole.fromCode(it) } ?: user.role)
                    userService.update(user)
                    if (config.emailEnabled && !payload.email.isNullOrBlank()) {
                        emailService.sendVerificationEmail(user)
                    }
                    ok(UserStatus(user.name, user.token, user.email, user.verified,
                            SettingsInfo(
                                    GeneralInfo(user.settings.general.defaultAccessLevel.name.toLowerCase())
                            ),
                            user.createdDate.toString(),
                            user.role.code,
                            user.verificationCode
                    ))
                }
            }
        }

    }

    @POST
    @Path("admin/delete")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun delete(payload: DeleteUserPayload?, @Context headers: HttpHeaders): Response {
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val session = headers.bearer?.let { sessionService.get(it) }
            val u = session?.let { userService.get(it.userName) }
            logger.debug { "session: ${headers.bearer}" }
            return if (session == null || !session.valid || u == null || u.role != UserRole.Admin) {
                badCredentials()
            } else {
                val user = userService.get(payload!!.name!!)
                if (user == null) {
                    userNotFound()
                } else {
                    sessionService.renew(session)
                    userService.delete(user)
                    ok()
                }
            }
        }
    }
}

val InfoPayload?.isMalformed get() = this?.user.isNullOrBlank()

val RegisterPayload?.isMalformed
    get() = this == null
            || this.name.isMalformedUserName
            || this.email.isMalformedEmail
            || this.password.isNullOrBlank()
            || this.plan.isMalformedPlan

val CreateUserPayload?.isMalformed
    get() = this == null
            || this.name.isMalformedUserName
            || this.role == null

val DeleteUserPayload?.isMalformed
    get() = this == null
            || this.name.isMalformedUserName

val ResetVerificationCodePayload?.isMalformed
    get() = this == null
            || this.name.isMalformedUserName

val EditUserPayload?.isMalformed
    get() = this == null
            || this.name.isMalformedUserName
            || (this.email == null && this.role == null)
            || (this.role != null && UserRole.values().map { it.name.toUpperCase() }.contains(this.role.toUpperCase()))

val String?.isMalformedEmail: Boolean
    get() {
        // https://stackoverflow.com/questions/1819142/how-should-i-validate-an-e-mail-address
        return isNullOrBlank() || !this!!.matches(
                "^(?:[a-zA-Z0-9!#\$%&'*+/=?^_`{|}~-]+(?:\\.[a-zA-Z0-9!#\$%&'*+/=?^_`{|}~-]+)*|\"(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21\\x23-\\x5b\\x5d-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])*\")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x21-\\x5a\\x53-\\x7f]|\\\\[\\x01-\\x09\\x0b\\x0c\\x0e-\\x7f])+)])$".toRegex()
        )
    }

private val supportedPlans = setOf("free", "team")

val String?.isMalformedPlan: Boolean
    get() {
        return this != null && !supportedPlans.contains(this)
    }

// TODO: Make it more secure
val String.emailToVerificationCode: String
    get() = UUID.nameUUIDFromBytes((this).toByteArray()).toString()

val String?.isMalformedUserName: Boolean
    get() {
        return this == null
                || !matches("^[a-zA-Z0-9-_]{3,24}\$".toRegex())
                || contains("-{2,}".toRegex())
                || startsWith("-")
                || endsWith("-")
    }

val UpdateTokenPayload?.isMalformed
    get() = this?.user.isNullOrBlank()

val UpdateSettingsPayload?.isMalformed
    get() = (
            this == null || this.user == null
            )
            || (this.general?.defaultAccessLevel != null && !setOf(
            "private",
            "public"
    ).contains(this.general.defaultAccessLevel))
            || this.general?.defaultAccessLevel == null

val ResetPasswordPayload?.isMalformed
    get() = this?.email.isNullOrBlank() || this?.password.isNullOrBlank() || this?.code.isNullOrBlank()
