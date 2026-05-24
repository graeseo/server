package com.graeseo.server.service

import com.graeseo.server.domain.Scenario
import org.springframework.stereotype.Service

@Service
class ScenarioService(private val feedLoader: FeedLoaderPort) {

    fun getByEventAndStock(eventId: String, stock: String): Scenario? =
        feedLoader.loadLatest().scenarios.find { it.eventId == eventId && it.stock == stock }

    fun getByEvent(eventId: String): List<Scenario> =
        feedLoader.loadLatest().scenarios.filter { it.eventId == eventId }
}
