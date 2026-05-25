import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { buildPrompt } from './prompt.js'
import { buildTools } from './tools.js'
import { validate } from './validate.js'
import type { GenerationInput, GenerationOutput, StockKey } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Input ──────────────────────────────────────────────────────

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const now = new Date()
const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} (${WEEKDAYS[now.getDay()]})`

const input: GenerationInput = {
  date: dateStr,
  stocks: ['tsla', 'pltr'] as StockKey[],
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다.')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })
  const MODEL = (process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6') as Anthropic.Model

  console.log('🤖 Claude API 호출 중...')
  console.log(`   날짜: ${input.date}`)
  console.log(`   종목: ${input.stocks.join(', ')}`)
  console.log(`   모델: ${MODEL}\n`)

  // web_search: Anthropic 서버사이드 툴 (직접 실행 불필요)
  // generate_market_content: 사용자 정의 툴
  const allTools = [
    { type: 'web_search_20250305', name: 'web_search' },
    ...buildTools(input.stocks),
  ] as Anthropic.Tool[]

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: buildPrompt(input) },
  ]

  let raw: Record<string, unknown> | null = null
  let totalIn = 0
  let totalOut = 0
  const MAX_ITER = 10

  for (let iter = 0; iter < MAX_ITER; iter++) {
    console.log(`🔄 API 호출 (${iter + 1}/${MAX_ITER})...`)

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 16000,
      tools: allTools,
      messages,
    })

    totalIn += response.usage.input_tokens
    totalOut += response.usage.output_tokens

    const genUse = response.content.find(
      b => b.type === 'tool_use' && b.name === 'generate_market_content'
    )

    if (genUse && genUse.type === 'tool_use') {
      raw = genUse.input as Record<string, unknown>
      console.log('✅ 콘텐츠 생성 완료')
      break
    }

    if (response.stop_reason === 'end_turn') {
      console.error('❌ generate_market_content 호출 없이 종료됨')
      process.exit(1)
    }

    // 사용자 정의 tool_use 에 대해 tool_result 반환하며 루프 계속
    messages.push({ role: 'assistant', content: response.content })

    const pendingToolUses = response.content.filter(
      b => b.type === 'tool_use'
    ) as Anthropic.ToolUseBlock[]

    if (pendingToolUses.length > 0) {
      messages.push({
        role: 'user',
        content: pendingToolUses.map(b => ({
          type: 'tool_result' as const,
          tool_use_id: b.id,
          content: 'Completed.',
        })),
      })
    }
  }

  if (!raw) {
    console.error(`❌ 최대 반복 횟수(${MAX_ITER})에 도달했습니다.`)
    process.exit(1)
  }

  // ── Build output ──────────────────────────────────────────────

  const rawEvents = (raw.events as Array<{
    id: string; title: string; date: string; daysLeft: number
    stock: string | null; importance: 'high' | 'medium'
  }> ?? [])

  const eventDescriptions = (raw.eventDescriptions as Array<{
    id: string; concept: string; why: string
  }> ?? [])

  const output: GenerationOutput = {
    events: rawEvents.map(e => {
      const desc = eventDescriptions.find(d => d.id === e.id)
      return {
        id: e.id,
        title: e.title,
        date: e.date,
        day: '',
        daysLeft: e.daysLeft,
        stock: (e.stock || null) as StockKey | null,
        concept: desc?.concept ?? '',
        why: desc?.why ?? '',
        importance: e.importance,
      }
    }),
    marketTopic: raw.marketTopic as GenerationOutput['marketTopic'],
    scenarios: raw.scenarios as GenerationOutput['scenarios'],
    narratives: raw.narratives as GenerationOutput['narratives'],
  }

  // ── Validate ─────────────────────────────────────────────────
  const errors = validate(output)
  if (errors.length > 0) {
    console.error(`❌ 검증 오류 ${errors.length}건 — 저장 중단`)
    for (const e of errors) console.error(`   [${e.path}] ${e.message}`)
    process.exit(1)
  }
  console.log('✅ 검증 통과')

  // ── Print preview ─────────────────────────────────────────────
  const mt = output.marketTopic
  console.log('\n── 마켓 토픽 ─────────────────────────────────────')
  console.log(`📌 ${mt.oneLine}`)
  console.log(`📰 ${mt.headline}`)

  console.log('\n── 이벤트 목록 ───────────────────────────────────')
  for (const ev of output.events) {
    const stockLabel = ev.stock ? `[${ev.stock.toUpperCase()}]` : '[매크로]'
    console.log(`${stockLabel} ${ev.title} | ${ev.date} (D-${ev.daysLeft})`)
  }

  console.log('\n── 시나리오 ──────────────────────────────────────')
  for (const sc of (output.scenarios ?? [])) {
    console.log(`\n[${sc.stock.toUpperCase()}] ${sc.eventId}`)
    for (const card of sc.cards) {
      const icon = card.kind === 'up' ? '🔴' : card.kind === 'down' ? '🔵' : '⚪'
      console.log(`  ${icon} ${card.title} (${card.probability}%) | ${card.impact}`)
    }
  }

  console.log('\n── 종목 내러티브 ─────────────────────────────────')
  for (const n of output.narratives) {
    console.log(`[${n.stock.toUpperCase()}] ${n.today.slice(0, 60)}...`)
  }

  // ── Save ──────────────────────────────────────────────────────
  const outDir = join(__dirname, '../../output')
  mkdirSync(outDir, { recursive: true })

  const filename = `${input.date.slice(0, 10)}.json`
  const outPath = join(outDir, filename)
  writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8')
  console.log(`\n💾 저장 완료: output/${filename}`)
  console.log(`📊 토큰 사용량: 입력 ${totalIn} / 출력 ${totalOut}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
