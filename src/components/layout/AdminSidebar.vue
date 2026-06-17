<script setup>
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import AppLogo from './AppLogo.vue'

defineProps({ mobile: { type: Boolean, default: false } })
const emit = defineEmits(['navigate'])
const { t } = useI18n()

const items = [
  { to: '/admin', key: 'nav.dashboard', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  { to: '/admin/orders', key: 'nav.orders', icon: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2' },
  { to: '/admin/calendar', key: 'nav.calendar', icon: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z' },
  { to: '/admin/products', key: 'nav.products', icon: 'm21 8-9 4-9-4 9-4 9 4Zm0 0v8l-9 4-9-4V8' },
  { to: '/admin/sets', key: 'nav.sets', icon: 'M3 7h18M3 7l1.5 12.5A2 2 0 0 0 6.5 21h11a2 2 0 0 0 2-1.5L21 7M3 7l3-4h12l3 4M9 11v6M15 11v6' },
  { to: '/admin/categories', key: 'nav.categories', icon: 'M4 6h16M4 12h16M4 18h10' },
  { to: '/admin/clients', key: 'nav.clients', icon: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-1a6 6 0 0 1 12 0v1' },
  { to: '/admin/inventory', key: 'nav.inventory', icon: 'M3 7l9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7' },
  { to: '/admin/users', key: 'nav.users', icon: 'M17 20h5v-1a4 4 0 0 0-4-4M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 0a6 6 0 0 0-6 6v1h12v-1a6 6 0 0 0-6-6Z' },
]
</script>

<template>
  <aside class="flex h-full w-64 flex-col border-r border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
    <div class="flex h-16 items-center px-5">
      <RouterLink to="/admin" @click="emit('navigate')"><AppLogo /></RouterLink>
    </div>
    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-2">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        @click="emit('navigate')"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
        :class="item.to === '/admin' ? 'exact' : ''"
        :active-class="item.to === '/admin' ? '' : 'bg-brand-50 !text-brand-700 dark:bg-brand-500/10 dark:!text-brand-300'"
        :exact-active-class="item.to === '/admin' ? 'bg-brand-50 !text-brand-700 dark:bg-brand-500/10 dark:!text-brand-300' : ''"
      >
        <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7">
          <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
        </svg>
        {{ t(item.key) }}
      </RouterLink>
    </nav>
    <div class="border-t border-stone-200 p-3 dark:border-stone-800">
      <RouterLink
        to="/"
        @click="emit('navigate')"
        class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-500 transition hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {{ t('nav.backToStore') }}
      </RouterLink>
    </div>
  </aside>
</template>
