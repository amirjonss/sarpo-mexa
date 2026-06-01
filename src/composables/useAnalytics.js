// Lightweight client-side analytics that posts visit logs straight to a
// Telegram chat via the Bot API. There is no backend, so the bot token and
// target chat are read from build-time env vars (see .env.example).
//
// Credentials live in .env.local (git-ignored):
//   VITE_TG_BOT_TOKEN=123456:ABC...
//   VITE_TG_CHAT_ID=-1001234567890
//
// All calls are safe no-ops when the vars are missing, so the app keeps
// working until the credentials are filled in.

import { useTelegram } from '@/composables/useTelegram'

const BOT_TOKEN = import.meta.env.VITE_TG_BOT_TOKEN || ''
const CHAT_ID = import.meta.env.VITE_TG_CHAT_ID || ''
const enabled = !!(BOT_TOKEN && CHAT_ID)

// One id per page load, so all events from a single visit can be grouped.
const sessionId = Math.random().toString(36).slice(2, 8).toUpperCase()
let isFirstEvent = true

function esc(value) {
  return String(value ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Best-effort guess of the device type from the user agent / touch support.
function deviceType() {
  const ua = navigator.userAgent || ''
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'Mobile'
  if (/iPad|Tablet/i.test(ua)) return 'Tablet'
  return 'Desktop'
}

// Snapshot of everything we know about the visitor's device/environment.
function collectDeviceInfo() {
  const { tg, isTelegram } = useTelegram()
  const nav = typeof navigator !== 'undefined' ? navigator : {}
  const scr = typeof screen !== 'undefined' ? screen : {}

  const info = {
    device: deviceType(),
    platform: nav.platform || '—',
    language: nav.language || '—',
    screen: scr.width && scr.height ? `${scr.width}×${scr.height}` : '—',
    viewport:
      typeof window !== 'undefined' ? `${window.innerWidth}×${window.innerHeight}` : '—',
    userAgent: nav.userAgent || '—',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '—',
    referrer: (typeof document !== 'undefined' && document.referrer) || '—',
    source: isTelegram ? 'Telegram WebApp' : 'Browser',
  }

  // Extra details when opened inside the Telegram client.
  if (isTelegram && tg) {
    const user = tg.initDataUnsafe?.user
    info.tgPlatform = tg.platform
    info.tgVersion = tg.version
    if (user) {
      info.tgUser = [user.first_name, user.last_name].filter(Boolean).join(' ')
      info.tgUsername = user.username ? `@${user.username}` : '—'
      info.tgUserId = user.id
      info.tgUserLang = user.language_code
    }
  }

  return info
}

// Fire-and-forget POST to the Telegram Bot API. keepalive lets it survive a
// page unload (e.g. the very first navigation).
function send(text) {
  if (!enabled) return
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  }).catch(() => {
    // Network/API failures must never break the app.
  })
}

function fmtTime() {
  return new Date().toLocaleString('ru-RU')
}

// Public: log a page view. The first event of a session carries the full
// device fingerprint; later events are short navigation lines.
export function trackPageView(to) {
  if (!enabled) return

  const path = to?.fullPath || (typeof location !== 'undefined' ? location.hash : '—')
  const name = to?.name || '—'

  if (isFirstEvent) {
    isFirstEvent = false
    const d = collectDeviceInfo()
    const lines = [
      `🟢 <b>Новый визит</b> · <code>${sessionId}</code>`,
      `🕒 ${esc(fmtTime())}`,
      '',
      `📄 <b>Страница:</b> ${esc(name)} (<code>${esc(path)}</code>)`,
      `🌐 <b>Источник:</b> ${esc(d.source)}`,
      `💻 <b>Устройство:</b> ${esc(d.device)} · ${esc(d.platform)}`,
      `🖥 <b>Экран:</b> ${esc(d.screen)} · окно ${esc(d.viewport)}`,
      `🗣 <b>Язык:</b> ${esc(d.language)} · 🕓 ${esc(d.timezone)}`,
      `🔗 <b>Referrer:</b> ${esc(d.referrer)}`,
    ]
    if (d.tgUserId) {
      lines.push('', '<b>Telegram:</b>')
      lines.push(`👤 ${esc(d.tgUser)} ${esc(d.tgUsername)} · <code>${esc(d.tgUserId)}</code>`)
      lines.push(`📱 ${esc(d.tgPlatform)} v${esc(d.tgVersion)} · ${esc(d.tgUserLang)}`)
    }
    lines.push('', `<i>UA:</i> ${esc(d.userAgent)}`)
    send(lines.join('\n'))
  } else {
    send(
      `➡️ <code>${sessionId}</code> · <b>${esc(name)}</b> (<code>${esc(path)}</code>) · ${esc(fmtTime())}`,
    )
  }
}
