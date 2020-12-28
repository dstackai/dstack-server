package ai.dstack.server.jersey.services

import ai.dstack.server.model.Stack
import ai.dstack.server.model.User
import ai.dstack.server.services.EntityAlreadyExists
import ai.dstack.server.services.StackService

class InMemoryStackService: StackService {
    private val stacks = mutableListOf<Stack>()

    override fun get(user: String, name: String): Stack? {
        return stacks.find { it.userName == user && it.name == name }
    }

    override fun findAll(): Sequence<Stack> {
        return stacks.asSequence()
    }

    override fun findByUser(user: String): Sequence<Stack> {
        return stacks.filter { it.userName == user }.asSequence()
    }

    override fun create(stack: Stack) {
        if (stacks.find { it.userName == stack.userName && it.name == stack.name } == null) {
            stacks.add(stack)
        } else {
            throw EntityAlreadyExists()
        }
    }

    override fun delete(stack: Stack) {
        stacks.removeIf { it.userName == stack.userName && it.name == stack.name }
    }

    override fun update(stack: Stack) {
        val index = stacks.indexOfFirst { it.userName == stack.userName && it.name == stack.name }
        if (index >= 0) {
            stacks[index] = stack
        }
        // TODO: Throw exception if not updated
    }

    fun reset(stacks: List<Stack> = emptyList()) {
        this.stacks.clear()
        this.stacks.addAll(stacks)
    }
}