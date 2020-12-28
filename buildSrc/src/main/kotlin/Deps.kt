object Deps {
    // Versions
    const val KOTLIN_VERSION = "1.3.72"
    const val JERSEY_VERSION = "2.26"
    const val SLF4J_VERSION = "1.8.0-beta2"
    const val JACKSON_VERSION = "2.9.9.2"
    const val JACKSON_VERSION_MIN = "2.9.9"
    const val JUNIT_VERSION = "5.1.0"

    val commons_codec = "commons-codec:commons-codec:1.14"

    val kotlin_stdlib_jdk8 = "org.jetbrains.kotlin:kotlin-stdlib-jdk8:$KOTLIN_VERSION"

    // Web framework
    val javax_ws_rs_api = "javax.ws.rs:javax.ws.rs-api:2.1"
    val javax_servlet_api = "jakarta.servlet:jakarta.servlet-api:4.0.3"
    val jersey_server = "org.glassfish.jersey.core:jersey-server:$JERSEY_VERSION"
    val jersey_media_json_jackson = "org.glassfish.jersey.media:jersey-media-json-jackson:$JERSEY_VERSION"

    // DI libraries
    val jersey_hk2 = "org.glassfish.jersey.inject:jersey-hk2:$JERSEY_VERSION"
    val jaxb = "javax.xml.bind:jaxb-api:2.3.0"
    val activation = "javax.activation:activation:1.1.1"

    // JSON
    val jackson_databind = "com.fasterxml.jackson.core:jackson-databind:$JACKSON_VERSION"
    val jackson_datatype_jsr310 = "com.fasterxml.jackson.datatype:jackson-datatype-jsr310:$JACKSON_VERSION_MIN"
    val jackson_module_kotlin = "com.fasterxml.jackson.module:jackson-module-kotlin:$JACKSON_VERSION_MIN"

    val commons_io = "commons-io:commons-io:2.6"

    // YAML
    val jackson_yaml = "com.fasterxml.jackson.dataformat:jackson-dataformat-yaml:$JACKSON_VERSION_MIN"

    // Ansi
    val jansi = "org.fusesource.jansi:jansi:2.1.1"

    // Logging
    val jcl_over_slf4j = "org.slf4j:jcl-over-slf4j:$SLF4J_VERSION"
    val slf4j_log4j12 = "org.slf4j:slf4j-log4j12:$SLF4J_VERSION"
    val kotlin_logging = "io.github.microutils:kotlin-logging:1.5.3"

    // Spring
    val spring_context = "org.springframework:spring-context:5.2.5.RELEASE"
    val spring_bridge = "org.glassfish.hk2:spring-bridge:2.6.1"
    val spring_boot_starter_jersey = "org.springframework.boot:spring-boot-starter-jersey:2.2.6.RELEASE"
    val spring_boot_starter_web = "org.springframework.boot:spring-boot-starter-web:2.2.6.RELEASE"

    // SQLite
    var sqlite_jdbc = "org.xerial:sqlite-jdbc:3.31.1"
    var spring_data_jpa = "org.springframework.boot:spring-boot-starter-data-jpa:2.2.6.RELEASE"
    var sqlite_dialect = "com.github.gwenn:sqlite-dialect:0.1.0"

    // Command line
    var commons_cli = "commons-cli:commons-cli:1.4"

    // Testing
    val junit_jupiter_api = "org.junit.jupiter:junit-jupiter-api:$JUNIT_VERSION"
    val junit_jupiter_engine = "org.junit.jupiter:junit-jupiter-engine:$JUNIT_VERSION"
    val junit_jupiter_params = "org.junit.jupiter:junit-jupiter-params:$JUNIT_VERSION"
    val google_truth = "com.google.truth:truth:0.39"
    val mockito_core = "org.mockito:mockito-core:2.23.0"

    val junit_vintage_engine = "org.junit.vintage:junit-vintage-engine:$JUNIT_VERSION"
    val jersey_test_framework_core = "org.glassfish.jersey.test-framework:jersey-test-framework-core:2.30"
    val jersey_test_framework_grizzly2 = "org.glassfish.jersey.test-framework.providers:jersey-test-framework-provider-grizzly2:2.30"
}