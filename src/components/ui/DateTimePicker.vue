<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  modelValue: { type: String, default: '' }, // "YYYY-MM-DDTHH:MM"
  min: { type: String, default: '' }, // "YYYY-MM-DDTHH:MM"
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const { t, locale } = useI18n()
const intlLocale = computed(() => (locale.value === 'uz' ? 'uz-UZ' : 'ru-RU'))

const pad = (x) => String(x).padStart(2, '0')
const dayStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Parse modelValue into its parts (null when empty/invalid).
const parsed = computed(() => {
  if (!props.modelValue) return null
  const d = new Date(props.modelValue)
  if (Number.isNaN(d.getTime())) return null
  return d
})

const open = ref(false)
const cursor = ref(new Date()) // month being viewed
// Selected time (defaults to 12:00 until the user picks).
const hour = ref(12)
const minute = ref(0)

watch(
  () => props.modelValue,
  () => {
    const d = parsed.value
    if (d) {
      cursor.value = new Date(d.getFullYear(), d.getMonth(), 1)
      hour.value = d.getHours()
      minute.value = d.getMinutes()
    }
  },
  { immediate: true },
)

const minDay = computed(() => (props.min ? props.min.slice(0, 10) : ''))
const today = dayStr(new Date())
const selectedDay = computed(() => (parsed.value ? dayStr(parsed.value) : ''))

const display = computed(() => {
  const d = parsed.value
  if (!d) return ''
  return d.toLocaleString(intlLocale.value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString(intlLocale.value, { month: 'long', year: 'numeric' }),
)
const weekdays = computed(() => {
  const out = []
  const ref0 = new Date(2024, 0, 1) // Monday
  for (let i = 0; i < 7; i++) {
    const d = new Date(ref0)
    d.setDate(ref0.getDate() + i)
    out.push(d.toLocaleDateString(intlLocale.value, { weekday: 'short' }))
  }
  return out
})
const cells = computed(() => {
  const year = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const lead = (new Date(year, month, 1).getDay() + 6) % 7
  const days = new Date(year, month + 1, 0).getDate()
  const out = []
  for (let i = 0; i < lead; i++) out.push(null)
  for (let d = 1; d <= days; d++) {
    const key = dayStr(new Date(year, month, d))
    out.push({ day: d, key, isToday: key === today, disabled: !!minDay.value && key < minDay.value })
  }
  return out
})

const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

function emitValue(dayKey) {
  emit('update:modelValue', `${dayKey}T${pad(hour.value)}:${pad(minute.value)}`)
}
function pickDay(c) {
  if (!c || c.disabled) return
  emitValue(c.key)
}
function onTimeChange() {
  if (selectedDay.value) emitValue(selectedDay.value)
}
function prevMonth() {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() - 1, 1)
}
function nextMonth() {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 1)
}
function clear() {
  emit('update:modelValue', '')
  open.value = false
}
</script>

<template>
  <div class="relative">
    <!-- Trigger -->
    <button
      type="button"
      class="sm-field flex w-full items-center gap-2 text-left"
      :class="open ? '!border-brand-500' : ''"
      @click="open = !open"
    >
      <svg class="h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" /></svg>
      <span class="flex-1 truncate" :class="display ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'">{{ display || placeholder }}</span>
    </button>

    <!-- Popover: centered dialog on mobile, anchored dropdown on sm+ -->
    <div v-if="open" class="fixed inset-0 z-[60] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:z-50 sm:mt-2">
      <div class="fixed inset-0 bg-stone-900/40 sm:bg-transparent" @click="open = false" />
      <div class="absolute left-1/2 top-1/2 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl sm:static sm:translate-x-0 sm:translate-y-0 dark:border-stone-700 dark:bg-stone-800">
        <!-- Month nav -->
        <div class="mb-2 flex items-center justify-between">
          <button type="button" class="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700" @click="prevMonth">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span class="text-sm font-semibold capitalize text-stone-800 dark:text-stone-100">{{ monthLabel }}</span>
          <button type="button" class="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700" @click="nextMonth">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <!-- Weekdays -->
        <div class="grid grid-cols-7 text-center text-[10px] font-medium uppercase text-stone-400">
          <span v-for="w in weekdays" :key="w" class="py-1">{{ w }}</span>
        </div>

        <!-- Days -->
        <div class="grid grid-cols-7 gap-0.5">
          <template v-for="(c, idx) in cells" :key="idx">
            <span v-if="!c" />
            <button
              v-else
              type="button"
              class="grid aspect-square place-items-center rounded-lg text-sm transition"
              :class="[
                c.key === selectedDay ? 'bg-brand-600 font-semibold text-white' : 'text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-700',
                c.disabled ? 'cursor-not-allowed !text-stone-300 hover:!bg-transparent dark:!text-stone-600' : '',
                c.isToday && c.key !== selectedDay ? 'ring-1 ring-inset ring-brand-400' : '',
              ]"
              :disabled="c.disabled"
              @click="pickDay(c)"
            >{{ c.day }}</button>
          </template>
        </div>

        <!-- Time -->
        <div class="mt-3 flex items-center gap-2 border-t border-stone-200 pt-3 dark:border-stone-700">
          <svg class="h-4 w-4 shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
          <select v-model.number="hour" class="sm-field flex-1 py-1.5 text-center text-sm" @change="onTimeChange">
            <option v-for="h in hours" :key="h" :value="h">{{ String(h).padStart(2, '0') }}</option>
          </select>
          <span class="font-semibold text-stone-400">:</span>
          <select v-model.number="minute" class="sm-field flex-1 py-1.5 text-center text-sm" @change="onTimeChange">
            <option v-for="m in minutes" :key="m" :value="m">{{ String(m).padStart(2, '0') }}</option>
          </select>
        </div>

        <!-- Footer -->
        <div class="mt-3 flex items-center justify-between gap-2">
          <button type="button" class="text-xs font-medium text-stone-400 transition hover:text-red-500" @click="clear">{{ t('datepicker.clear') }}</button>
          <button type="button" class="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700" @click="open = false">{{ t('datepicker.done') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
