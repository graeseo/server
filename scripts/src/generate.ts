import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { buildPrompt } from './prompt.js'
import { buildTools } from './tools.js'
import { validate } from './validate.js'
import type { GenerationInput, GenerationOutput } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Input ──────────────────────────────────────────────────────

const input: GenerationInput = {
  date: '2026-05-25 (월)',
  stocks: ['tsla', 'pltr'],
  events: [
    {
      id: 'macro-fomc-jun',
      title: '6월 FOMC 회의',
      date: '6/11',
      daysLeft: 17,
      stock: null,
      importance: 'high',
    },
    {
      id: 'macro-options-jun',
      title: '6월 옵션 만기일',
      date: '6/20',
      daysLeft: 26,
      stock: null,
      importance: 'medium',
    },
    {
      id: 'tsla-shareholder-2026',
      title: '테슬라 주주총회',
      date: '6/10',
      daysLeft: 16,
      stock: 'tsla',
      importance: 'high',
    },
    {
      id: 'pltr-aiplatform-jun',
      title: 'AIPCon 5 (팔란티어 AI 컨퍼런스)',
      date: '6/5',
      daysLeft: 11,
      stock: 'pltr',
      importance: 'high',
    },
  ],
}

// ── Main ───────────────────────────────────────────────────────

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY 환경 변수가 설정되지 않았습니다.')
    process.exit(1)
  }

  const client = new Anthropic({ apiKey })

  console.log('🤖 Claude API 호출 중...')
  console.log(`   날짜: ${input.date}`)
  console.log(`   이벤트: ${input.events.length}개`)
  console.log(`   종목: ${input.stocks.join(', ')}\n`)

  const tools = buildTools(input)

  const response = await client.messages.create({
    model: (process.env.CLAUDE_MODEL ?? 'claude-haiku-4-5-20251001') as Anthropic.Model,
    max_tokens: 12000,
    tools,
    tool_choice: { type: 'any' },
    messages: [{ role: 'user', content: buildPrompt(input) }],
  })

  const toolUse = response.content.find(b => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    console.error('tool_use 블록을 찾을 수 없습니다.')
    console.error(JSON.stringify(response.content, null, 2))
    process.exit(1)
  }

  const raw = toolUse.input as Record<string, unknown>
  const eventDescriptions = (raw.eventDescriptions as Array<{ id: string; concept: string; why: string }> ?? [])

  const output: GenerationOutput = {
    events: input.events.map(e => {
      const desc = eventDescriptions.find(d => d.id === e.id)
      return {
        id: e.id,
        title: e.title,
        date: e.date,
        day: '',
        daysLeft: e.daysLeft,
        stock: e.stock,
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

  console.log('\n── 이벤트 설명 ───────────────────────────────────')
  for (const ev of output.events) {
    if (ev.concept) console.log(`[${ev.id}] ${ev.concept.slice(0, 40)}...`)
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
  console.log(`📊 토큰 사용량: 입력 ${response.usage.input_tokens} / 출력 ${response.usage.output_tokens}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
