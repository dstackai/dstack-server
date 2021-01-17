package ai.dstack.server.jersey.resources.uploads

import ai.dstack.server.services.*
import ai.dstack.server.jersey.resources.*
import ai.dstack.server.jersey.resources.malformedRequest
import ai.dstack.server.jersey.resources.payload.UploadPayload
import ai.dstack.server.jersey.resources.status.GetUploadStatus
import ai.dstack.server.jersey.resources.status.UploadStatus
import ai.dstack.server.model.Upload
import mu.KLogging
import java.time.LocalDate
import java.util.*
import javax.inject.Inject
import javax.ws.rs.*
import javax.ws.rs.core.Context
import javax.ws.rs.core.HttpHeaders
import javax.ws.rs.core.Response

private val UploadPayload?.isMalformed: Boolean
    get() {
        return this == null || length == null
    }

@Path("/uploads")
class UploadResources {
    @Inject
    private lateinit var uploadService: UploadService

    @Inject
    private lateinit var fileService: FileService

    companion object : KLogging()

    private val MAX_DATA_LENGTH = 1000000L

    @POST
    @Path("upload")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun upload(payload: UploadPayload?, @Context headers: HttpHeaders): Response {
        return if (payload.isMalformed) {
            malformedRequest()
        } else {
            val id = UUID.randomUUID().toString()
            val createdDate = LocalDate.now()
            val filePath = "uploads/$createdDate/$id"
            val upload = Upload(id, payload!!.fileName, payload.length!!, filePath, createdDate)
            uploadService.create(upload)
            val data = payload.data?.let { Base64.getDecoder().decode(it) }
            var uploadUrl: String? = null
            if (data != null) {
                fileService.save(filePath, data)
            } else {
                uploadUrl = fileService.upload(filePath, null).toString()
            }
            ok(UploadStatus(id, payload.fileName, payload.length, createdDate.toString(), uploadUrl))
        }
    }

    @GET
    @Path("{id}")
    @Consumes(JSON_UTF8)
    @Produces(JSON_UTF8)
    fun get(@PathParam("id") id: String?): Response {
        return if (id == null) {
            malformedRequest()
        } else {
            val upload = uploadService.get(id)
            if (upload == null) {
                uploadNotFound()
            } else {
                val filePath = "uploads/${upload.createdDate}/$id"
                if (upload.length < MAX_DATA_LENGTH) {
                    val data = Base64.getEncoder().encodeToString(fileService.get(upload.filePath)).toString()
                    ok(GetUploadStatus(id, upload.fileName, upload.length, upload.createdDate.toString(),
                            data, null))
                } else {
                    ok(GetUploadStatus(id, upload.fileName, upload.length, upload.createdDate.toString(),
                            null, fileService.download(filePath, null, upload.fileName
                            ?: id, null).toString()))
                }
            }
        }
    }
}