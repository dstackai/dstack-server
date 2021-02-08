package ai.dstack.server.services

import ai.dstack.server.model.Execution

interface ExecutionService {
    fun create(execution: Execution)
    fun update(execution: Execution)
    fun get(id: String): Execution?
}