import type Anthropic from '@anthropic-ai/sdk'
import type { GenerationInput } from './types.js'

export function buildTools(input: GenerationInput): Anthropic.Tool[] {
  const eventIds = input.events.map(e => e.id)

  return [
    {
      name: 'generate_market_content',
      description: '주어진 이벤트들을 분석해서 이벤트 설명, 마켓 토픽, 시나리오, 종목 내러티브를 생성한다.',
      input_schema: {
        type: 'object' as const,
        properties: {
          eventDescriptions: {
            type: 'array',
            description: '각 이벤트에 대한 한국어 설명 (concept, why 필드 생성)',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', enum: eventIds, description: '반드시 입력 이벤트 ID 그대로 사용' },
                concept: { type: 'string', description: '"이게 뭐예요?" — 이벤트 개념 설명 (2-3문장, 쉬운 말로)' },
                why: { type: 'string', description: '"왜 중요해요?" — 내 종목에 미치는 영향 (2-3문장, 수치 포함)' },
              },
              required: ['id', 'concept', 'why'],
            },
          },
          marketTopic: {
            type: 'object',
            description: '오늘의 시장 핵심 토픽',
            properties: {
              oneLine: { type: 'string', description: '한 줄 요약 (20자 이내)' },
              headline: { type: 'string', description: '헤드라인 (40자 이내)' },
              why: { type: 'string', description: '왜 중요한지 2-3문장' },
              implications: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    stock: { type: 'string', enum: ['tsla', 'pltr'] },
                    verdict: { type: 'string', description: '이 종목에 미치는 영향 한 줄' },
                    strength: { type: 'integer', enum: [-2, -1, 0, 1, 2], description: '-2(강한 악재)~+2(강한 호재)' },
                    note: { type: 'string', description: '세부 설명 1-2문장' },
                  },
                  required: ['stock', 'verdict', 'strength', 'note'],
                },
              },
            },
            required: ['oneLine', 'headline', 'why', 'implications'],
          },
          scenarios: {
            type: 'array',
            description: '이벤트별·종목별 시나리오 카드',
            items: {
              type: 'object',
              properties: {
                eventId: { type: 'string', enum: eventIds, description: '반드시 입력 이벤트 ID 그대로 사용' },
                stock: { type: 'string', enum: ['tsla', 'pltr'] },
                cards: {
                  type: 'array',
                  description: '2-3개 방향성 카드 (up/flat/down). 확률 합 = 100',
                  items: {
                    type: 'object',
                    properties: {
                      kind: { type: 'string', enum: ['up', 'flat', 'down'] },
                      title: { type: 'string', description: '시나리오 이름' },
                      impact: { type: 'string', description: '예상 주가 영향 (예: +5~8%)' },
                      oneLine: { type: 'string', description: '핵심 한 줄 요약' },
                      why: { type: 'string', description: '이 시나리오가 실현될 이유 2-3문장' },
                      signals: {
                        type: 'array',
                        description: '확인해야 할 신호 2-3개',
                        items: {
                          type: 'object',
                          properties: {
                            title: { type: 'string' },
                            description: { type: 'string' },
                          },
                          required: ['title', 'description'],
                        },
                      },
                      probability: { type: 'integer', description: '확률 (0-100)' },
                    },
                    required: ['kind', 'title', 'impact', 'oneLine', 'why', 'signals', 'probability'],
                  },
                },
              },
              required: ['eventId', 'stock', 'cards'],
            },
          },
          narratives: {
            type: 'array',
            description: '종목별 오늘의 한 줄 코멘트',
            items: {
              type: 'object',
              properties: {
                stock: { type: 'string', enum: ['tsla', 'pltr'] },
                today: { type: 'string', description: '오늘 이 종목에 대해 알아야 할 것 (2-3문장)' },
              },
              required: ['stock', 'today'],
            },
          },
        },
        required: ['eventDescriptions', 'marketTopic', 'scenarios', 'narratives'],
      },
    },
  ]
}
