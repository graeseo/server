export type StockKey = 'tsla' | 'pltr'

export interface StockEvent {
  id: string
  title: string
  date: string
  day: string
  daysLeft: number
  stock: StockKey | null
  concept: string
  why: string
  importance: 'high' | 'medium'
}

export interface MarketTopicImplication {
  stock: StockKey
  verdict: string
  strength: -2 | -1 | 0 | 1 | 2
  note: string
}

export interface MarketTopic {
  oneLine: string
  headline: string
  why: string
  implications: MarketTopicImplication[]
}

export type ScenarioDirection = 'up' | 'flat' | 'down'

export interface ScenarioSignal {
  title: string
  description: string
}

export interface ScenarioCard {
  kind: ScenarioDirection
  title: string
  impact: string
  oneLine: string
  why: string
  signals: ScenarioSignal[]
  probability: number
}

export interface Scenario {
  eventId: string
  stock: StockKey
  cards: ScenarioCard[]
}

export interface StockNarrative {
  stock: StockKey
  today: string
}

export interface GenerationInput {
  date: string
  events: Array<{
    id: string
    title: string
    date: string
    daysLeft: number
    stock: StockKey | null
    importance: 'high' | 'medium'
  }>
  stocks: StockKey[]
}

export interface StockPrice {
  key: StockKey
  priceUSD: number
  changePercent: number
}

export interface GenerationOutput {
  generatedAt: string
  stockPrices: StockPrice[]
  events: StockEvent[]
  marketTopic: MarketTopic
  scenarios: Scenario[]
  narratives: StockNarrative[]
}
