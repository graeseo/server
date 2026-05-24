package com.graeseo.server.service

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.graeseo.server.domain.Stock
import com.graeseo.server.domain.StockNarrative
import org.springframework.stereotype.Service

@Service
class StockService(private val feedLoader: FeedLoaderPort) {

    private val mapper = jacksonObjectMapper()

    private val stocks: List<Stock> by lazy {
        val resource = javaClass.classLoader.getResourceAsStream("stocks.json")
            ?: error("stocks.json not found in resources")
        mapper.readValue(resource)
    }

    fun getAll(): List<Stock> = stocks

    fun getByKey(key: String): Stock? = stocks.find { it.key == key }

    fun getNarratives(): List<StockNarrative> = feedLoader.loadLatest().narratives
}
