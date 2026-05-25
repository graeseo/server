import 'dotenv/config'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import admin from 'firebase-admin'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../../output')

const TOPIC = 'graeseo-events'
const APPROACHING_DAYS = 3

interface Event {
  id: string
  title: string
  daysLeft: number
  stock: string | null
}

interface FeedJson {
  events: Event[]
}

function loadJson(path: string): FeedJson | null {
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return null
  }
}

function todayPath(): string {
  const d = new Date()
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return join(outDir, `${dateStr}.json`)
}

function prevPath(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return join(outDir, `${dateStr}.json`)
}

async function sendFcm(title: string, body: string) {
  await admin.messaging().send({
    topic: TOPIC,
    notification: { title, body },
    apns: {
      payload: { aps: { sound: 'default' } },
    },
    android: {
      priority: 'high',
      notification: { sound: 'default' },
    },
  })
  console.log(`📤 FCM 발송: ${title}`)
}

async function main() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!serviceAccountJson) {
    console.error('❌ FIREBASE_SERVICE_ACCOUNT 환경 변수가 없습니다. 알림 건너뜀.')
    process.exit(0)
  }

  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccountJson)),
  })

  const today = loadJson(todayPath())
  if (!today) {
    console.error('❌ 오늘 JSON 없음. 알림 건너뜀.')
    process.exit(0)
  }

  const prev = loadJson(prevPath())
  const prevIds = new Set(prev?.events.map(e => e.id) ?? [])

  // 새로 추가된 이벤트
  const newEvents = today.events.filter(e => !prevIds.has(e.id))
  for (const ev of newEvents) {
    const label = ev.stock ? ev.stock.toUpperCase() : '시장'
    await sendFcm(
      `📅 새 주요 일정 추가 [${label}]`,
      `${ev.title} — D-${ev.daysLeft}`
    )
  }

  // D-3 이하 임박 이벤트 (새로 추가된 건 제외, 중복 방지)
  const newEventIds = new Set(newEvents.map(e => e.id))
  const approaching = today.events.filter(
    e => e.daysLeft <= APPROACHING_DAYS && e.daysLeft >= 1 && !newEventIds.has(e.id)
  )
  for (const ev of approaching) {
    const label = ev.stock ? ev.stock.toUpperCase() : '시장'
    await sendFcm(
      `⏰ 주요 일정 D-${ev.daysLeft} [${label}]`,
      ev.title
    )
  }

  if (newEvents.length === 0 && approaching.length === 0) {
    console.log('ℹ️  알림 없음 (새 이벤트 없음, D-3 이하 없음)')
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
