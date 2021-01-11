package ai.dstack.server.local.cli.services

import ai.dstack.server.services.AppConfig
import ai.dstack.server.services.EmailService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
open class EmailServiceFactory {
    @Bean
    open fun emailService(@Autowired config: AppConfig): EmailService {
        return if (config.emailEnabled) {
            SmtpEmailService(config)
        } else {
            NonAvailableEmailService()
        }
    }
}