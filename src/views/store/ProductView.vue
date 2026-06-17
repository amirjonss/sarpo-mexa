<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useDataStore, localized } from '@/stores/data'
import { useCartStore } from '@/stores/cart'
import { useFormat } from '@/composables/useFormat'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'
import QtyStepper from '@/components/ui/QtyStepper.vue'
import ProductCard from '@/components/store/ProductCard.vue'
import ProductThumb from '@/components/store/ProductThumb.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const data = useDataStore()
const cart = useCartStore()
const { money } = useFormat()
const toast = useToast()

const product = computed(() => data.productById(Number(route.params.id)))
const name = computed(() => (product.value ? localized(product.value.name, locale.value) : ''))
const stock = computed(() => (product.value ? data.stockOf(product.value.id) : 0))
const inBox = computed(() => (product.value ? cart.qtyOf(product.value.id) : 0))
const related = computed(() =>
  product.value
    ? data.products.filter((p) => p.categoryId === product.value.categoryId && p.id !== product.value.id).slice(0, 4)
    : [],
)

function addToBox() {
  cart.add(product.value.id)
  toast.success(`${name.value} → ${t('nav.box')}`)
}
</script>

<template>
  <div v-if="product" class="mx-auto max-w-6xl px-4 py-8">
    <button class="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200" @click="router.back()">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 19l-7-7 7-7" /></svg>
      {{ t('common.back') }}
    </button>

    <div class="grid gap-8 md:grid-cols-2">
      <ProductThumb :product="product" rounded="rounded-3xl" class="sm-card aspect-square !p-0" />

      <div class="flex flex-col">
        <RouterLink :to="{ path: '/catalog', query: { category: product.categoryId } }" class="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          {{ data.categoryName(product.categoryId, locale) }}
        </RouterLink>
        <h1 class="mt-1 text-3xl font-bold tracking-tight text-stone-800 dark:text-stone-100">{{ name }}</h1>
        <div class="mt-3 text-2xl font-bold text-brand-600 dark:text-brand-400">{{ money(product.price) }}</div>

        <p class="mt-5 text-sm leading-relaxed text-stone-600 dark:text-stone-300">{{ t('product.description') }}</p>

        <div class="mt-5">
          <span v-if="stock > 0" class="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            ● {{ t('product.inStock') }} — {{ t('product.left', { n: stock }) }}
          </span>
          <span v-else class="inline-flex items-center gap-1.5 text-sm font-medium text-stone-400">
            ● {{ t('product.outOfStock') }}
          </span>
        </div>

        <div class="mt-7 flex items-center gap-3">
          <template v-if="inBox">
            <QtyStepper :model-value="inBox" @increment="cart.increment(product.id)" @decrement="cart.decrement(product.id)" />
            <RouterLink to="/"><BaseButton variant="gold" size="lg">{{ t('catalog.inBox') }} →</BaseButton></RouterLink>
          </template>
          <BaseButton v-else variant="primary" size="lg" :disabled="stock === 0" @click="addToBox">
            {{ t('product.addToBox') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <section v-if="related.length" class="mt-14">
      <h2 class="mb-5 text-xl font-bold text-stone-800 dark:text-stone-100">{{ t('home.popular') }}</h2>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <ProductCard v-for="p in related" :key="p.id" :product="p" />
      </div>
    </section>
  </div>

  <div v-else class="mx-auto max-w-6xl px-4 py-20 text-center">
    <p class="text-stone-500">404 — {{ t('catalog.empty') }}</p>
    <RouterLink to="/catalog" class="mt-4 inline-block text-brand-600 hover:underline">{{ t('nav.catalog') }}</RouterLink>
  </div>
</template>
