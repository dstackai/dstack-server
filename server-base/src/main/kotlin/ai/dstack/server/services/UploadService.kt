package ai.dstack.server.services

import ai.dstack.server.model.Upload

interface UploadService {
    fun create(upload: Upload)
    fun get(id: String): Upload?
}