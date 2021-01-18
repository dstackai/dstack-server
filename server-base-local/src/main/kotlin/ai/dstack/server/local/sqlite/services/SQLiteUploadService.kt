package ai.dstack.server.local.sqlite.services

import ai.dstack.server.local.sqlite.model.UploadItem
import ai.dstack.server.local.sqlite.repositories.UploadRepository
import ai.dstack.server.local.sqlite.toNullable
import ai.dstack.server.model.Upload
import ai.dstack.server.services.EntityAlreadyExists
import ai.dstack.server.services.UploadService

class SQLiteUploadService(private val repository: UploadRepository) :
        UploadService {
    override fun get(id: String): Upload? {
        return repository.findById(id).toNullable()?.toUpload()
    }

    override fun create(upload: Upload) {
        if (!repository.existsById(upload.id)) {
            repository.save(upload.toUploadItem())
        } else throw EntityAlreadyExists()
    }

    private fun UploadItem.toUpload(): Upload {
        return Upload(id, name, length, filePath, createdDate)
    }

    private fun Upload.toUploadItem(): UploadItem {
        return UploadItem(id, fileName, length, filePath, createdDate)
    }
}