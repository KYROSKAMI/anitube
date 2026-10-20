package com.anitube.app

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Test

class AnivexaMappingTest {

    @Test
    fun testEpisodeJsonParsing() {
        val jsonString = """
            {
              "id": "watch/reanime/16498/sub/reanime-1",
              "number": 1,
              "title": "To You, 2000 Years in the Future",
              "audio": "sub",
              "filler": false
            }
        """.trimIndent()

        val json = JSONObject(jsonString)
        assertEquals("watch/reanime/16498/sub/reanime-1", json.getString("id"))
        assertEquals(1, json.getInt("number"))
        assertEquals("To You, 2000 Years in the Future", json.getString("title"))
        assertEquals("sub", json.getString("audio"))
    }

    @Test
    fun testStreamResponseParsing() {
        val streamJson = """
            {
              "anime": "Attack on Titan",
              "stream_url": "https://example.com/master.m3u8",
              "server": "HD-1",
              "audio": "sub"
            }
        """.trimIndent()

        val json = JSONObject(streamJson)
        assertNotNull(json.getString("stream_url"))
        assertEquals("https://example.com/master.m3u8", json.getString("stream_url"))
    }
}
