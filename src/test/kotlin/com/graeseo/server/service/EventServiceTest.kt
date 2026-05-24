package com.graeseo.server.service

import com.graeseo.server.domain.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class EventServiceTest {

    private lateinit var service: EventService
    private val events = listOf(
        StockEvent("tsla-evt-1", "테슬라 주총", "6/10", "수", 16, "tsla", "개념", "이유", "high"),
        StockEvent("macro-fomc", "FOMC", "6/11", "목", 17, null, "개념", "이유", "high"),
        StockEvent("pltr-evt-1", "AIPCon 5", "6/5", "금", 11, "pltr", "개념", "이유", "high"),
    )

    @BeforeEach
    fun setUp() {
        val feedLoader = FakeFeedLoader(events = events)
        service = EventService(feedLoader)
    }

    @Nested
    inner class `getByFilter` {
        @Test
        fun `all 필터는 전체 이벤트를 반환한다`() {
            assertEquals(3, service.getByFilter("all").size)
        }

        @Test
        fun `tsla 필터는 tsla 종목 이벤트만 반환한다`() {
            val result = service.getByFilter("tsla")
            assertEquals(1, result.size)
            assertEquals("tsla-evt-1", result[0].id)
        }

        @Test
        fun `거시 이벤트는 종목 필터에 포함되지 않는다`() {
            val result = service.getByFilter("tsla")
            assertTrue(result.none { it.stock == null })
        }
    }

    @Nested
    inner class `getById` {
        @Test
        fun `존재하는 id로 조회하면 이벤트를 반환한다`() {
            val result = service.getById("macro-fomc")
            assertNotNull(result)
            assertEquals("FOMC", result!!.title)
        }

        @Test
        fun `없는 id는 null을 반환한다`() {
            assertNull(service.getById("nonexistent"))
        }
    }
}
