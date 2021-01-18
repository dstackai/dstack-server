package ai.dstack.server.local.sqlite.repositories

import ai.dstack.server.local.sqlite.model.UploadItem
import org.springframework.data.repository.CrudRepository

interface UploadRepository : CrudRepository<UploadItem, String> {
}