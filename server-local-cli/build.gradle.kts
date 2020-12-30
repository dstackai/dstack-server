dependencies {
    compile(Deps.spring_boot_starter_jersey)
    compile(Deps.spring_boot_starter_web)
    compile(Deps.slf4j_log4j12)
    compile(Deps.commons_io)
    compile(Deps.commons_cli)
    compile(Deps.jackson_yaml)
    compile(Deps.jansi)
    compile(project(":server-base-local"))
}

plugins {
    id("org.springframework.boot") version "2.2.6.RELEASE"
}

springBoot {
    mainClassName = "ai.dstack.server.local.cli.LauncherKt"
}

tasks.bootRun {
    args(project.properties["args"]?.toString()?.split (',').orEmpty().toMutableList())
}

tasks {
    val npmInstall by registering(Exec::class) {
        workingDir = File("../website")
        commandLine = listOf("npm", "install")
    }

    val npmBuild by registering(Exec::class) {
        dependsOn(npmInstall)
        workingDir = File("../website")
        commandLine = listOf("npm", "run-script", "build")
    }

    val copyWebsite by registering(Sync::class) {
        from("../website/build")
        into("src/main/resources/website")
    }
}