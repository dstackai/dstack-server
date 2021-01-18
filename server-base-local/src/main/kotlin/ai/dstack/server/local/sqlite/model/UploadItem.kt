package ai.dstack.server.local.sqlite.model

import java.time.LocalDate
import javax.persistence.*

@Entity
@Table(name = "uploads")
data class UploadItem(
        @Id
        @Column(name = "upload_id")
        val id: String,

        @Column(name = "file_name")
        var name: String?,

        @Column
        var length: Long,

        @Column(name = "file_path")
        var filePath: String,

        @Column(name = "created_date")
        val createdDate: LocalDate
)