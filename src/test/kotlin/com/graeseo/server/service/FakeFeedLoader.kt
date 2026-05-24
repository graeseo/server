package com.graeseo.server.service

import com.graeseo.server.domain.*

class FakeFeedLoader(
    private val events: List<StockEvent> = emptyList(),
    private val marketTopic: MarketTopic = MarketTopic("", "", "", emptyList()),
    private val scenarios: List<Scenario> = emptyList(),
    private val narratives: List<StockNarrative> = emptyList(),
) : FeedLoaderPort {

    override fun loadLatest(): FeedData = FeedData(
        events = events,
        marketTopic = marketTopic,
        scenarios = scenarios,
        narratives = narratives,
    )
}
