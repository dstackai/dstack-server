package ai.dstack.server.services

import ai.dstack.server.model.Stack

interface StackService {
    fun get(user: String, name: String): Stack?
    fun findAll(): Sequence<Stack>
    fun findByUser(user: String): Sequence<Stack>
    fun create(stack: Stack)
    fun delete(stack: Stack)
    fun update(stack: Stack)
}