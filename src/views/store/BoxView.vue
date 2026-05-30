<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useDataStore, localized } from '@/stores/data'
import { useCartStore } from '@/stores/cart'
import { useFormat } from '@/composables/useFormat'
import BaseButton from '@/components/ui/BaseButton.vue'
import QtyStepper from '@/components/ui/QtyStepper.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ProductThumb from '@/components/store/ProductThumb.vue'

const { t, locale } = useI18n()
const data = useDataStore()
const cart = useCartStore()
const { money } = useFormat()

const lines = computed(() =>
  cart.items
    .map((i) => {
      const product = data.productById(i.productId)
      return product ? { product, quantity: i.quantity, sum: product.price * i.quantity } : null
    })
    .filter(Boolean),
)
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <h1 class="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">🎁 {{ t('box.title') }}</h1>
    <p class="mt-1 text-sm text-stone-500 dark:text-stone-400">{{ t('box.subtitle') }}</p>

    <div v-if="cart.isEmpty" class="mt-8">
      <EmptyState icon="📦" :title="t('box.empty')" :text="t('box.emptyHint')">
        <RouterLink to="/catalog"><BaseButton variant="primary">{{ t('box.goCatalog') }}</BaseButton></RouterLink>
      </EmptyState>
    </div>

    <div v-else class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
      <!-- The box visual + items -->
      <div class="sm-card overflow-hidden">
        <div class="flex items-center justify-between border-b border-dashed border-stone-200 bg-gradient-to-r from-brand-50 to-gold-50 px-5 py-3 dark:border-stone-700 dark:from-stone-800 dark:to-stone-800">
          <span class="text-sm font-semibold text-stone-700 dark:text-stone-200">{{ t('box.items') }}: {{ cart.count }}</span>
          <button class="text-xs font-medium text-stone-500 hover:text-red-600 dark:text-stone-400" @click="cart.clear()">
            {{ t('box.clear') }}
          </button>
        </div>

        <ul class="divide-y divide-stone-100 dark:divide-stone-800">
          <li v-for="line in lines" :key="line.product.id" class="flex items-center gap-3 p-4">
            <ProductThumb :product="line.product" rounded="rounded-xl" class="h-14 w-14 shrink-0" />
            <div class="min-w-0 flex-1">
              <RouterLink :to="`/product/${line.product.id}`" class="line-clamp-1 font-medium text-stone-800 hover:text-brand-600 dark:text-stone-100">
                {{ localized(line.product.name, locale) }}
              </RouterLink>
              <div class="text-sm text-stone-500 dark:text-stone-400">{{ money(line.product.price) }}</div>
            </div>
            <QtyStepper
              :model-value="line.quantity"
              @increment="cart.increment(line.product.id)"
              @decrement="cart.decrement(line.product.id)"
            />
            <div class="hidden w-24 text-right font-semibold text-stone-800 sm:block dark:text-stone-100">{{ money(line.sum) }}</div>
            <button class="grid h-8 w-8 place-items-center rounded-lg text-stone-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" @click="cart.remove(line.product.id)" :aria-label="t('box.remove')">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="m6 18 12-12M6 6l12 12" /></svg>
            </button>
          </li>
        </ul>
      </div>

      <!-- Summary -->
      <div class="lg:sticky lg:top-20 lg:self-start">
        <div class="sm-card p-5">
          <div class="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
            <span>{{ t('box.items') }}</span><span>{{ cart.count }}</span>
          </div>
          <div class="mt-3 flex items-center justify-between border-t border-stone-200 pt-3 dark:border-stone-800">
            <span class="font-medium text-stone-700 dark:text-stone-200">{{ t('common.total') }}</span>
            <span class="text-xl font-bold text-brand-600 dark:text-brand-400">{{ money(cart.total) }}</span>
          </div>
          <RouterLink to="/checkout" class="mt-5 block">
            <BaseButton variant="primary" size="lg" block>{{ t('box.checkout') }}</BaseButton>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
