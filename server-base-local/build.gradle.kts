buildscript {
    repositories {
        maven {
            url = uri("https://plugins.gradle.org/m2/")
        }
    }
    dependencies {
        classpath("org.jetbrains.kotlin:kotlin-noarg:${Deps.KOTLIN_VERSION}")
    }
}

apply(plugin = "org.jetbrains.kotlin.plugin.jpa")

dependencies {
    compile(Deps.spring_boot_starter_jersey)
    compile(Deps.spring_boot_starter_web)
    compile(Deps.slf4j_log4j12)
    compile(Deps.commons_io)
    compile(Deps.spring_data_jpa)
    compile(Deps.sqlite_dialect)
    compile(Deps.sqlite_jdbc)
    compile(project(":server-base"))
}