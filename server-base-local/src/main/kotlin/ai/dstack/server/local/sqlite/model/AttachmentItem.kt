package ai.dstack.server.local.sqlite.model

import java.io.Serializable
import java.time.LocalDate
import javax.persistence.*

class AttachId(
        var frame: String = "",
        var index: Int = -1
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as AttachId

        if (frame != other.frame) return false
        if (index != other.index) return false

        return true
    }

    override fun hashCode(): Int {
        var result = frame.hashCode()
        result = 31 * result + index
        return result
    }
}

@Entity
@Table(
        name = "attachs",
        indexes = [Index(columnList = "frame_path", unique = false), Index(columnList = "created_date", unique = false)]
)
@IdClass(AttachId::class)
class AttachmentItem(
    @Id
    @Column(name = "frame_path")
    val frame: String,

    @Id
    @Column(name = "attach_index")
    val index: Int,

    @Column
    var file: String,

    @Column()
    var application: String?,

    @Column(name = "content_type")
    var contentType: String,

    @Column
    var length: Long,

    var description: String?,

    @Column(name = "params")
    var paramsJson: String,

    @Column(name = "settings")
    var settingsJson: String,

    @Column(name = "created_date")
    val createdDate: LocalDate
)