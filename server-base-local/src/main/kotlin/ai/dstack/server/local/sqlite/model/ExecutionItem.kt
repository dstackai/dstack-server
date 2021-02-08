package ai.dstack.server.local.sqlite.model

import javax.persistence.*

@Entity
@Table(
    name = "executions"
)
data class ExecutionItem(
    @Id
    @Column()
    val id: String,

    @Column(name = "stack_path")
    val stackPath: String,

    @Column(name = "tqdm")
    var tqdmJson: String?
)