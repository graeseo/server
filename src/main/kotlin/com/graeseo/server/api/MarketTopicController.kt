package com.graeseo.server.api

import com.graeseo.server.domain.MarketTopic
import com.graeseo.server.service.MarketTopicService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/market-topic")
class MarketTopicController(private val marketTopicService: MarketTopicService) {

    @GetMapping
    fun get(): MarketTopic = marketTopicService.get()
}
