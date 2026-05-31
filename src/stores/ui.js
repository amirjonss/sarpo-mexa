import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import i18n from '@/i18n'

const THEME_KEY = 'sm.theme'
const LOCALE_KEY = 'sm.locale'

function initialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'light') return saved
  } catch {
    /* ignore */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useUiStore = defineStore('ui', () => {
  const theme = ref(initialTheme())
  const locale = ref(i18n.global.locale.value)

  function applyTheme() {
    const isDark = theme.value === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
  }
  applyTheme()

  watch(theme, (v) => {
    applyTheme()
    try {
      localStorage.setItem(THEME_KEY, v)
    } catch {
      /* ignore */
    }
  })

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }
  function setTheme(v) {
    if (v === 'dark' || v === 'light') theme.value = v
  }

  watch(locale, (v) => {
    i18n.global.locale.value = v
    document.documentElement.lang = v
    try {
      localStorage.setItem(LOCALE_KEY, v)
    } catch {
      /* ignore */
    }
  })
  document.documentElement.lang = locale.value

  function setLocale(v) {
    locale.value = v
  }
  function toggleLocale() {
    locale.value = locale.value === 'ru' ? 'uz' : 'ru'
  }

  return { theme, locale, toggleTheme, setTheme, setLocale, toggleLocale }
})
