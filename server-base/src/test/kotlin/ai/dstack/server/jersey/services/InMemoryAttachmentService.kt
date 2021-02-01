package ai.dstack.server.jersey.services

import ai.dstack.server.model.Attachment
import ai.dstack.server.services.AttachmentService
import ai.dstack.server.services.EntityAlreadyExists

class InMemoryAttachmentService: AttachmentService {
    private val attachs = mutableListOf<Attachment>()

    override fun create(attachment: Attachment) {
        if (attachs.find { it.framePath == attachment.framePath && it.index == attachment.index } == null) {
            attachs.add(attachment)
        } else {
            throw EntityAlreadyExists()
        }
    }

    override fun findByFrame(frame: String): List<Attachment> {
        return attachs.filter { it.framePath == frame }
    }

    override fun get(framePath: String, index: Int): Attachment? {
        return attachs.find { it.framePath == framePath && it.index == index }
    }

    override fun deleteByStackPath(stackPath: String) {
        attachs.removeIf { it.framePath.startsWith(stackPath) }
    }

    fun reset(attachs: List<Attachment> = emptyList()) {
        this.attachs.clear()
        this.attachs.addAll(attachs)
    }
}