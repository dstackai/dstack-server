package ai.dstack.server.local.sqlite.services

import ai.dstack.server.model.*
import ai.dstack.server.services.EntityAlreadyExists
import ai.dstack.server.services.UserService
import ai.dstack.server.local.sqlite.model.UserItem
import ai.dstack.server.local.sqlite.model.UserItemSettings
import ai.dstack.server.local.sqlite.model.UserItemSettingsGeneral
import ai.dstack.server.local.sqlite.repositories.UserRepository
import ai.dstack.server.local.sqlite.toNullable
import java.time.LocalDate

class SQLiteUserService (private val repository: UserRepository) : UserService {
    override fun get(name: String): User? {
        return repository.findById(name).toNullable()?.toUser()
    }

    override fun findAll(): Sequence<User> {
        return repository.findAll().map { it.toUser() }.asSequence()
    }

    override fun findByEmail(email: String): User? {
        return repository.findAllByEmail(email).firstOrNull { it.verified }?.toUser()
    }

    override fun findByToken(token: String): User? {
        return repository.findByToken(token).toNullable()?.toUser()
    }

    override fun findByCreatedDate(createdDate: LocalDate): Sequence<User> {
        return repository.findAllByCreatedDate(createdDate).asSequence().map { it.toUser() }
    }

    override fun create(user: User) {
        if (!repository.existsById(user.name)) {
            repository.save(user.toUserItem())
        } else throw EntityAlreadyExists()
    }

    private fun User.toUserItem(): UserItem {
        return UserItem(
            name = name,
            email = email,
            password = password,
            token = token,
            verificationCode = verificationCode,
            verified = verified,
            role = role.code,
            createdDate = createdDate,
            settings = settings.let {
                UserItemSettings(
                    UserItemSettingsGeneral(it.general.defaultAccessLevel)
                )
            },
            unverifiedName = unverifiedName
        )
    }

    override fun update(user: User) {
        repository.save(user.toUserItem())
    }

    override fun delete(user: User) {
        repository.deleteById(user.name)
    }

    override fun findUnverified(unverifiedName: String, verificationCode: String?, password: String?): User? {
        return repository.findAllByUnverifiedName(unverifiedName).asSequence()
            .map { it.toUser() }
            .firstOrNull {
                (verificationCode != null && it.verificationCode == verificationCode
                        || password != null && it.password == password)
            }
    }

    private fun UserItem.toUser(): User {
        return this.let { u ->
            User(
                u.name, u.email, u.password,
                u.token, u.verificationCode, u.verified,
                // No role code means, the user was created before introducing roles. Consider these users to be admins.
                u.role?.let { UserRole.fromCode(it) } ?: UserRole.Admin,
                u.createdDate, u.settings.let { s ->
                    Settings(General(s.general.defaultAccessLevel))
                }, u.unverifiedName
            )
        }
    }
}