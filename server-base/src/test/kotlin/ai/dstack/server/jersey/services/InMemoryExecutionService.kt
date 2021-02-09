package ai.dstack.server.jersey.services

import ai.dstack.server.model.Execution
import ai.dstack.server.services.EntityAlreadyExists
import ai.dstack.server.services.ExecutionService

class InMemoryExecutionService : ExecutionService {
    private val executions = mutableListOf<Execution>()

    override fun get(id: String): Execution? {
        return executions.find { it.id == id }
    }

    override fun create(execution: Execution) {
        if (executions.find { it.id == execution.id } == null) {
            executions.add(execution)
        } else {
            throw EntityAlreadyExists()
        }
    }

    override fun update(execution: Execution) {
        val index = executions.indexOfFirst { it.id == execution.id }
        if (index >= 0) {
            executions[index] = execution
        }
        // TODO: Throw exception if not updated
    }

    fun reset(executions: List<Execution> = emptyList()) {
        this.executions.clear()
        this.executions.addAll(executions)
    }
}