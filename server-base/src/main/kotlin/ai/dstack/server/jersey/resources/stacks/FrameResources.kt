package ai.dstack.server.jersey.resources.stacks

import ai.dstack.server.services.*
import ai.dstack.server.jersey.resources.*
import ai.dstack.server.jersey.resources.frameNotFound
import ai.dstack.server.jersey.resources.malformedRequest
import ai.dstack.server.jersey.resources.ok
import ai.dstack.server.jersey.resources.stackNotFound
import ai.dstack.server.jersey.resources.status.AttachmentInfo
import ai.dstack.server.jersey.resources.status.FrameInfo
import ai.dstack.server.jersey.resources.status.GetFrameStatus
import mu.KLogging
import javax.inject.Inject
import javax.ws.rs.GET
import javax.ws.rs.Path
import javax.ws.rs.PathParam
import javax.ws.rs.Produces
import javax.ws.rs.container.ResourceContext
import javax.ws.rs.core.Context
import javax.ws.rs.core.Response

@Path("/frames")
class FrameResources {
    @Context
    private lateinit var resourceContext: ResourceContext

    @Inject
    private lateinit var stackService: StackService

    @Inject
    private lateinit var frameService: FrameService

    @Inject
    private lateinit var attachmentService: AttachmentService

    companion object : KLogging()

    @GET
    @Path("/{user}/{stack: .+}/{frame}")
    @Produces(JSON_UTF8)
    fun frame(
            @PathParam("user") u: String?, @PathParam("stack") s: String?,
            @PathParam("frame") f: String?
    ): Response {
        // TODO: Check permissions
        // TODO: Renew session if any
        logger.debug { "user: $u, stack: $s, frame: $f" }
        return if (u.isNullOrBlank() || s.isNullOrBlank() || f.isNullOrBlank()) {
            malformedRequest()
        } else {
            val stack = stackService.get(u, s)
            if (stack != null) {
                val frame = frameService.get(stack.path, f)
                if (frame != null) {
                    val attachments = attachmentService.findByFrame(frame.path)
                    ok(
                            GetFrameStatus(
                                    FrameInfo(
                                            frame.id, frame.timestampMillis,
                                            attachments.map { a ->
                                                AttachmentInfo(
                                                        a.application,
                                                        a.contentType,
                                                        a.params,
                                                        a.settings,
                                                        a.length
                                                )
                                            }, frame.params, frame.settings
                                    )
                            )
                    )
                } else {
                    frameNotFound()
                }
            } else {
                stackNotFound()
            }
        }
    }
}