package ai.dstack.server.local.sqlite

import ai.dstack.server.local.sqlite.repositories.*
import ai.dstack.server.local.sqlite.services.*
import ai.dstack.server.services.*
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import java.io.File
import javax.sql.DataSource
import org.springframework.core.io.ClassPathResource

import org.springframework.context.support.PropertySourcesPlaceholderConfigurer
import org.springframework.data.jpa.repository.config.EnableJpaRepositories

@Configuration
@Profile("sqlite")
@EnableJpaRepositories(basePackages = ["ai.dstack.server.local.sqlite.repositories"])
open class SQLiteConfig {
    @Bean
    open fun dataSource(@Autowired config: AppConfig): DataSource? {
        val hikariConfig = HikariConfig()
        hikariConfig.driverClassName = "org.sqlite.JDBC"
        val directory = File("${config.dataDirectory}/sqlite/")
        directory.mkdirs()
        hikariConfig.jdbcUrl = "jdbc:sqlite:${directory.absolutePath}/dstack.sqlite3"
        hikariConfig.maximumPoolSize = 1
        return HikariDataSource(hikariConfig)
    }

    @Bean
    open fun properties(): PropertySourcesPlaceholderConfigurer? {
        val properties = PropertySourcesPlaceholderConfigurer()
        properties.setLocations(ClassPathResource("ai/dstack/server/local/sqlite/application.properties"))
        properties.setIgnoreUnresolvablePlaceholders(true)
        return properties
    }

    @Bean
    open fun attachmentService(@Autowired repository: AttachmentRepository): AttachmentService {
        return SQLiteAttachmentService(repository)
    }

    @Bean
    open fun uploadService(@Autowired repository: UploadRepository): UploadService {
        return SQLiteUploadService(repository)
    }

    @Bean
    open fun frameService(@Autowired repository: FrameRepository): FrameService {
        return SQLiteFrameService(repository)
    }

    @Bean
    open fun permissionService(@Autowired repository: PermissionRepository): PermissionService {
        return SQLitePermissionService(repository)
    }

    @Bean
    open fun sessionService(@Autowired repository: SessionRepository): SessionService {
        return SQLiteSessionService(repository)
    }

    @Bean
    open fun stackService(@Autowired repository: StackRepository): StackService {
        return SQLiteStackService(repository)
    }

    @Bean
    open fun executionService(@Autowired repository: ExecutionRepository): ExecutionService {
        return SQLiteExecutionService(repository)
    }

    @Bean
    open fun userService(@Autowired repository: UserRepository): UserService {
        return SQLiteUserService(repository)
    }
}