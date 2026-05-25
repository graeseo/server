package com.graeseo.server.service

import com.graeseo.server.domain.MarketTopic
import org.springframework.stereotype.Service

@Service
class MarketTopicService(private val feedLoader: FeedLoaderPort) {

    fun get(): MarketTopic = feedLoader.loadLatest().marketTopic
}
