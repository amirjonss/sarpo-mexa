import { useI18n } from 'vue-i18n'

export function useFormat() {
  const { t, locale } = useI18n()

  function money(value) {
    const n = Number(value) || 0
    return `${n.toLocaleString('ru-RU')} ${t('common.currency')}`
  }

  function date(value) {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString(locale.value === 'uz' ? 'uz-UZ' : 'ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  function dateTime(value) {
    if (!value) return '—'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString(locale.value === 'uz' ? 'uz-UZ' : 'ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return { money, date, dateTime }
}
