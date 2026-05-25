package com.graeseo.server.service

import com.graeseo.server.domain.StockEvent
import org.springframework.stereotype.Service

@Service
class EventService(private val feedLoader: FeedLoaderPort) {

    fun getByFilter(filter: String): List<StockEvent> {
        val events = feedLoader.loadLatest().events.sortedBy { it.daysLeft }
        return when (filter) {
            "all" -> events
            else -> events.filter { it.stock == filter }
        }
    }

    fun getById(id: String): StockEvent? =
        feedLoader.loadLatest().events.find { it.id == id }
}
