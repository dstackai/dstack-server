package ai.dstack.server.services

import java.io.InputStream

class ExecutionStatus(val stackPath: String, val inputStream: InputStream, val length: Long)