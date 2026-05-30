import { createI18n } from 'vue-i18n'
import ru from './ru'
import uz from './uz'

const STORAGE_KEY = 'sm.locale'

function initialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ru' || saved === 'uz') return saved
  } catch {
    /* ignore */
  }
  return 'ru'
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale(),
  fallbackLocale: 'ru',
  messages: { ru, uz },
})

export default i18n
