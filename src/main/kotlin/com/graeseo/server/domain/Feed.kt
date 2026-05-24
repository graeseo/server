package com.graeseo.server.domain

typealias StockKey = String

data class Stock(
    val key: StockKey,
    val ticker: String,
    val name: String,
    val mark: String,
    val priceUSD: Double,
    val changePercent: Double,
)

data class StockEvent(
    val id: String,
    val title: String,
    val date: String,
    val day: String,
    val daysLeft: Int,
    val stock: StockKey?,
    val concept: String,
    val why: String,
    val importance: String,
)

data class MarketTopicImplication(
    val stock: StockKey,
    val verdict: String,
    val strength: Int,
    val note: String,
)

data class MarketTopic(
    val oneLine: String,
    val headline: String,
    val why: String,
    val implications: List<MarketTopicImplication>,
)

data class ScenarioSignal(
    val title: String,
    val description: String,
)

data class ScenarioCard(
    val kind: String,
    val title: String,
    val impact: String,
    val oneLine: String,
    val why: String,
    val signals: List<ScenarioSignal>,
    val probability: Int,
)

data class Scenario(
    val eventId: String,
    val stock: StockKey,
    val cards: List<ScenarioCard>,
)

data class StockNarrative(
    val stock: StockKey,
    val today: String,
)

data class FeedData(
    val events: List<StockEvent>,
    val marketTopic: MarketTopic,
    val scenarios: List<Scenario>,
    val narratives: List<StockNarrative>,
)
