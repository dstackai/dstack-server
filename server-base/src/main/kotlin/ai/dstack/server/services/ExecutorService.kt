package ai.dstack.server.services

import ai.dstack.server.model.*

interface ExecutorService {
    fun execute(id: String, stackUser: User, frame: Frame, attachment: Attachment,
                views: List<Map<String, Any?>>?, apply: Boolean): ExecutionResult
    fun poll(id: String): ExecutionResult?
    fun init(stackUser: User, frame: Frame, attachment: Attachment): Boolean
}