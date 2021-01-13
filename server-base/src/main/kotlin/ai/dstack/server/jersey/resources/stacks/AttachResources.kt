package ai.dstack.server.jersey.resources.stacks

import ai.dstack.server.services.*
import ai.dstack.server.jersey.resources.*
import ai.dstack.server.jersey.resources.frameNotFound
import ai.dstack.server.jersey.resources.malformedRequest
import ai.dstack.server.jersey.resources.ok
import ai.dstack.server.jersey.resources.stackNotFound
import ai.dstack.server.jersey.resources.status.AttachmentInfo
import ai.dstack.server.jersey.resources.status.GetAttachStatus
import mu.KLogging
import java.util.*
import javax.inject.Inject
import javax.ws.rs.*
import javax.ws.rs.container.ResourceContext
import javax.ws.rs.core.Context
import javax.ws.rs.core.Response

@Path("/attachs")
class AttachResources {
    @Context
    private lateinit var resourceContext: ResourceContext

    @Inject
    private lateinit var userService: UserService

    @Inject
    private lateinit var stackService: StackService

    @Inject
    private lateinit var frameService: FrameService

    @Inject
    private lateinit var attachmentService: AttachmentService

    @Inject
    private lateinit var fileService: FileService

    companion object : KLogging()

    private val PREVIEW_DATA_LENGTH = 100000L
    private val MAX_DATA_LENGTH = 1000000L

    @GET
    @Path("/{user}/{stack: .+}/{frame}/{attachment}")
    @Produces(JSON_UTF8)
    fun attachment(
        @PathParam("user") u: String?, @PathParam("stack") s: String?,
        @PathParam("frame") f: String?, @PathParam("attachment") a: Int?,
        @QueryParam("download") d: Boolean?
    ): Response {
        // TODO: Check permissions
        // TODO: Renew session if any
        logger.debug { "user: $u, stack: $s, frame: $f, attachment: $a, download: $d" }
        return if (u.isNullOrBlank() || s.isNullOrBlank() || f.isNullOrBlank() || a == null) {
            malformedRequest()
        } else {
            val stack = stackService.get(u, s)
            val user = userService.get(u)
            if (stack != null) {
                if (user != null) {
                    val frame = frameService.get(stack.path, f)
                    if (frame != null) {
                        val attachment = attachmentService.get(frame.path, a)
                        if (attachment != null) {
                            val data = if (attachment.length < MAX_DATA_LENGTH)
                                Base64.getEncoder().encodeToString(
                                        fileService.get(attachment.filePath)
                                ).toString()
                            else if (d != true)
                                Base64.getEncoder().encodeToString(
                                        fileService.preview(attachment.filePath,
                                        PREVIEW_DATA_LENGTH
                                    )
                                ).toString()
                            else
                                null
                            val downloadUrl = if (attachment.length >= MAX_DATA_LENGTH && d == true)
                                fileService.download(attachment.filePath, user, attachment.filename, attachment.contentType)
                            else
                                null
                            val preview = if (attachment.length >= MAX_DATA_LENGTH && d != true) true else null
                            // TODO: Move download url out of this API to a separate API
                            ok(
                                GetAttachStatus(
                                    AttachmentInfo(
                                        attachment.application,
                                        attachment.contentType,
                                        attachment.params,
                                        attachment.settings,
                                        attachment.length,
                                        attachment.description,
                                        data,
                                        downloadUrl?.toString(),
                                        preview,
                                        index = a
                                    )
                                ), downloadUrl == null
                            )
                        } else {
                            attachmentNotFound()
                        }
                    } else {
                        frameNotFound()
                    }
                } else {
                    userNotFound()
                }
            } else {
                stackNotFound()
            }
        }
    }
}