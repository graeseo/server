package com.graeseo.server.service

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.io.File

class FeedLoaderTest {

    private val testJson = File(
        FeedLoaderTest::class.java.classLoader.getResource("feed-test.json")!!.toURI()
    )

    @Test
    fun `JSON 파일을 읽어 FeedData를 반환한다`() {
        val loader = FeedLoader(testJson.parentFile)
        val feed = loader.loadLatest()

        assertEquals(2, feed.events.size)
        assertEquals(1, feed.scenarios.size)
        assertEquals(2, feed.narratives.size)
    }

    @Test
    fun `이벤트 날짜로 요일을 계산한다`() {
        val loader = FeedLoader(testJson.parentFile)
        val feed = loader.loadLatest()

        val tslaEvent = feed.events.find { it.id == "tsla-shareholder-2026" }!!
        // 6/10 2026년 = 수요일
        assertEquals("수", tslaEvent.day)
    }

    @Test
    fun `파일이 없으면 NoSuchElementException을 던진다`() {
        val loader = FeedLoader(File("/nonexistent/path"))
        assertThrows<NoSuchElementException> { loader.loadLatest() }
    }
}
