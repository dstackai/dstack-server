package ai.dstack.server.local.sqlite.model

import java.io.Serializable
import javax.persistence.*

@Embeddable
data class StackItemHead(
    @Column
    val id: String,

    @Column(name = "timestamp")
    val timestampMillis: Long
)

class StackId(
    var user: String = "",
    var name: String = ""
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as StackId

        if (user != other.user) return false
        if (name != other.name) return false

        return true
    }

    override fun hashCode(): Int {
        var result = user.hashCode()
        result = 31 * result + name.hashCode()
        return result
    }
}

@Entity
@Table(
    name = "stacks",
    indexes = [Index(columnList = "user_name", unique = false)]
)
@IdClass(StackId::class)
data class StackItem(
    @Id
    @Column(name = "user_name")
    val user: String,

    @Id
    @Column(name = "stack_name")
    val name: String,

    @Deprecated("Must be dropped eventually")
    @Column
    val private: Boolean?,

    @Column(name = "access_level")
    val accessLevel: String?,

    @Embedded
    val head: StackItemHead?,

    @Column()
    val readme: String?
) {
    fun effectiveAccessLevel(): String {
        return accessLevel ?: if (private == true) "private" else "public"
    }
}