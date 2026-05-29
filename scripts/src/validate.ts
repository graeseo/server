import type { GenerationOutput } from './types.js'

interface ValidationError {
  path: string
  message: string
}

export function validate(output: GenerationOutput): ValidationError[] {
  const errors: ValidationError[] = []

  // MarketTopic
  const mt = output.marketTopic
  if (!mt.oneLine) errors.push({ path: 'marketTopic.oneLine', message: '누락' })
  if (!mt.headline) errors.push({ path: 'marketTopic.headline', message: '누락' })
  if (!mt.why) errors.push({ path: 'marketTopic.why', message: '누락' })
  if (!Array.isArray(mt.implications)) {
    errors.push({ path: 'marketTopic.implications', message: `배열이 아님: ${typeof mt.implications}` })
    return errors
  }
  if (!mt.implications.find(i => i.stock === 'tsla')) errors.push({ path: 'marketTopic.implications', message: 'tsla 없음' })
  if (!mt.implications.find(i => i.stock === 'pltr')) errors.push({ path: 'marketTopic.implications', message: 'pltr 없음' })

  for (const imp of mt.implications) {
    if (![-2, -1, 0, 1, 2].includes(imp.strength)) {
      errors.push({ path: `marketTopic.implications[${imp.stock}].strength`, message: `범위 초과: ${imp.strength}` })
    }
  }

  // Scenarios — 모든 이벤트에 대한 시나리오 존재 여부 검사
  if (!Array.isArray(output.scenarios)) {
    errors.push({ path: 'scenarios', message: `배열이 아님: ${typeof output.scenarios}` })
    return errors
  }

  if (output.scenarios.length === 0) {
    errors.push({ path: 'scenarios', message: '시나리오 없음' })
  }

  for (const ev of (output.events ?? [])) {
    if (ev.stock === null) {
      if (!output.scenarios?.find(s => s.eventId === ev.id && s.stock === 'tsla'))
        errors.push({ path: 'scenarios', message: `매크로 이벤트 [${ev.id}] tsla 시나리오 없음` })
      if (!output.scenarios?.find(s => s.eventId === ev.id && s.stock === 'pltr'))
        errors.push({ path: 'scenarios', message: `매크로 이벤트 [${ev.id}] pltr 시나리오 없음` })
    } else {
      if (!output.scenarios?.find(s => s.eventId === ev.id && s.stock === ev.stock))
        errors.push({ path: 'scenarios', message: `종목 이벤트 [${ev.id}] ${ev.stock} 시나리오 없음` })
    }
  }

  for (const sc of (output.scenarios ?? [])) {
    const prefix = `scenarios[${sc.eventId}/${sc.stock}]`

    if (sc.cards.length < 2) {
      errors.push({ path: `${prefix}.cards`, message: `카드 수 부족: ${sc.cards.length}` })
    }

    const probSum = sc.cards.reduce((s, c) => s + c.probability, 0)
    if (probSum !== 100) {
      errors.push({ path: `${prefix}.cards`, message: `확률 합 != 100: ${probSum}` })
    }

    for (const card of sc.cards) {
      if (!card.impact.match(/[+\-±]?\d/)) {
        errors.push({ path: `${prefix}.cards[${card.kind}].impact`, message: `수치 없음: "${card.impact}"` })
      }
      if (card.signals.length < 2) {
        errors.push({ path: `${prefix}.cards[${card.kind}].signals`, message: `신호 수 부족: ${card.signals.length}` })
      }
    }
  }

  // Events concept/why
  for (const ev of (output.events ?? [])) {
    if (!ev.concept) errors.push({ path: `events[${ev.id}].concept`, message: '빈 값' })
    if (!ev.why) errors.push({ path: `events[${ev.id}].why`, message: '빈 값' })
  }

  // Narratives
  if (!Array.isArray(output.narratives)) {
    errors.push({ path: 'narratives', message: `배열이 아님: ${typeof output.narratives}` })
  } else {
    if (!output.narratives.find(n => n.stock === 'tsla')) errors.push({ path: 'narratives', message: 'tsla 없음' })
    if (!output.narratives.find(n => n.stock === 'pltr')) errors.push({ path: 'narratives', message: 'pltr 없음' })
  }

  return errors
}
