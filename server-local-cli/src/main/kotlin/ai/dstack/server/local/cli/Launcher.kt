package ai.dstack.server.local.cli

import ai.dstack.server.local.Application
import ai.dstack.server.local.cli.services.LocalCliAppConfig
import org.apache.commons.cli.*
import org.springframework.boot.Banner
import org.springframework.boot.SpringApplication
import kotlin.system.exitProcess

fun main(args: Array<String>) {
    val options = Options()

    val port = Option("p", "port", true, "server port number")
    options.addOption(port)

    val home = Option("h", "home", true, "dstack home directory")
    options.addOption(home)

    val pythonExecutable = Option("y", "python", true, "path to python executable")
    options.addOption(pythonExecutable)

    val user = Option("u", "user", true, "the admin username")
    options.addOption(user)

    val password = Option("s", "password", true, "the admin password")
    options.addOption(password)

    val overrideConfig = Option("o", "override", false, "override the default config profile if any")
    options.addOption(overrideConfig)

    val parser: CommandLineParser = DefaultParser()
    val formatter = HelpFormatter()
    val cmd: CommandLine
    try {
        cmd = parser.parse(options, args)
    } catch (e: ParseException) {
        println(e.message)
        formatter.printHelp("java -jar server-local-cli.jar", options)
        exitProcess(1)
    }
    if (cmd.hasOption("port")) {
        LocalCliAppConfig.defaultInternalPort = cmd.getOptionValue("port")
    }

    if (cmd.hasOption("home")) {
        LocalCliAppConfig.defaultHomeDirectory = cmd.getOptionValue("home")
    }

    if (cmd.hasOption("python")) {
        LocalCliAppConfig.defaultPythonExecutable = cmd.getOptionValue("python")
    }

    if (cmd.hasOption("user")) {
        LocalCliAppConfig.defaultUser = cmd.getOptionValue("user")
    }

    if (cmd.hasOption("password")) {
        LocalCliAppConfig.defaultPassword = cmd.getOptionValue("password")
    }

    if (cmd.hasOption("override")) {
        LocalCliAppConfig.overrideConfig = true
    }

    val application = SpringApplication(Application::class.java)
    application.setAdditionalProfiles("sqlite")
    application.setBannerMode(Banner.Mode.OFF)
    application.run(*args)
}
