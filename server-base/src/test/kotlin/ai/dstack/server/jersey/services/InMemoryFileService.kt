package ai.dstack.server.jersey.services

import ai.dstack.server.model.Attachment
import ai.dstack.server.model.User
import ai.dstack.server.services.FileService
import java.net.URI
import javax.ws.rs.NotSupportedException

class InMemoryFileService: FileService {
    private val files = mutableMapOf<String, ByteArray>()

    override fun save(path: String, data: ByteArray) {
        files[path] = data
    }

    override fun get(path: String): ByteArray {
        return files[path]!!
    }

    override fun delete(prefix: String) {
        files.keys.filter { it.startsWith(prefix) }.forEach {
            files.remove(it)
        }
    }

    override fun upload(path: String, user: User?): URI {
        throw NotSupportedException()
    }

    override fun preview(path: String, length: Long): ByteArray {
        throw NotSupportedException()
    }

    override fun download(path: String, user: User?, filename: String, contentType: String?): URI {
        throw NotSupportedException()
    }

    fun reset(files: Map<String, ByteArray> = emptyMap()) {
        this.files.clear()
        this.files.putAll(files)
    }
}