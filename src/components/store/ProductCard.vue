<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useDataStore, localized } from '@/stores/data'
import { useCartStore } from '@/stores/cart'
import { useFormat } from '@/composables/useFormat'
import { useToast } from '@/composables/useToast'
import QtyStepper from '@/components/ui/QtyStepper.vue'
import ProductThumb from '@/components/store/ProductThumb.vue'

const props = defineProps({
  product: { type: Object, required: true },
})

const { t, locale } = useI18n()
const data = useDataStore()
const cart = useCartStore()
const { money } = useFormat()
const toast = useToast()

const name = computed(() => localized(props.product.name, locale.value))
const stock = computed(() => data.stockOf(props.product.id))
const inBox = computed(() => cart.qtyOf(props.product.id))

function addToBox() {
  cart.add(props.product.id)
  toast.success(`${name.value} → ${t('nav.box')}`)
}
</script>

<template>
  <div class="sm-card group flex flex-col overflow-hidden hover:shadow-md">
    <RouterLink :to="`/product/${product.id}`" class="relative block">
      <ProductThumb :product="product" rounded="rounded-none" class="aspect-[4/3]" />
      <span
        v-if="stock === 0"
        class="absolute left-2 top-2 rounded-full bg-stone-900/70 px-2 py-0.5 text-[11px] font-medium text-white"
      >
        {{ t('product.outOfStock') }}
      </span>
    </RouterLink>

    <div class="flex flex-1 flex-col p-4">
      <span class="text-xs font-medium text-brand-600 dark:text-brand-400">
        {{ data.categoryName(product.categoryId, locale) }}
      </span>
      <RouterLink :to="`/product/${product.id}`" class="mt-0.5 line-clamp-2 font-semibold text-stone-800 hover:text-brand-600 dark:text-stone-100 dark:hover:text-brand-400">
        {{ name }}
      </RouterLink>
      <div class="mt-3 flex items-center justify-between gap-2">
        <span class="font-bold text-stone-800 dark:text-stone-100">{{ money(product.price) }}</span>
        <QtyStepper
          v-if="inBox"
          :model-value="inBox"
          @increment="cart.increment(product.id)"
          @decrement="cart.decrement(product.id)"
        />
        <button
          v-else
          class="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-40"
          :disabled="stock === 0"
          @click="addToBox"
        >
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />
          </svg>
          {{ t('catalog.addToBox') }}
        </button>
      </div>
    </div>
  </div>
</template>
