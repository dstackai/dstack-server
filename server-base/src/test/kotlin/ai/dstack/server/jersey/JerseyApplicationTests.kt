package ai.dstack.server.jersey

import ai.dstack.server.jersey.jackson.API_MAPPER
import ai.dstack.server.jersey.jackson.createEmptyJsonObject
import ai.dstack.server.jersey.resources.payload.*
import ai.dstack.server.jersey.resources.status.*
import ai.dstack.server.jersey.services.*
import ai.dstack.server.model.*
import ai.dstack.server.services.*
import com.fasterxml.jackson.databind.JsonNode
import com.google.common.truth.Truth
import org.glassfish.hk2.utilities.binding.AbstractBinder
import org.glassfish.jersey.test.JerseyTest
import org.junit.Test
import org.mockito.Mockito
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*
import javax.ws.rs.client.Entity
import javax.ws.rs.core.Application
import javax.ws.rs.core.HttpHeaders
import javax.ws.rs.core.MediaType
import javax.ws.rs.core.Response


// TODO: Implement more tests – ideally for all APIs
class JerseyApplicationTests : JerseyTest() {
    private lateinit var appConfig: AppConfig
    private lateinit var emailService: EmailService
    private lateinit var permissionService: PermissionService
    private lateinit var analyticsService: AnalyticsService
    private lateinit var newsletterService: NewsletterService

    private lateinit var stackService: InMemoryStackService
    private lateinit var frameService: InMemoryFrameService
    private lateinit var attachmentService: InMemoryAttachmentService
    private lateinit var fileService: InMemoryFileService
    private lateinit var userService: InMemoryUserService
    private lateinit var sessionService: InMemorySessionService

    override fun configure(): Application {
        appConfig = Mockito.mock(AppConfig::class.java)
        emailService = Mockito.mock(EmailService::class.java)
        permissionService = Mockito.mock(PermissionService::class.java)
        analyticsService = Mockito.mock(AnalyticsService::class.java)
        newsletterService = Mockito.mock(NewsletterService::class.java)

        stackService = InMemoryStackService()
        frameService = InMemoryFrameService()
        attachmentService = InMemoryAttachmentService()
        fileService = InMemoryFileService()
        userService = InMemoryUserService()
        sessionService = InMemorySessionService()

        return JerseyApplication.resourceConfig
                .register(object : AbstractBinder() {
                    override fun configure() {
                        bind(appConfig).to(AppConfig::class.java)
                        bind(stackService).to(StackService::class.java)
                        bind(sessionService).to(SessionService::class.java)
                        bind(frameService).to(FrameService::class.java)
                        bind(attachmentService).to(AttachmentService::class.java)
                        bind(emailService).to(EmailService::class.java)
                        bind(fileService).to(FileService::class.java)
                        bind(permissionService).to(PermissionService::class.java)
                        bind(analyticsService).to(AnalyticsService::class.java)
                        bind(newsletterService).to(NewsletterService::class.java)

                        bind(userService).to(UserService::class.java)
                        bind(sessionService).to(SessionService::class.java)
                    }
                })
    }

    override fun setUp() {
        super.setUp()
        Mockito.reset(
                appConfig,
                emailService,
                permissionService,
                analyticsService,
                newsletterService
        )

        stackService.reset()
        frameService.reset()
        attachmentService.reset()
        fileService.reset()
        userService.reset()
        sessionService.reset()
    }

    @Test
    fun testUsers() {
        val registerResponse = target("/users/register")
                .request()
                .post(
                        Entity.json(
                                RegisterPayload(
                                        name = "test_user",
                                        email = "test@gmail.com",
                                        password = "pass"
                                )
                        )
                )
        Truth.assertThat(registerResponse.status).isEqualTo(Response.Status.OK.statusCode)
        val registeredAuthStatus = registerResponse.entity<AuthStatus>()
        Truth.assertThat(registeredAuthStatus.verified).isFalse()
        Truth.assertThat(sessionService.get(registeredAuthStatus.session)?.valid).isTrue()

        val unverifiedUser = userService.findUnverified("test_user", password = "pass")

        verifyThat(emailService).executedOnce { sendVerificationEmail(equalTo(unverifiedUser!!)) }

        val loginResponse = target("/users/login")
                .queryParam("user", "test_user")
                .queryParam("password", "pass")
                .request()
                .get()
        Truth.assertThat(loginResponse.status).isEqualTo(Response.Status.OK.statusCode)
        val loggedInAuthStatus = loginResponse.entity<AuthStatus>()
        Truth.assertThat(loggedInAuthStatus.verified).isFalse()
        Truth.assertThat(sessionService.get(loggedInAuthStatus.session)?.valid).isTrue()

        Truth.assertThat(unverifiedUser).isNotNull()
        val verifyResponse = target("/users/verify")
                .queryParam("user", "test_user")
                .queryParam("code", unverifiedUser!!.verificationCode)
                .request()
                .get()
        Truth.assertThat(verifyResponse.status).isEqualTo(Response.Status.OK.statusCode)
        val verifyResponseAuthStatus = verifyResponse.entity<AuthStatus>()
        Truth.assertThat(verifyResponseAuthStatus.verified).isTrue()
        Truth.assertThat(sessionService.get(loggedInAuthStatus.session)?.valid).isTrue()

        val verifiedUser = userService.findUnverified("test_user", password = "pass")
        Truth.assertThat(verifiedUser!!.token).isEqualTo(unverifiedUser.token)

        val loginVerifiedResponse = target("/users/login")
                .queryParam("user", "test_user")
                .queryParam("password", "pass")
                .request()
                .get()
        Truth.assertThat(loginVerifiedResponse.status).isEqualTo(Response.Status.OK.statusCode)
        val loggedInVerifiedAuthStatus = loginVerifiedResponse.entity<AuthStatus>()
        Truth.assertThat(loggedInVerifiedAuthStatus.verified).isTrue()
        Truth.assertThat(sessionService.get(loggedInVerifiedAuthStatus.session)?.valid).isTrue()

        val rememberResponse = target("/users/remember")
                .request()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + loggedInVerifiedAuthStatus.session)
                .get()
        Truth.assertThat(rememberResponse.status).isEqualTo(Response.Status.OK.statusCode)
        val rememberResponseSessionStatus = rememberResponse.entity<SessionStatus>()
        Truth.assertThat(rememberResponseSessionStatus.user).isEqualTo("test_user")
        Truth.assertThat(rememberResponseSessionStatus.email).isEqualTo("test@gmail.com")
        Truth.assertThat(rememberResponseSessionStatus.settings.general.defaultAccessLevel).isEqualTo("public")
        Truth.assertThat(rememberResponseSessionStatus.token).isEqualTo(verifiedUser.token)
        Truth.assertThat(rememberResponseSessionStatus.verified).isTrue()

        val infoResponse = target("/users/info")
                .request()
                .header(HttpHeaders.AUTHORIZATION, "Bearer ${verifiedUser.token}")
                .post(
                        Entity.json(
                                InfoPayload(
                                        user = "test_user"
                                )
                        )
                )
        Truth.assertThat(infoResponse.status).isEqualTo(Response.Status.OK.statusCode)
        val infoUserStatus = infoResponse.entity<UserStatus>()
        Truth.assertThat(infoUserStatus.user).isEqualTo("test_user")
        Truth.assertThat(infoUserStatus.email).isEqualTo("test@gmail.com")
        Truth.assertThat(infoUserStatus.settings.general.defaultAccessLevel).isEqualTo("public")
        Truth.assertThat(infoUserStatus.token).isEqualTo(verifiedUser.token)
        Truth.assertThat(infoUserStatus.createdDate).isEqualTo(LocalDate.now().toString())
        Truth.assertThat(infoUserStatus.verified).isTrue()

        val logoutResponse = target("/users/logout")
                .request()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + loggedInVerifiedAuthStatus.session)
                .get()
        Truth.assertThat(logoutResponse.status).isEqualTo(Response.Status.OK.statusCode)
        Truth.assertThat(logoutResponse.json).isEqualTo(API_MAPPER.createEmptyJsonObject())
        Truth.assertThat(sessionService.get(loggedInVerifiedAuthStatus.session)?.valid).isFalse()
    }

    @Test
    fun testStacks() {
        val testUser = User(
                "test_user", "test@gmail.com", "test",
                "test_token", "test_code", true, UserRole.Admin,
                LocalDate.now(), Settings(General(AccessLevel.Public)), "test_user"
        )
        userService.create(testUser)

        val testSession = Session(
                "test_session", "test_user", LocalDateTime.now(ZoneOffset.UTC).plusMinutes(60).toEpochSecond(ZoneOffset.UTC)
        )
        sessionService.create(testSession)

        val accessResponse: Response = target("/stacks/access").request()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + testUser.token)
                .post(
                        Entity.json(
                                AccessPayload("test_user/test_stack")
                        )
                )
        Truth.assertThat(accessResponse.status).isEqualTo(Response.Status.OK.statusCode)
        Truth.assertThat(accessResponse.entity<OpStatus>()).isEqualTo(OpStatus())

        val frameId = UUID.randomUUID().toString()

        val testData = "Some data".toByteArray()
        val pushPayloadAttach = PushPayloadAttachment(
                contentType = "text/plain",
                application = null,
                data = Base64.getEncoder().encodeToString(testData).toString(),
                length = testData.count().toLong(),
                description = "Test description",
                params = mapOf(
                        "test_attach_param" to "test_attach_param_value"
                ),
                settings = mapOf(
                        "test_setting" to "test_setting_value"
                )
        )
        val pushPayload = PushPayload("test_user/test_stack", frameId,
                timestamp = System.currentTimeMillis(),
                contentType = null,
                application = null,
                attachments = listOf(pushPayloadAttach),
                params = mapOf(
                        "test_param" to "test_param_value"
                ),
                index = null,
                size = null,
                settings = mapOf(
                        "python" to "3.8"
                )
        )
        val pushResponse: Response = target("/stacks/push").request()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + testUser.token)
                .post(
                        pushPayload.json
                )
        Truth.assertThat(pushResponse.status).isEqualTo(Response.Status.OK.statusCode)
        val pushStatus = pushResponse.entity<PushStatus>()
        Truth.assertThat(pushStatus.url).isNotEmpty()

        val frameResponse = target("/frames/test_user/test_stack/$frameId").request()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + testUser.token)
                .get()
        Truth.assertThat(frameResponse.status).isEqualTo(Response.Status.OK.statusCode)
        Truth.assertThat(frameResponse.entity<GetFrameStatus>())
                .isEqualTo(GetFrameStatus(FrameInfo(frameId,
                        pushPayload.timestamp!!,
                        listOf(AttachmentInfo(
                                pushPayloadAttach.application,
                                pushPayloadAttach.contentType!!,
                                pushPayloadAttach.params!!,
                                pushPayloadAttach.settings!!,
                                pushPayloadAttach.length!!,
                                pushPayloadAttach.description!!,
                                data = null, downloadUrl = null, preview = null,
                                index = null)),
                        pushPayload.params!!,
                        pushPayload.settings!!))
                )

        val updateStackPayload = UpdateStackPayload("test_user/test_stack",
                null,
                null,
                null,
                "Some readme"
        )
        val updateStackResponse: Response = target("/stacks/update").request()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + testSession.id)
                .post(
                        updateStackPayload.json
                )
        Truth.assertThat(updateStackResponse.status).isEqualTo(Response.Status.OK.statusCode)

        // TODO: Fix issues
        /*val getStackResponse = target("/stacks/test_user/test_stack").request()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + testSession.id)
                .get()
        Truth.assertThat(getStackResponse.status).isEqualTo(Response.Status.OK.statusCode)
        Truth.assertThat(getStackResponse.entity<GetStackStatus>())
                .isEqualTo(GetStackStatus(StackInfo(
                        "test_user",
                        "test_stack",
                        false,
                        FrameInfo(frameId,
                                pushPayload.timestamp!!,
                                listOf(AttachmentInfo(pushPayloadAttach.description,
                                        "unknown",
                                        pushPayloadAttach.application,
                                        pushPayloadAttach.contentType!!,
                                        pushPayloadAttach.params!!,
                                        pushPayloadAttach.settings!!,
                                        pushPayloadAttach.length!!,
                                        data = null, downloadUrl = null, preview = null,
                                        index = null)),
                                pushPayload.params!!,
                                pushPayload.message),
                        "Some readme",
                        null,
                        emptyList(),
                        listOf(BasicFrameInfo(frameId, pushPayload.timestamp!!, pushPayloadAttach.params!!, null))
                ))
                )*/
    }

    /**
     * Important. Entity.json for some unknown reason doesn'y play nicely with Jackson's JsonProperty annotation and
     * results in wrong JSON serialization.
     * This is a workaround until the prroblem with Enity.json is solved.
     */
    private val Any.json: Entity<ByteArray>
        get() {
            return Entity.entity(API_MAPPER.writeValueAsBytes(this), MediaType.APPLICATION_JSON_TYPE)
        }

    private val Response.json: JsonNode
        get() = readEntity(JsonNode::class.java)

    private inline fun <reified T> Response.entity(): T {
        return API_MAPPER.readValue(readEntity(String::class.java), T::class.java)
    }
}