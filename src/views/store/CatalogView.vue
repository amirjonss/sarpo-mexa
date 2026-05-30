<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useDataStore, localized } from '@/stores/data'
import ProductCard from '@/components/store/ProductCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const { t, locale } = useI18n()
const data = useDataStore()
const route = useRoute()

const query = ref('')
const activeCategory = ref(null) // null = all

onMounted(() => {
  if (route.query.category) activeCategory.value = Number(route.query.category)
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return data.products.filter((p) => {
    const matchesCat = activeCategory.value == null || p.categoryId === activeCategory.value
    const matchesQuery = !q || localized(p.name, locale.value).toLowerCase().includes(q)
    return matchesCat && matchesQuery
  })
})
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-8">
    <h1 class="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">{{ t('catalog.title') }}</h1>
    <p class="mt-1 text-sm text-stone-500 dark:text-stone-400">{{ t('catalog.subtitle') }}</p>

    <!-- Search -->
    <div class="relative mt-5">
      <svg class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <path stroke-linecap="round" d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      </svg>
      <input v-model="query" :placeholder="t('catalog.searchPlaceholder')" class="sm-field pl-11" />
    </div>

    <!-- Category chips -->
    <div class="mt-4 flex flex-wrap gap-2">
      <button
        class="rounded-full px-4 py-1.5 text-sm font-medium transition"
        :class="activeCategory == null ? 'bg-brand-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'"
        @click="activeCategory = null"
      >
        {{ t('common.all') }}
      </button>
      <button
        v-for="c in data.categories"
        :key="c.id"
        class="rounded-full px-4 py-1.5 text-sm font-medium transition"
        :class="activeCategory === c.id ? 'bg-brand-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'"
        @click="activeCategory = c.id"
      >
        {{ localized(c.name, locale) }}
      </button>
    </div>

    <!-- Grid -->
    <div v-if="filtered.length" class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      <ProductCard v-for="p in filtered" :key="p.id" :product="p" />
    </div>
    <div v-else class="mt-6">
      <EmptyState icon="🔍" :title="t('catalog.empty')" />
    </div>
  </div>
</template>
