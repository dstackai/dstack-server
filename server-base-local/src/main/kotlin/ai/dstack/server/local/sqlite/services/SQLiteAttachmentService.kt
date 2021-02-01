package ai.dstack.server.local.sqlite.services

import ai.dstack.server.model.Attachment
import ai.dstack.server.services.AttachmentService
import ai.dstack.server.services.EntityAlreadyExists
import ai.dstack.server.local.sqlite.model.AttachId
import ai.dstack.server.local.sqlite.model.AttachmentItem
import ai.dstack.server.local.sqlite.repositories.AttachmentRepository
import ai.dstack.server.local.sqlite.toNullable
import com.fasterxml.jackson.core.type.TypeReference

class SQLiteAttachmentService(private val repository: AttachmentRepository) :
        AttachmentService {
    override fun get(framePath: String, index: Int): Attachment? {
        return repository.findById(mapId(framePath, index)).toNullable()?.toAttachment()
    }

    override fun deleteByStackPath(stackPath: String) {
        repository.deleteAllByStack(stackPath)
    }

    override fun create(attachment: Attachment) {
        if (!repository.existsById(attachment.mapId)) {
            repository.save(attachment.toAttachmentItem())
        } else throw EntityAlreadyExists()
    }

    override fun findByFrame(frame: String): List<Attachment> {
        return repository.findAllByFrame(frame).asSequence().map { it.toAttachment() }.toList()
    }

    private val Attachment.mapId
        get() = mapId(framePath, index)

    private fun mapId(framePath: String, attachIndex: Int) =
            AttachId(framePath, attachIndex)

    private fun AttachmentItem.toAttachment(): Attachment {
        return Attachment(frame, file, application, contentType, length, description, index,
                sqliteMapper.readValue(paramsJson, object : TypeReference<Map<String, Any>>() {}),
                sqliteMapper.readValue(settingsJson, object : TypeReference<Map<String, Any>>() {}), createdDate)
    }

    private fun Attachment.toAttachmentItem(): AttachmentItem {
        return AttachmentItem(framePath, index, filePath, application, contentType, length,
                description, sqliteMapper.writeValueAsString(params), sqliteMapper.writeValueAsString(settings),
                createdDate)
    }
}