package ai.dstack.server.local.services

import ai.dstack.server.chainIfNotNull
import ai.dstack.server.jersey.resources.status.GetStackStatus
import ai.dstack.server.services.AppConfig
import ai.dstack.server.services.AnalyticsService
import com.brsanthu.googleanalytics.GoogleAnalytics
import org.springframework.stereotype.Component

@Component
class GoogleAnalyticsService constructor(private val config: AppConfig) : AnalyticsService {
    private val ga = GoogleAnalytics.builder()
            .withTrackingId(config.gaTrackingId)
            .build()

    private val userAgent = "dstack " +
            "(${System.getProperty("os.name")}; ${System.getProperty("os.version")}; ${System.getProperty("os.arch")}, Java ${System.getProperty("java.version")})"

    override fun track(category: String, action: String, label: String?, source: Any?, remoteAddr: String?) {
        if (config.gaTrackingId != null) {
            if (source is GetStackStatus && source.stack.user == "dstack" && source.stack.name == "artifacts/server") {
                ga.event()
                        .userAgent(userAgent)
                        .eventCategory("dstack")
                        .eventAction("server start")
                        .chainIfNotNull(remoteAddr) {
                            userIp(it)
                        }.sendAsync()
            }
        }
    }
}