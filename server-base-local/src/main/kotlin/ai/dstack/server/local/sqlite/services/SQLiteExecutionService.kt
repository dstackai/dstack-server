package ai.dstack.server.local.sqlite.services

import ai.dstack.server.local.sqlite.model.ExecutionItem
import ai.dstack.server.services.EntityAlreadyExists
import ai.dstack.server.local.sqlite.repositories.ExecutionRepository
import ai.dstack.server.local.sqlite.toNullable
import ai.dstack.server.model.Execution
import ai.dstack.server.services.ExecutionService
import com.fasterxml.jackson.core.type.TypeReference

class SQLiteExecutionService(private val repository: ExecutionRepository) : ExecutionService {
    override fun get(id: String): Execution? {
        return repository.findById(id).toNullable()?.toExecution()
    }

    override fun create(execution: Execution) {
        if (!repository.existsById(execution.id)) {
            repository.save(execution.toExecutionItem())
        } else throw EntityAlreadyExists()
    }

    override fun update(execution: Execution) {
        repository.save(execution.toExecutionItem())
    }

    private fun ExecutionItem.toExecution(): Execution {
        return this.let { e ->
            Execution(e.id, e.stackPath, e.tqdmJson?.let {
                sqliteMapper.readValue(e.tqdmJson,
                        object : TypeReference<Map<String, Any>>() {})
            })
        }
    }

    private fun Execution.toExecutionItem(): ExecutionItem {
        return this.let { e ->
            ExecutionItem(e.id, e.stackPath, e.tqdm?.let { sqliteMapper.writeValueAsString(it) })
        }
    }
}