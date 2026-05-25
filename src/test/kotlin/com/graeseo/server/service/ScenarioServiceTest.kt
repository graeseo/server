package com.graeseo.server.service

import com.graeseo.server.domain.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class ScenarioServiceTest {

    private lateinit var service: ScenarioService
    private val scenarios = listOf(
        Scenario("tsla-evt-1", "tsla", listOf(
            ScenarioCard("up", "강세", "+8%", "요약", "이유", emptyList(), 40),
            ScenarioCard("down", "약세", "-5%", "요약", "이유", emptyList(), 60),
        )),
        Scenario("macro-fomc", "tsla", listOf(
            ScenarioCard("up", "강세", "+5%", "요약", "이유", emptyList(), 50),
            ScenarioCard("down", "약세", "-3%", "요약", "이유", emptyList(), 50),
        )),
        Scenario("macro-fomc", "pltr", listOf(
            ScenarioCard("up", "강세", "+7%", "요약", "이유", emptyList(), 60),
            ScenarioCard("down", "약세", "-4%", "요약", "이유", emptyList(), 40),
        )),
    )

    @BeforeEach
    fun setUp() {
        service = ScenarioService(FakeFeedLoader(scenarios = scenarios))
    }

    @Test
    fun `eventId와 stock으로 단건 조회한다`() {
        val result = service.getByEventAndStock("tsla-evt-1", "tsla")
        assertNotNull(result)
        assertEquals("tsla", result!!.stock)
        assertEquals(2, result.cards.size)
    }

    @Test
    fun `없는 조합은 null을 반환한다`() {
        assertNull(service.getByEventAndStock("tsla-evt-1", "pltr"))
    }

    @Test
    fun `eventId로 모든 종목 시나리오를 반환한다`() {
        val result = service.getByEvent("macro-fomc")
        assertEquals(2, result.size)
        assertTrue(result.any { it.stock == "tsla" })
        assertTrue(result.any { it.stock == "pltr" })
    }
}
