package ai.dstack.server.services

import ai.dstack.server.model.*

interface ExecutionService {
    fun execute(stack: Stack, user: User, frame: Frame, attachment: Attachment,
                views: List<Map<String, Any?>>?, apply: Boolean): ExecutionStatus
    fun poll(id: String): ExecutionStatus?
}