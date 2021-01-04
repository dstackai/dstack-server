package ai.dstack.server.jersey.resources.payload.resources

import ai.dstack.server.jersey.resources.payload.PushPayload
import ai.dstack.server.jersey.resources.payload.PushPayloadAttachment
import ai.dstack.server.jersey.resources.stacks.isMalformed
import com.google.common.truth.Truth
import org.junit.jupiter.api.Test

class PushPayloadTest {
    @Test
    fun testPushPayloadIsMalformed() {
        // no attachments
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = 0,
                        attachments = null,
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isTrue()

        // not a single attachment
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = 0,
                        attachments = listOf(
                                PushPayloadAttachment( null, null, "haha", null, emptyMap(), emptyMap()),
                                PushPayloadAttachment(null, null, "hoho", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isTrue()

        // no type
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = null,
                        index = null,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, "haha", null, emptyMap(), emptyMap()),
                                PushPayloadAttachment(null, null, "hoho", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isTrue()

        // no type in attach
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = null,
                        index = null,
                        attachments = listOf(
                                PushPayloadAttachment("image/png", null, "haha", null, emptyMap(), emptyMap()),
                                PushPayloadAttachment(null, null, "hoho", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isTrue()

        // type in attach
        Truth.assertThat(PushPayload(
                stack = "cheptsov/test",
                id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                timestamp = 1576576185056296,
                application = null,
                contentType = null,
                index = null,
                attachments = listOf(
                        PushPayloadAttachment(null, "image/png", "haha", null, emptyMap(), emptyMap()),
                        PushPayloadAttachment(null, "image/png", "hoho", null, emptyMap(), emptyMap())
                ),
                size = null,
                params = null,
                settings = null
        ).isMalformed).isFalse()

        // no timestamp
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = null,
                        application = null,
                        contentType = "image/png",
                        index = null,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, "haha", null, emptyMap(), emptyMap()),
                                PushPayloadAttachment(null, null, "hoho", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isTrue()

        // no id
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/test",
                        id = null,
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = null,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, "haha", null, emptyMap(), emptyMap()),
                                PushPayloadAttachment(null, null, "hoho", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isTrue()

        // no stack
        Truth.assertThat(
                PushPayload(
                        stack = null,
                        id = "f71e42ae-5209-4d21-933c-883d75722cf6",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = null,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, "haha", null, emptyMap(), emptyMap()),
                                PushPayloadAttachment(null, null, "hoho", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isTrue()

        // ok
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = 0,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, "haha", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isFalse()

        // ok
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = null,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, "haha", null, emptyMap(), emptyMap()),
                                PushPayloadAttachment(null, null, "hoho", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isFalse()

        // ok
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = null,
                        attachments = null,
                        size = 1,
                        params = null,
                        settings = null
                ).isMalformed
        ).isFalse()

        // ok
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/folder/test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = 0,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, "haha", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isFalse()

        // ok
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/folder/test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = 0,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, null, 10000L, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isFalse()

        // not ok
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/test/",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = 0,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, "haha", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isTrue()

        // not ok
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov//test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = 0,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, "haha", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isTrue()

        // not ok
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/folder//test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = 0,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, "haha", null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isTrue()

        // no data and no length
        Truth.assertThat(
                PushPayload(
                        stack = "cheptsov/test",
                        id = "1819447e-97c8-44c4-ae50-3c6d6fa83237",
                        timestamp = 1576576185056296,
                        application = null,
                        contentType = "image/png",
                        index = 0,
                        attachments = listOf(
                                PushPayloadAttachment(null, null, null, null, emptyMap(), emptyMap())
                        ),
                        size = null,
                        params = null,
                        settings = null
                ).isMalformed
        ).isTrue()
    }
}