<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useFormat } from '@/composables/useFormat'
import { useSectionBase } from '@/composables/useSection'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const { t, locale } = useI18n()
const data = useDataStore()
const { money } = useFormat()
const base = useSectionBase()

const intlLocale = computed(() => (locale.value === 'uz' ? 'uz-UZ' : 'ru-RU'))

// Local YYYY-MM-DD (avoids UTC shift from toISOString).
function dayStr(d) {
  const pad = (x) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const today = dayStr(new Date())

const cursor = ref(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
const selectedDay = ref(today)

const monthLabel = computed(() =>
  cursor.value.toLocaleDateString(intlLocale.value, { month: 'long', year: 'numeric' }),
)
// Monday-first weekday short names.
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

// Calendar grid cells (with leading/trailing blanks for alignment).
const cells = computed(() => {
  const year = cursor.value.getFullYear()
  const month = cursor.value.getMonth()
  const first = new Date(year, month, 1)
  const lead = (first.getDay() + 6) % 7 // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const out = []
  for (let i = 0; i < lead; i++) out.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    const key = dayStr(date)
    out.push({
      day: d,
      key,
      isToday: key === today,
      issues: data.ordersIssuedOn(key).length,
      returns: data.ordersReturnDueOn(key).length,
      active: data.ordersActiveOn(key).length,
    })
  }
  while (out.length % 7 !== 0) out.push(null)
  return out
})

const selectedIssues = computed(() => data.ordersIssuedOn(selectedDay.value))
const selectedReturns = computed(() => data.ordersReturnDueOn(selectedDay.value))

function prevMonth() {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() - 1, 1)
}
function nextMonth() {
  cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + 1, 1)
}
function goToday() {
  cursor.value = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  selectedDay.value = today
}
function clientName(id) {
  return data.clientById(id)?.name || '—'
}
</script>

<template>
  <div>
    <PageHeader :title="t('calendar.title')" :subtitle="t('calendar.subtitle')">
      <template #actions>
        <button class="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800" @click="goToday">{{ t('calendar.today') }}</button>
      </template>
    </PageHeader>

    <div class="grid gap-6 lg:grid-cols-[1fr_340px]">
      <!-- Month grid -->
      <div class="sm-card p-4 sm:p-5">
        <div class="mb-4 flex items-center justify-between">
          <button class="grid h-9 w-9 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" :aria-label="t('calendar.prev')" @click="prevMonth">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 class="text-base font-semibold capitalize text-stone-800 dark:text-stone-100">{{ monthLabel }}</h2>
          <button class="grid h-9 w-9 place-items-center rounded-lg text-stone-500 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" :aria-label="t('calendar.next')" @click="nextMonth">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div class="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase text-stone-400">
          <span v-for="w in weekdays" :key="w" class="py-1">{{ w }}</span>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <template v-for="(c, idx) in cells" :key="idx">
            <div v-if="!c" />
            <button
              v-else
              class="flex aspect-square flex-col rounded-lg border p-1.5 text-left transition"
              :class="[
                selectedDay === c.key
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                  : 'border-stone-200 hover:border-brand-300 dark:border-stone-700/70 dark:hover:border-brand-500/40',
                c.active ? 'ring-0' : '',
              ]"
              @click="selectedDay = c.key"
            >
              <span
                class="text-xs font-semibold"
                :class="c.isToday ? 'grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-white' : 'text-stone-600 dark:text-stone-300'"
              >{{ c.day }}</span>
              <span class="mt-auto flex flex-wrap gap-1">
                <span v-if="c.issues" class="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" :title="t('calendar.issues')">↑{{ c.issues }}</span>
                <span v-if="c.returns" class="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" :title="t('calendar.returns')">↓{{ c.returns }}</span>
              </span>
            </button>
          </template>
        </div>

        <!-- Legend -->
        <div class="mt-4 flex flex-wrap gap-4 text-xs text-stone-500 dark:text-stone-400">
          <span class="inline-flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded bg-amber-100 dark:bg-amber-500/20" /> ↑ {{ t('calendar.issues') }}</span>
          <span class="inline-flex items-center gap-1.5"><span class="inline-block h-3 w-3 rounded bg-emerald-100 dark:bg-emerald-500/20" /> ↓ {{ t('calendar.returns') }}</span>
        </div>
      </div>

      <!-- Selected day panel -->
      <div class="sm-card p-5">
        <h2 class="mb-3 font-semibold text-stone-800 dark:text-stone-100">{{ selectedDay }}</h2>

        <div class="space-y-4">
          <div>
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">↑ {{ t('calendar.issues') }} ({{ selectedIssues.length }})</p>
            <ul v-if="selectedIssues.length" class="space-y-2">
              <RouterLink
                v-for="o in selectedIssues"
                :key="o.id"
                :to="`${base}/orders/${o.id}`"
                class="flex items-center justify-between gap-2 rounded-xl bg-stone-50 px-3 py-2 text-sm transition hover:bg-stone-100 dark:bg-stone-800/60 dark:hover:bg-stone-800"
              >
                <span class="min-w-0">
                  <span class="font-medium text-stone-700 dark:text-stone-200">#{{ o.id }}</span>
                  <span class="ml-1.5 truncate text-stone-500 dark:text-stone-400">{{ clientName(o.clientId) }}</span>
                </span>
                <StatusBadge :status="o.status" />
              </RouterLink>
            </ul>
            <p v-else class="text-sm text-stone-400">{{ t('calendar.none') }}</p>
          </div>

          <div class="border-t border-stone-200 pt-4 dark:border-stone-800">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">↓ {{ t('calendar.returns') }} ({{ selectedReturns.length }})</p>
            <ul v-if="selectedReturns.length" class="space-y-2">
              <RouterLink
                v-for="o in selectedReturns"
                :key="o.id"
                :to="`${base}/orders/${o.id}`"
                class="flex items-center justify-between gap-2 rounded-xl bg-stone-50 px-3 py-2 text-sm transition hover:bg-stone-100 dark:bg-stone-800/60 dark:hover:bg-stone-800"
              >
                <span class="min-w-0">
                  <span class="font-medium text-stone-700 dark:text-stone-200">#{{ o.id }}</span>
                  <span class="ml-1.5 truncate text-stone-500 dark:text-stone-400">{{ clientName(o.clientId) }}</span>
                </span>
                <span class="shrink-0 text-xs font-medium text-stone-400">{{ money(data.orderTotal(o)) }}</span>
              </RouterLink>
            </ul>
            <p v-else class="text-sm text-stone-400">{{ t('calendar.none') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
