package ai.dstack.server.local.sqlite.model

import java.io.Serializable
import javax.persistence.*

class FrameId(
    var stack: String = "",
    var id: String = ""
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as FrameId

        if (stack != other.stack) return false
        if (id != other.id) return false

        return true
    }

    override fun hashCode(): Int {
        var result = stack.hashCode()
        result = 31 * result + id.hashCode()
        return result
    }
}

@Entity
@Table(
    name = "frames",
    indexes = [Index(columnList = "stack_path", unique = false)]
)
@IdClass(FrameId::class)
data class FrameItem(
    @Id
    @Column(name = "stack_path")
    val stack: String,

    @Column(name = "frame_id")
    val id: String,

    @Column
    var timestamp: Long,

    @Column
    var size: Int?,

    @Column(name = "params")
    var paramsJson: String?,

    @Column(name = "settings")
    var settingsJson: String?
)