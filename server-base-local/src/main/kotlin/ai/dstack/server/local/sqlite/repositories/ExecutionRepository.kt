package ai.dstack.server.local.sqlite.repositories

import ai.dstack.server.local.sqlite.model.ExecutionItem
import org.springframework.data.repository.CrudRepository

interface ExecutionRepository : CrudRepository<ExecutionItem, String>