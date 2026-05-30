<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore, localized } from '@/stores/data'
import { useFormat } from '@/composables/useFormat'
import BaseModal from '@/components/ui/BaseModal.vue'
import ProductThumb from '@/components/store/ProductThumb.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  // Map of productId -> quantity already in the order (shows a badge).
  selected: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue', 'pick'])

const { t, locale } = useI18n()
const data = useDataStore()
const { money } = useFormat()

const search = ref('')
const activeCategory = ref(null)
const searchInput = ref(null)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return data.products.filter((p) => {
    if (activeCategory.value && p.categoryId !== activeCategory.value) return false
    if (q && !localized(p.name, locale.value).toLowerCase().includes(q)) return false
    return true
  })
})

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      search.value = ''
      activeCategory.value = null
      nextTick(() => searchInput.value?.focus())
    }
  },
)
</script>

<template>
  <BaseModal v-model="open" :title="t('orders.addItem')">
    <!-- search -->
    <div class="relative">
      <svg class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
      </svg>
      <input ref="searchInput" v-model="search" class="sm-field !pl-10" :placeholder="t('builder.searchPlaceholder')" />
    </div>

    <!-- categories -->
    <div class="mt-3 flex flex-wrap gap-1.5">
      <button
        type="button"
        class="rounded-full border px-3 py-1 text-xs font-medium transition"
        :class="activeCategory === null ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-200 text-stone-600 hover:border-brand-300 dark:border-stone-700 dark:text-stone-300'"
        @click="activeCategory = null"
      >
        {{ t('builder.allCategories') }}
      </button>
      <button
        v-for="c in data.categories"
        :key="c.id"
        type="button"
        class="rounded-full border px-3 py-1 text-xs font-medium transition"
        :class="activeCategory === c.id ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-200 text-stone-600 hover:border-brand-300 dark:border-stone-700 dark:text-stone-300'"
        @click="activeCategory = c.id"
      >
        {{ localized(c.name, locale) }}
      </button>
    </div>

    <!-- grid -->
    <div v-if="filtered.length" class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
      <button
        v-for="p in filtered"
        :key="p.id"
        type="button"
        class="group relative flex flex-col overflow-hidden rounded-xl border border-stone-200 text-left transition hover:border-brand-400 hover:shadow-sm dark:border-stone-700"
        @click="emit('pick', p.id)"
      >
        <ProductThumb :product="p" rounded="rounded-none" class="aspect-square" />
        <span v-if="selected[p.id]" class="absolute right-1.5 top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white shadow">{{ selected[p.id] }}</span>
        <span v-if="data.stockOf(p.id) === 0" class="absolute left-1.5 top-1.5 rounded-full bg-stone-900/70 px-1.5 py-0.5 text-[10px] font-medium text-white">{{ t('product.outOfStock') }}</span>
        <div class="flex flex-1 flex-col p-2">
          <p class="line-clamp-2 text-xs font-medium leading-snug text-stone-700 dark:text-stone-200">{{ localized(p.name, locale) }}</p>
          <p class="mt-auto pt-1 text-xs font-bold text-stone-600 dark:text-stone-300">{{ money(p.price) }}</p>
        </div>
      </button>
    </div>
    <div v-else class="py-10 text-center text-sm text-stone-400">{{ t('builder.emptyProducts') }}</div>
  </BaseModal>
</template>
