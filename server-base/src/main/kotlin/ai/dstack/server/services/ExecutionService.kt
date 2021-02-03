package ai.dstack.server.services

import ai.dstack.server.model.*

interface ExecutionService {
    fun execute(stack: Stack, stackUser: User, frame: Frame, attachment: Attachment,
                views: List<Map<String, Any?>>?, apply: Boolean): ExecutionStatus
    fun poll(id: String): ExecutionStatus?
    fun init(stackUser: User, frame: Frame, attachment: Attachment): Boolean
}