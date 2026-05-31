// Thin wrapper around the Telegram WebApp SDK. All calls are safe no-ops when
// the app runs outside Telegram (plain browser), so views can use it freely.

const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp || null : null

// Real Telegram client vs. opened in a normal browser.
const isTelegram = !!(tg && tg.platform && tg.platform !== 'unknown')

let mainHandler = null
let backHandler = null

export function useTelegram() {
  function ready() {
    if (!tg) return
    tg.ready()
    tg.expand?.()
    tg.disableVerticalSwipes?.()
  }

  function hideMainButton() {
    if (!tg) return
    if (mainHandler) tg.MainButton.offClick(mainHandler)
    mainHandler = null
    tg.MainButton.hide()
  }

  function setBackButton(visible, onClick) {
    if (!tg) return
    if (backHandler) tg.BackButton.offClick(backHandler)
    backHandler = null
    if (visible) {
      backHandler = onClick
      tg.BackButton.onClick(onClick)
      tg.BackButton.show()
    } else {
      tg.BackButton.hide()
    }
  }

  function setHeaderColor(hex) {
    tg?.setHeaderColor?.(hex)
    tg?.setBackgroundColor?.(hex)
  }

  function haptic(type = 'light') {
    if (!tg?.HapticFeedback) return
    if (type === 'success' || type === 'error' || type === 'warning') {
      tg.HapticFeedback.notificationOccurred(type)
    } else {
      tg.HapticFeedback.impactOccurred(type)
    }
  }

  return { tg, isTelegram, ready, hideMainButton, setBackButton, setHeaderColor, haptic }
}
