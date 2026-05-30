<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore, localized } from '@/stores/data'
import { useToast } from '@/composables/useToast'
import PageHeader from '@/components/ui/PageHeader.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ProductThumb from '@/components/store/ProductThumb.vue'

const { t, locale } = useI18n()
const data = useDataStore()
const toast = useToast()

const rows = computed(() =>
  data.products.map((p) => ({ product: p, quantity: data.stockOf(p.id) })).sort((a, b) => a.quantity - b.quantity),
)

function stockState(q) {
  if (q === 0) return { key: 'inventory.out', cls: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300' }
  if (q <= 5) return { key: 'inventory.low', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' }
  return { key: 'inventory.inStock', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' }
}
function adjust(productId, delta) {
  data.setStock(productId, data.stockOf(productId) + delta)
}
function setQty(productId, e) {
  data.setStock(productId, e.target.value)
  toast.success(t('common.saved'))
}
</script>

<template>
  <div>
    <PageHeader :title="t('inventory.title')" :subtitle="t('inventory.subtitle')" />

    <div v-if="rows.length" class="sm-card overflow-hidden">
      <!-- header (desktop) -->
      <div class="hidden grid-cols-[1fr_120px_140px] gap-4 border-b border-stone-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-400 sm:grid dark:border-stone-800">
        <span>{{ t('inventory.product') }}</span>
        <span>{{ t('inventory.status') }}</span>
        <span class="text-right">{{ t('inventory.quantity') }}</span>
      </div>
      <ul class="divide-y divide-stone-100 dark:divide-stone-800">
        <li v-for="row in rows" :key="row.product.id" class="grid grid-cols-1 items-center gap-3 px-5 py-3 sm:grid-cols-[1fr_120px_140px]">
          <div class="flex items-center gap-3">
            <ProductThumb :product="row.product" rounded="rounded-xl" class="h-10 w-10 shrink-0" />
            <span class="font-medium text-stone-800 dark:text-stone-100">{{ localized(row.product.name, locale) }}</span>
          </div>
          <div>
            <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="stockState(row.quantity).cls">
              {{ t(stockState(row.quantity).key) }}
            </span>
          </div>
          <div class="flex items-center justify-end gap-1">
            <button class="grid h-8 w-8 place-items-center rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300" @click="adjust(row.product.id, -1)">−</button>
            <input :value="row.quantity" type="number" min="0" class="sm-field h-9 w-16 px-2 py-1 text-center" @change="setQty(row.product.id, $event)" />
            <button class="grid h-8 w-8 place-items-center rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300" @click="adjust(row.product.id, 1)">+</button>
          </div>
        </li>
      </ul>
    </div>
    <EmptyState v-else icon="📦" :title="t('inventory.empty')" />
  </div>
</template>
