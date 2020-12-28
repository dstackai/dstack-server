package ai.dstack.server.local.cli

import ai.dstack.server.local.cli.config.Config
import ai.dstack.server.local.cli.config.Profile
import ai.dstack.server.model.*
import ai.dstack.server.services.AppConfig
import ai.dstack.server.services.UserService
import org.fusesource.jansi.AnsiConsole
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import java.io.File
import java.security.SecureRandom
import java.time.LocalDate
import java.util.*
import java.util.concurrent.ThreadLocalRandom
import javax.annotation.PostConstruct


@Configuration
open class Startup {
    @Autowired
    lateinit var appConfig: AppConfig

    @Autowired
    lateinit var userService: UserService

    @PostConstruct
    fun initialize() {
        val userName = appConfig.user ?: "dstack"
        var user = userService.get(userName)
        if (user == null) {
            user = User(
                name = userName,
                email = null,
                password = appConfig.password ?: RandomString(8, ThreadLocalRandom.current()).nextString(),
                token = UUID.randomUUID().toString(),
                verificationCode = UUID.randomUUID().toString(),
                verified = true,
                role = UserRole.Admin,
                createdDate = LocalDate.now(),
                unverifiedName = userName,
                settings = Settings(General(AccessLevel.Public))
            )
            userService.create(user)
        } else {
            if (appConfig.password != null && user.password != appConfig.password) {
                user = user.copy(password = appConfig.password!!)
                userService.update(user)
            }
        }
        var autoConfigure = false
        val defaultConfigFile = File(appConfig.homeDirectory + "/config.yaml")
        val defaultConfig = if (defaultConfigFile.exists()) Config.read(defaultConfigFile) else Config()
        val server = "http://localhost:${appConfig.internalPort}/api"
        val profile = defaultConfig["default"]
        autoConfigure = profile == null ||
            (profile.user == "dstack"
                    && profile.token == user.token
                    && profile.server.orEmpty().startsWith("http://localhost:"))
        if (autoConfigure) {
            defaultConfig["default"] = Profile(user.name, user.token, server)
            Config.write(defaultConfigFile, defaultConfig)
        }
        AnsiConsole.systemInstall()
        val ANSI_RESET = "\u001B[0m"
        val ANSI_UNDERLINE = "\u001B[4m"
        val ANSI_BOLD = "\u001B[1m"
        val ANSI_BLUE = "\u001B[34m"
        val ANSI_BRIGHT_WHITE = "\u001B[33m"
        val ANSI_YELLOW = "\u001B[37m"
        println("To access the application, open this URL in the browser: ${ANSI_BLUE}${ANSI_UNDERLINE}http://localhost:${appConfig.internalPort}/auth/verify?user=${user.name}&code=${user.verificationCode}&next=/${ANSI_RESET}")
        if (autoConfigure) {
            println()
            println("The ${ANSI_BOLD}default${ANSI_RESET} profile in \"$defaultConfigFile\" is already configured. You are welcome to push your applications using Python package.")
        } else {
            println()
            println("The ${ANSI_BOLD}default${ANSI_RESET} profile in \"$defaultConfigFile\" is not configured. To configure it, use this command:")
            println("\t${ANSI_BRIGHT_WHITE}dstack config add --token ${user.token} --user ${user.name} --server http://localhost:${appConfig.internalPort}/api${ANSI_RESET}")
        }
        println()
        println("${ANSI_YELLOW}What's next?${ANSI_RESET}")
        println("${ANSI_YELLOW}------------${ANSI_RESET}")
        println("${ANSI_YELLOW}-${ANSI_RESET} Checkout our documentation: ${ANSI_BLUE}${ANSI_UNDERLINE}https://docs.dstack.ai${ANSI_RESET}")
        println("${ANSI_YELLOW}-${ANSI_RESET} Ask questions and share feedback: ${ANSI_BLUE}${ANSI_UNDERLINE}https://discord.gg/8xfhEYa${ANSI_RESET}")
        println("${ANSI_YELLOW}-${ANSI_RESET} Star us on GitHub: ${ANSI_BLUE}${ANSI_UNDERLINE}https://github.com/dstackai/dstack${ANSI_RESET}")
    }

    class RandomString(length: Int, random: Random, symbols: String) {
        /**
         * Generate a random string.
         */
        fun nextString(): String {
            for (idx in buf.indices) buf[idx] = symbols[random.nextInt(symbols.size)]
            return String(buf)
        }

        private val random: Random
        private val symbols: CharArray
        private val buf: CharArray
        /**
         * Create an alphanumeric string generator.
         */
        /**
         * Create an alphanumeric strings from a secure generator.
         */
        /**
         * Create session identifiers.
         */
        @JvmOverloads
        constructor(length: Int = 21, random: Random = SecureRandom()) : this(
            length,
            random,
                alphanum
        ) {
        }

        companion object {
            const val upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            val lower = upper.toLowerCase(Locale.ROOT)
            const val digits = "0123456789"
            val alphanum =
                upper + lower + digits
        }

        init {
            require(length >= 1)
            require(symbols.length >= 2)
            this.random = Objects.requireNonNull(random)
            this.symbols = symbols.toCharArray()
            buf = CharArray(length)
        }
    }
}