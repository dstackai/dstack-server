import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

val snapshotVersion = "0.2.dev5"

plugins {
    java
    kotlin("jvm") version Deps.KOTLIN_VERSION
}

val globalArtifactsBuildDir: File by extra { buildDir }

allprojects {
    apply(plugin = "idea")

    group = "ai.dstack"
    version = project.findProperty("dstack_version")?.toString() ?: "$snapshotVersion-SNAPSHOT"

    repositories {
        maven { url = uri("https://kotlin.bintray.com/kotlinx") }
        mavenCentral()
        jcenter()
        mavenLocal()
    }
}

subprojects {
    apply(plugin = "java")
    apply(plugin = "org.jetbrains.kotlin.jvm")

    dependencies {
        compile(Deps.kotlin_stdlib_jdk8)
        compile(Deps.kotlin_logging)

        testCompile(Deps.junit_jupiter_api)
        testCompile(Deps.junit_jupiter_params)
        testCompile(Deps.google_truth)
        testCompile(Deps.mockito_core)
        testRuntime(Deps.junit_jupiter_engine)
        testRuntime(Deps.slf4j_log4j12)
    }

    tasks.withType(KotlinCompile::class.java).all {
        kotlinOptions {
            jvmTarget = "1.8"
        }
    }

    tasks.withType(Test::class.java) {
        useJUnitPlatform()
    }
}