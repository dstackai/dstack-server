package ai.dstack.server.local.sqlite.services

import ai.dstack.server.model.Frame
import ai.dstack.server.services.EntityAlreadyExists
import ai.dstack.server.services.FrameService
import ai.dstack.server.local.sqlite.model.FrameId
import ai.dstack.server.local.sqlite.model.FrameItem
import ai.dstack.server.local.sqlite.repositories.FrameRepository
import ai.dstack.server.local.sqlite.toNullable
import com.fasterxml.jackson.core.type.TypeReference

class SQLiteFrameService(private val repository: FrameRepository) : FrameService {
    override fun get(stackPath: String, frameId: String): Frame? {
        return repository.findById(mapId(stackPath, frameId)).toNullable()?.toFrame()
    }

    override fun create(frame: Frame) {
        if (!repository.existsById(frame.mapId)) {
            repository.save(frame.toFrameItem())
        } else throw EntityAlreadyExists()
    }

    override fun update(frame: Frame) {
        repository.save(frame.toFrameItem())
    }

    override fun findByStackPath(stackPath: String): List<Frame> {
        return repository.findAllByStack(stackPath).asSequence().map { it.toFrame() }.toList()
    }

    override fun deleteByStackPath(stackPath: String) {
        return repository.deleteAllByStack(stackPath)
    }

    private val Frame.mapId
        get() = mapId(stackPath, id)

    private fun mapId(stackPath: String, frameId: String) =
            FrameId(stackPath, frameId)

    private fun FrameItem.toFrame(): Frame {
        return this.let { f ->
            Frame(f.stack, f.id, f.timestamp, f.size,
                    f.paramsJson?.let {
                        sqliteMapper.readValue(f.paramsJson,
                                object : TypeReference<Map<String, Any>>() {})
                    } ?: emptyMap(),
                    f.settingsJson?.let {
                        sqliteMapper.readValue(f.settingsJson,
                                object : TypeReference<Map<String, Any>>() {})
                    } ?: emptyMap())
        }
    }

    private fun Frame.toFrameItem(): FrameItem {
        return this.let { f ->
            FrameItem(
                    f.stackPath,
                    f.id,
                    f.timestampMillis,
                    f.size,
                    sqliteMapper.writeValueAsString(
                            f.params
                    ),
                    sqliteMapper.writeValueAsString(
                            f.settings
                    )
            )
        }
    }
}