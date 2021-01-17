package ai.dstack.server.model

import java.time.LocalDate

data class Upload(
        val id: String,
        val fileName: String?,
        val length: Long,
        val filePath: String,
        val createdDate: LocalDate
)