<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, RouterLink } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useFormat } from '@/composables/useFormat'
import { useSectionBase } from '@/composables/useSection'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const { t } = useI18n()
const route = useRoute()
const data = useDataStore()
const { money, dateTime } = useFormat()
const base = useSectionBase()

const client = computed(() => data.clientById(Number(route.params.id)))
const orders = computed(() => (client.value ? data.ordersByClient(client.value.id) : []))
const totalSpent = computed(() => orders.value.reduce((s, o) => s + data.orderTotal(o), 0))

function initials(name) {
  return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}
</script>

<template>
  <div v-if="client" class="mx-auto max-w-4xl px-4 py-6">
    <RouterLink :to="`${base}/clients`" class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 19l-7-7 7-7" /></svg>
      {{ t('clients.title') }}
    </RouterLink>

    <!-- Client card -->
    <div class="sm-card flex flex-wrap items-center gap-4 p-5">
      <div class="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand-100 text-xl font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{{ initials(client.name) }}</div>
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">{{ client.name }}</h1>
        <div class="text-stone-500 dark:text-stone-400">{{ client.phone }}</div>
      </div>
      <div class="ml-auto flex gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-stone-800 dark:text-stone-100">{{ orders.length }}</div>
          <div class="text-xs text-stone-400">{{ t('clients.ordersCount') }}</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-brand-600 dark:text-brand-400">{{ money(totalSpent) }}</div>
          <div class="text-xs text-stone-400">{{ t('clients.totalSpent') }}</div>
        </div>
      </div>
    </div>

    <!-- Order history -->
    <h2 class="mb-3 mt-8 text-lg font-semibold text-stone-800 dark:text-stone-100">{{ t('clients.orderHistory') }}</h2>
    <div v-if="orders.length" class="sm-card overflow-hidden">
      <ul class="divide-y divide-stone-100 dark:divide-stone-800">
        <li v-for="o in orders" :key="o.id">
          <RouterLink :to="`${base}/orders/${o.id}`" class="flex items-center gap-3 px-5 py-3.5 transition hover:bg-stone-50 dark:hover:bg-stone-800/50">
            <span class="font-semibold text-stone-800 dark:text-stone-100">#{{ o.id }}</span>
            <span class="hidden text-sm text-stone-500 sm:block dark:text-stone-400">{{ dateTime(o.targetDate) }}</span>
            <StatusBadge :status="o.status" class="ml-auto" />
            <span class="w-28 text-right text-sm font-semibold text-stone-800 dark:text-stone-100">{{ money(data.orderTotal(o)) }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
    <EmptyState v-else icon="🧾" :title="t('clients.noOrders')" />
  </div>

  <div v-else class="mx-auto max-w-4xl px-4 py-20 text-center text-stone-500">
    404 — {{ t('clients.empty') }}
    <div class="mt-4"><RouterLink :to="`${base}/clients`" class="text-brand-600 hover:underline">{{ t('clients.title') }}</RouterLink></div>
  </div>
</template>
