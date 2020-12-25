package ai.dstack.server.local.sqlite.services

import ai.dstack.server.model.Stack
import ai.dstack.server.services.EntityAlreadyExists
import ai.dstack.server.services.StackService
import ai.dstack.server.local.sqlite.model.StackId
import ai.dstack.server.local.sqlite.model.StackItem
import ai.dstack.server.local.sqlite.model.StackItemHead
import ai.dstack.server.local.sqlite.repositories.StackRepository
import ai.dstack.server.local.sqlite.toNullable
import ai.dstack.server.model.AccessLevel

class SQLiteStackService(private val repository: StackRepository) : StackService {
    override fun get(user: String, name: String): Stack? {
        return repository.findById(mapId(user, name)).toNullable()?.toStack()
    }

    override fun findByUser(user: String, consistent: Boolean): Sequence<Stack> {
        return repository.findAllByUser(user).asSequence().map { it.toStack() }
    }

    override fun create(stack: Stack) {
        if (!repository.existsById(stack.mapId)) {
            repository.save(stack.toStackItem())
        } else throw EntityAlreadyExists()
    }

    override fun delete(stack: Stack) {
        repository.deleteById(stack.mapId)
    }

    override fun update(stack: Stack) {
        repository.save(stack.toStackItem())
    }

    private val Stack.mapId
        get() = mapId(userName, name)

    private fun mapId(user: String, name: String) =
            StackId(user, name)

    private fun StackItem.toStack(): Stack {
        return this.let { s ->
            Stack(s.user, s.name, AccessLevel.fromCode(s.effectiveAccessLevel()), s.head?.let { h ->
                ai.dstack.server.model.Head(h.id, h.timestampMillis)
            }, s.readme)
        }
    }

    private fun Stack.toStackItem(): StackItem {
        return this.let { s ->
            StackItem(
                    s.userName,
                    s.name,
                    null,
                    s.accessLevel.code,
                    s.head?.let { h ->
                        StackItemHead(
                                h.id,
                                h.timestampMillis
                        )
                    },
                    s.readme)
        }
    }
}