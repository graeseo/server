import type { GenerationInput } from './types.js'

export function buildPrompt(input: GenerationInput): string {
  const eventsText = input.events
    .map(e => {
      const stockLabel = e.stock ? `[${e.stock.toUpperCase()}]` : '[매크로]'
      return `- ${stockLabel} ${e.title} | ${e.date} (D-${e.daysLeft}) | 중요도: ${e.importance}`
    })
    .join('\n')

  return `당신은 미국 주식 전문 애널리스트입니다. 개인 투자자들에게 이벤트 기반 시나리오 분석을 제공합니다.

오늘 날짜: ${input.date}
분석 대상 종목: ${input.stocks.map(s => s.toUpperCase()).join(', ')}

## 이번 주 주요 이벤트
${eventsText}

## 작업 지시

위 이벤트들을 바탕으로 다음을 생성하세요:

1. **오늘의 시장 토픽** (marketTopic)
   - 투자자가 오늘 가장 주목해야 할 핵심 이슈 1개
   - TSLA, PLTR 각각에 미치는 영향 분석

2. **이벤트별 시나리오 카드** (scenarios)
   - 각 이벤트마다, 관련 종목의 시나리오 카드 생성
   - 매크로 이벤트(stock=null)는 TSLA, PLTR 양쪽 모두 생성
   - 각 시나리오: up/down 2개 필수, flat은 선택
   - 확률 합이 반드시 100이 되어야 함
   - 한국어로 작성, 실용적이고 구체적으로

3. **종목별 오늘의 내러티브** (narratives)
   - TSLA, PLTR 각각 오늘 알아야 할 핵심 2-3문장

## 작성 기준
- 개인 투자자 눈높이: 전문 용어보다 쉬운 설명
- 과장 금지: 근거 없는 낙관/비관 배제
- 구체성: "상승 가능" 보다 "+3~5%" 같은 수치 포함
- 한국어로 작성`
}
