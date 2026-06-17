<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore, localized } from '@/stores/data'
import { useCartStore } from '@/stores/cart'
import { useFormat } from '@/composables/useFormat'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import BaseModal from '@/components/ui/BaseModal.vue'
import ProductThumb from '@/components/store/ProductThumb.vue'
import OrderPanel from '@/components/store/OrderPanel.vue'

const { t, locale } = useI18n()
const data = useDataStore()
const cart = useCartStore()
const { money } = useFormat()
const toast = useToast()
const { confirm } = useConfirm()

const search = ref('')
const activeCategory = ref(null) // null = all
const mobilePanel = ref(false)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return data.products.filter((p) => {
    if (activeCategory.value && p.categoryId !== activeCategory.value) return false
    if (q) {
      const name = localized(p.name, locale.value).toLowerCase()
      if (!name.includes(q)) return false
    }
    return true
  })
})

function onCreated() {
  mobilePanel.value = false
}

function addSet(set) {
  cart.addSet(set.id)
  toast.success(t('builder.setAdded', { name: localized(set.name, locale.value) }))
}

async function resetDemo() {
  if (await confirm(t('builder.resetConfirm'))) {
    cart.clear()
    data.resetDemo()
    toast.success(t('common.saved'))
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 pb-28 pt-6 lg:pb-8">
    <header class="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">{{ t('builder.title') }}</h1>
        <p class="text-sm text-stone-500 dark:text-stone-400">{{ t('builder.subtitle') }}</p>
      </div>
      <button
        class="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-400 transition hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
        @click="resetDemo"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.6M20 20v-5h-.6M5 14a7 7 0 0 0 13 2M19 10A7 7 0 0 0 6 8" /></svg>
        {{ t('builder.reset') }}
      </button>
    </header>

    <div class="grid gap-6 lg:grid-cols-[1fr_360px]">
      <!-- Catalog / picker -->
      <div class="min-w-0">
        <!-- Ready-made sets (комплекты) -->
        <section v-if="data.sets.length" class="mb-5">
          <h2 class="mb-2.5 text-sm font-semibold text-stone-700 dark:text-stone-200">{{ t('builder.sets') }}</h2>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="s in data.sets"
              :key="s.id"
              class="sm-card flex items-center gap-3 p-3"
            >
              <img
                v-if="s.image"
                :src="s.image"
                alt=""
                class="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold text-stone-800 dark:text-stone-100">{{ localized(s.name, locale) }}</p>
                <p class="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                  {{ data.setItemCount(s) }} {{ t('builder.setItems') }} · {{ money(data.setTotal(s)) }}
                </p>
                <p
                  class="mt-0.5 text-[11px] font-medium"
                  :class="data.setAvailable(s) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-400'"
                >
                  <template v-if="data.setAvailable(s) > 0">{{ data.setAvailable(s) }} {{ t('builder.setAvailable') }}</template>
                  <template v-else>{{ t('builder.setOutOfStock') }}</template>
                </p>
              </div>
              <button
                class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40"
                :disabled="data.setAvailable(s) === 0"
                :aria-label="t('builder.addSet')"
                :title="t('builder.addSet')"
                @click="addSet(s)"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" /></svg>
              </button>
            </div>
          </div>
        </section>

        <!-- Toolbar -->
        <div class="mb-4 space-y-3">
          <div class="relative">
            <svg class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
            </svg>
            <input v-model="search" class="sm-field !pl-10" :placeholder="t('builder.searchPlaceholder')" />
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              class="rounded-full border px-3.5 py-1.5 text-sm font-medium transition"
              :class="activeCategory === null
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-stone-200 bg-white text-stone-600 hover:border-brand-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300'"
              @click="activeCategory = null"
            >
              {{ t('builder.allCategories') }}
            </button>
            <button
              v-for="c in data.categories"
              :key="c.id"
              class="rounded-full border px-3.5 py-1.5 text-sm font-medium transition"
              :class="activeCategory === c.id
                ? 'border-brand-600 bg-brand-600 text-white'
                : 'border-stone-200 bg-white text-stone-600 hover:border-brand-300 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300'"
              @click="activeCategory = c.id"
            >
              {{ localized(c.name, locale) }}
            </button>
          </div>
        </div>

        <!-- Product grid -->
        <div v-if="filtered.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          <div
            v-for="p in filtered"
            :key="p.id"
            class="sm-card group flex flex-col overflow-hidden"
          >
            <div class="relative">
              <ProductThumb :product="p" rounded="rounded-none" class="aspect-square" />
              <span
                v-if="cart.qtyOf(p.id)"
                class="absolute right-2 top-2 grid h-6 min-w-6 place-items-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white shadow"
              >
                {{ cart.qtyOf(p.id) }}
              </span>
              <span
                v-if="data.stockOf(p.id) === 0"
                class="absolute left-2 top-2 rounded-full bg-stone-900/70 px-2 py-0.5 text-[11px] font-medium text-white"
              >
                {{ t('product.outOfStock') }}
              </span>
            </div>

            <div class="flex flex-1 flex-col p-3">
              <p class="line-clamp-2 text-sm font-medium leading-snug text-stone-800 dark:text-stone-100">{{ localized(p.name, locale) }}</p>
              <p class="mt-1 text-sm font-bold text-stone-700 dark:text-stone-200">{{ money(p.price) }}</p>

              <div class="mt-auto pt-3">
                <div v-if="cart.qtyOf(p.id)" class="flex items-center justify-between rounded-xl border border-stone-200 dark:border-stone-700">
                  <button class="grid h-9 w-10 place-items-center rounded-l-xl text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" @click="cart.decrement(p.id)">−</button>
                  <span class="text-sm font-semibold tabular-nums">{{ cart.qtyOf(p.id) }}</span>
                  <button class="grid h-9 w-10 place-items-center rounded-r-xl text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800" @click="cart.increment(p.id)">+</button>
                </div>
                <button
                  v-else
                  class="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700 disabled:opacity-40"
                  :disabled="data.stockOf(p.id) === 0"
                  @click="cart.add(p.id)"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" /></svg>
                  {{ t('builder.add') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="py-16 text-center text-stone-400">{{ t('builder.emptyProducts') }}</div>
      </div>

      <!-- Order panel (desktop sidebar) -->
      <aside class="hidden lg:block">
        <div class="sm-card sticky top-20 p-5">
          <OrderPanel />
        </div>
      </aside>
    </div>

    <!-- Mobile bottom bar -->
    <div class="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 p-3 backdrop-blur lg:hidden dark:border-stone-800 dark:bg-stone-900/95">
      <button
        class="flex w-full items-center justify-between rounded-xl bg-brand-600 px-4 py-3 text-white shadow-sm disabled:opacity-50"
        :disabled="cart.isEmpty"
        @click="mobilePanel = true"
      >
        <span class="flex items-center gap-2 text-sm font-medium">
          {{ cart.count }} {{ t('builder.items') }}
        </span>
        <span class="flex items-center gap-2 font-semibold">
          {{ money(cart.total) }}
          <span class="text-sm opacity-90">· {{ t('builder.openBox') }} →</span>
        </span>
      </button>
    </div>

    <!-- Mobile order modal -->
    <BaseModal v-model="mobilePanel" :title="t('builder.boxTitle')">
      <OrderPanel @created="onCreated" />
    </BaseModal>
  </div>
</template>
