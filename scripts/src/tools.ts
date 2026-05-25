import type Anthropic from '@anthropic-ai/sdk'
import type { StockKey } from './types.js'

export function buildTools(stocks: StockKey[] = ['tsla', 'pltr']): Anthropic.Tool[] {
  return [
    {
      name: 'generate_market_content',
      description: '웹 검색으로 발견한 이벤트를 바탕으로 이벤트 목록, 이벤트 설명, 마켓 토픽, 시나리오, 종목 내러티브를 생성한다.',
      input_schema: {
        type: 'object' as const,
        properties: {
          events: {
            type: 'array',
            description: '웹 검색으로 발견한 향후 2-3주 이내 주요 이벤트 목록 (3-6개)',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: '고유 이벤트 ID (영문 케밥케이스, 예: macro-fomc-jun, tsla-shareholder-2026)' },
                title: { type: 'string', description: '이벤트 제목 (한국어)' },
                date: { type: 'string', description: '이벤트 날짜 (M/D 형식, 예: 6/11)' },
                daysLeft: { type: 'integer', description: '오늘부터 이벤트까지 남은 일수' },
                stock: { type: 'string', description: '관련 종목: "tsla", "pltr", null 중 하나. 매크로 이벤트는 null' },
                importance: { type: 'string', enum: ['high', 'medium'], description: '주가 영향도' },
              },
              required: ['id', 'title', 'date', 'daysLeft', 'stock', 'importance'],
            },
          },
          eventDescriptions: {
            type: 'array',
            description: '각 이벤트에 대한 한국어 설명 (concept, why 필드 생성)',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'events 배열의 id와 동일한 값' },
                concept: { type: 'string', description: '"이게 뭐예요?" — 이벤트 개념 설명 (2-3문장, 쉬운 말로)' },
                why: { type: 'string', description: '"왜 중요해요?" — 내 종목에 미치는 영향 (2-3문장, 수치 포함)' },
                sources: {
                  type: 'array',
                  description: '이 설명의 근거 출처',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', description: '출처 제목 또는 문서명' },
                      url: { type: 'string', description: '직접 확인 가능한 URL' },
                    },
                    required: ['title', 'url'],
                  },
                },
              },
              required: ['id', 'concept', 'why', 'sources'],
            },
          },
          marketTopic: {
            type: 'object',
            description: '오늘의 시장 핵심 토픽',
            properties: {
              oneLine: { type: 'string', description: '한 줄 요약 (40자 이내)' },
              headline: { type: 'string', description: '헤드라인 (40자 이내)' },
              why: { type: 'string', description: '이 이슈가 시장 전체에 왜 중요한지 2-3문장. 특정 종목명(TSLA, PLTR 등) 언급 금지 — 종목 영향은 implications에서 다룸' },
              implications: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    stock: { type: 'string', enum: stocks },
                    verdict: { type: 'string', description: '이 종목에 미치는 영향 한 줄' },
                    strength: { type: 'integer', enum: [-2, -1, 0, 1, 2], description: '-2(강한 악재)~+2(강한 호재)' },
                    note: { type: 'string', description: '세부 설명 1-2문장' },
                  },
                  required: ['stock', 'verdict', 'strength', 'note'],
                },
              },
              sources: {
                type: 'array',
                description: '이 토픽의 근거 출처',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', description: '출처 제목 또는 문서명' },
                    url: { type: 'string', description: '직접 확인 가능한 URL' },
                  },
                  required: ['title', 'url'],
                },
              },
            },
            required: ['oneLine', 'headline', 'why', 'implications', 'sources'],
          },
          scenarios: {
            type: 'array',
            description: '이벤트별·종목별 시나리오 카드',
            items: {
              type: 'object',
              properties: {
                eventId: { type: 'string', description: 'events 배열의 id와 동일한 값' },
                stock: { type: 'string', enum: stocks },
                cards: {
                  type: 'array',
                  description: '2~3개 카드. 확률 합 = 100',
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
                      sources: {
                        type: 'array',
                        description: '이 시나리오 근거 출처',
                        items: {
                          type: 'object',
                          properties: {
                            title: { type: 'string', description: '출처 제목 또는 문서명' },
                            url: { type: 'string', description: '직접 확인 가능한 URL' },
                          },
                          required: ['title', 'url'],
                        },
                      },
                    },
                    required: ['kind', 'title', 'impact', 'oneLine', 'why', 'signals', 'probability', 'sources'],
                  },
                },
              },
              required: ['eventId', 'stock', 'cards'],
            },
          },
          narratives: {
            type: 'array',
            description: '종목별 요즘 내러티브',
            items: {
              type: 'object',
              properties: {
                stock: { type: 'string', enum: stocks },
                today: { type: 'string', description: '요즘 시장이 이 종목을 보는 시각과 그 이유, 다가오는 이벤트와의 연결 (2-3문장)' },
                sources: {
                  type: 'array',
                  description: '이 내러티브의 근거 출처',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string', description: '출처 제목 또는 문서명' },
                      url: { type: 'string', description: '직접 확인 가능한 URL' },
                    },
                    required: ['title', 'url'],
                  },
                },
              },
              required: ['stock', 'today', 'sources'],
            },
          },
        },
        required: ['events', 'eventDescriptions', 'marketTopic', 'scenarios', 'narratives'],
      },
    },
  ]
}
