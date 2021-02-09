package ai.dstack.server.local.jersey

import ai.dstack.server.chainIfNotNull
import ai.dstack.server.services.*
import java.io.*
import javax.inject.Inject
import javax.ws.rs.*
import javax.ws.rs.core.MediaType
import javax.ws.rs.core.Response
import javax.ws.rs.core.Response.ok
import javax.ws.rs.core.StreamingOutput


@Path("/files")
class FilesResources {
    @Inject
    private lateinit var appConfig: AppConfig

    @Inject
    private lateinit var userService: UserService

    @Inject
    private lateinit var frameService: FrameService

    @Inject
    private lateinit var attachmentService: AttachmentService

    @Inject
    private lateinit var executorService: ExecutorService

    private val allowedPrefixForAnonymousRequests = "uploads/"

    @PUT
    @Consumes(MediaType.APPLICATION_OCTET_STREAM)
    @Path("/{path: .+}")
    fun upload(
            inputStream: InputStream, @PathParam("path") path: String,
            @QueryParam("user") user: String?, @QueryParam("code") code: String?
    ): Response {
        val u = user?.let { userService.get(it) }
        return if (u != null && u.verificationCode == code
                || path.startsWith(allowedPrefixForAnonymousRequests)) {
            val file = File("${appConfig.fileDirectory}/$path")
            file.parentFile.mkdirs()
            file.outputStream().use {
                inputStream.copyTo(it)
            }
            val tokens = path.split("/")
            if (tokens.size > 2) {
                val stackUser = userService.get(tokens[0])
                val stackPath = tokens.subList(0, tokens.lastIndex - 1).joinToString("/")
                val frameId = tokens[tokens.lastIndex - 1]
                val frame = frameService.get(stackPath, frameId)
                val attachment = frame?.let { tokens.last().toIntOrNull()?.let { attachmentService.get(frame.path, it) } }
                if (stackUser != null && attachment != null) {
                    executorService.init(stackUser, frame, attachment)
                }
            }
            ok().build()
        } else {
            Response.status(Response.Status.FORBIDDEN).build()
        }
    }

    @GET
    @Path("/{path: .+}")
    @Throws(IOException::class)
    fun download(
            @PathParam("path") path: String,
            @QueryParam("user") user: String?, @QueryParam("code") code: String?,
            @QueryParam("filename") filename: String,
            @QueryParam("content_type") contentType: String?
    ): Response? {
        val u = user?.let { userService.get(it) }
        return if (u != null && u.verificationCode == code
                || path.startsWith(allowedPrefixForAnonymousRequests)) {
            val file = File("${appConfig.fileDirectory}/$path")
            val length = file.length()
            val inputStream: FileInputStream = file.inputStream()
            val streamingOutput = StreamingOutput { output ->
                try {
                    inputStream.copyTo(output)
                } catch (e: Exception) {
                    throw WebApplicationException(e)
                }
            }
            return ok(streamingOutput)
                    .header("content-disposition", "attachment; filename=$filename")
                    .chainIfNotNull(contentType) {
                        header("content-type", contentType)
                    }.header("content-length", length)
                    .build()
        } else {
            Response.status(Response.Status.FORBIDDEN).build()
        }
    }
}

