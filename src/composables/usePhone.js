// Uzbek phone helpers. A number is normalized to its 9-digit local part
// (operator code + subscriber number) and displayed as +998 XX XXX XX XX.

export function phoneDigits(value) {
  let d = String(value ?? '').replace(/\D/g, '')
  if (d.startsWith('998')) d = d.slice(3)
  return d.slice(0, 9)
}

export function formatPhone(value) {
  const d = phoneDigits(value)
  if (!d) return ''
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean)
  return '+998 ' + parts.join(' ')
}

export function isValidPhone(value) {
  return phoneDigits(value).length === 9
}
