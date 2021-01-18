package ai.dstack.server.services

import ai.dstack.server.model.User
import java.net.URI

interface FileService {
    fun upload(path: String, user:User?): URI
    fun save(path: String, data: ByteArray)
    fun get(path: String): ByteArray
    fun delete(prefix: String)
    fun preview(path: String, length: Long): ByteArray
    fun download(path: String, user: User?, filename: String, contentType: String?): URI
}