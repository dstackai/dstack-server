package ai.dstack.server.services

import ai.dstack.server.model.*
import java.io.File

interface ExecutionService {
    fun execute(stackPath: String, frame: Frame, attachment: Attachment, views: List<Map<String, Any?>>?, apply: Boolean): Pair<Execution?, File?>
    fun poll(id: String): Pair<String?, File?>
}