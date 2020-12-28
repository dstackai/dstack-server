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
    `maven-publish`
    signing
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

val sourceJar = task<Jar>("sourceJar") {
    description = "Creates a JAR that contains the source code."
    from(project.sourceSets["main"].allSource)
    classifier = "sources"
}
val javadocJar = task<Jar>("javadocJar") {
    dependsOn("javadoc")
    description = "Creates a JAR that contains the javadocs."
    from(tasks.named("javadoc"))
    classifier = "javadoc"
}

val publications: PublicationContainer = (extensions.getByName("publishing") as PublishingExtension).publications

signing {
    val signingKey: String? by project
    val signingPassword: String? by project
    useInMemoryPgpKeys(signingKey, signingPassword)
    sign(publications)
}

publishing {
    publications {
        create<MavenPublication>("bootJava") {
            artifact(tasks.getByName("bootJar"))
            artifact(sourceJar)
            artifact(javadocJar)

            pom {
                name.set("dstack Server Local CLI")
                description.set("A local version of the dstack server CLI")
                url.set("https://github.com/dstackai/dstack")

                scm {
                    connection.set("scm:git:https://github.com/dstackai/dstack/")
                    developerConnection.set("scm:git:https://github.com/dstackai/")
                    url.set("https://github.com/dstackai/dstack/")
                }

                licenses {
                    license {
                        name.set("Apache-2.0")
                        url.set("https://opensource.org/licenses/Apache-2.0")
                    }
                }

                developers {
                    developer {
                        id.set("peterschmidt85")
                        name.set("Peter Schmidt")
                        email.set("team@dstack.ai")
                    }
                }
            }
        }
    }
    repositories {
        maven {
            val releasesRepoUrl = "https://oss.sonatype.org/service/local/staging/deploy/maven2"
            val snapshotsRepoUrl = "https://oss.sonatype.org/content/repositories/snapshots"
            url = uri(if (version.toString().endsWith("SNAPSHOT")) snapshotsRepoUrl else releasesRepoUrl)
            credentials {
                username = System.getenv("MAVEN_USERNAME")
                password = System.getenv("MAVEN_PASSWORD")
            }
        }
    }
}
