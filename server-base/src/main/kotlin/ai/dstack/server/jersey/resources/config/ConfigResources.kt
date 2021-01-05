package ai.dstack.server.jersey.resources.config

import ai.dstack.server.jersey.resources.JSON_UTF8
import ai.dstack.server.jersey.resources.ok
import ai.dstack.server.jersey.resources.status.ConfigStatus
import ai.dstack.server.jersey.resources.status.RuntimeInfo
import ai.dstack.server.services.AppConfig
import mu.KLogging
import javax.inject.Inject
import javax.ws.rs.Consumes
import javax.ws.rs.GET
import javax.ws.rs.Path
import javax.ws.rs.Produces
import javax.ws.rs.core.Context
import javax.ws.rs.core.HttpHeaders
import javax.ws.rs.core.Response

@Path("/config")
class ConfigResources {
    @Inject
    private lateinit var config: AppConfig

    companion object : KLogging()

    val runtimes: List<String> by lazy {
        val runtimes = mutableListOf<String>()
        if (config.pythonExecutables.isNotEmpty()) {
            runtimes.add("python")
        }
        runtimes
    }

    @GET
    @Path("/info")
    @Produces(JSON_UTF8)
    @Consumes(JSON_UTF8)
    fun info(@Context headers: HttpHeaders): Response {
        logger.debug { "info" }
        return ok(ConfigStatus(
                runtimes.map { RuntimeInfo(it) },
                config.emailEnabled))
    }
}