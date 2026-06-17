<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useFormat } from '@/composables/useFormat'
import { useSectionBase } from '@/composables/useSection'
import { ORDER_STATUSES } from '@/stores/seed'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const { t } = useI18n()
const data = useDataStore()
const { money, date } = useFormat()
const base = useSectionBase()

const statusFilter = ref('all')

const filtered = computed(() => {
  const list = statusFilter.value === 'all' ? data.orders : data.orders.filter((o) => o.status === statusFilter.value)
  return [...list].sort((a, b) => b.id - a.id)
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-6">
    <PageHeader :title="t('orders.title')" :subtitle="t('orders.subtitle')" />

    <!-- status filter -->
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        class="rounded-full px-3.5 py-1.5 text-sm font-medium transition"
        :class="statusFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'"
        @click="statusFilter = 'all'"
      >
        {{ t('common.all') }}
      </button>
      <button
        v-for="s in ORDER_STATUSES"
        :key="s"
        class="rounded-full px-3.5 py-1.5 text-sm font-medium transition"
        :class="statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'"
        @click="statusFilter = s"
      >
        {{ t(`status.${s}`) }}
      </button>
    </div>

    <div v-if="filtered.length" class="sm-card overflow-hidden">
      <div class="hidden grid-cols-[80px_1fr_140px_90px_120px_120px] gap-4 border-b border-stone-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-400 lg:grid dark:border-stone-800">
        <span>{{ t('orders.id') }}</span>
        <span>{{ t('orders.client') }}</span>
        <span>{{ t('orders.targetDate') }}</span>
        <span>{{ t('orders.items') }}</span>
        <span>{{ t('common.status') }}</span>
        <span class="text-right">{{ t('orders.total') }}</span>
      </div>
      <ul class="divide-y divide-stone-100 dark:divide-stone-800">
        <li v-for="o in filtered" :key="o.id">
          <RouterLink :to="`${base}/orders/${o.id}`" class="grid grid-cols-2 items-center gap-2 px-5 py-3.5 transition hover:bg-stone-50 lg:grid-cols-[80px_1fr_140px_90px_120px_120px] lg:gap-4 dark:hover:bg-stone-800/50">
            <span class="font-semibold text-stone-800 dark:text-stone-100">#{{ o.id }}</span>
            <span class="truncate text-sm text-stone-600 dark:text-stone-300">{{ data.clientById(o.clientId)?.name || '—' }}</span>
            <span class="hidden text-sm text-stone-500 lg:block dark:text-stone-400">{{ date(o.targetDate) }}</span>
            <span class="hidden text-sm text-stone-500 lg:block dark:text-stone-400">{{ data.orderItemCount(o) }}</span>
            <span class="justify-self-start lg:justify-self-auto"><StatusBadge :status="o.status" /></span>
            <span class="text-right text-sm font-semibold text-stone-800 dark:text-stone-100">{{ money(data.orderTotal(o)) }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
    <EmptyState v-else icon="🧾" :title="t('orders.empty')" />
  </div>
</template>
