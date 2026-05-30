<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import AppLogo from './AppLogo.vue'
import ThemeToggle from './ThemeToggle.vue'
import LangSwitcher from './LangSwitcher.vue'

const { t } = useI18n()
const cart = useCartStore()
const mobileOpen = ref(false)

const links = [
  { to: '/', key: 'nav.home', exact: true },
  { to: '/orders', key: 'nav.orders' },
  { to: '/clients', key: 'nav.clients' },
]
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-stone-200 bg-stone-50/85 backdrop-blur dark:border-stone-800 dark:bg-stone-950/85">
    <div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
      <RouterLink to="/" class="shrink-0"><AppLogo /></RouterLink>

      <nav class="ml-2 hidden items-center gap-1 md:flex">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
          :active-class="l.exact ? '' : '!text-brand-600 dark:!text-brand-400'"
          :exact-active-class="l.exact ? '!text-brand-600 dark:!text-brand-400' : ''"
        >
          {{ t(l.key) }}
        </RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <LangSwitcher />
        <ThemeToggle />

        <RouterLink
          to="/box"
          class="relative grid h-9 w-9 place-items-center rounded-xl text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
          :aria-label="t('nav.box')"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.7">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 8-9 4-9-4 9-4 9 4Zm0 0v8l-9 4m9-12-9 4m0 0L3 8m9 4v8m0 0-9-4V8" />
          </svg>
          <span
            v-if="cart.count"
            class="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white"
          >
            {{ cart.count }}
          </span>
        </RouterLink>

        <RouterLink
          to="/admin"
          class="hidden rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 sm:inline-flex dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          {{ t('nav.admin') }}
        </RouterLink>

        <button
          class="grid h-9 w-9 place-items-center rounded-xl text-stone-600 hover:bg-stone-100 md:hidden dark:text-stone-300 dark:hover:bg-stone-800"
          @click="mobileOpen = !mobileOpen"
          aria-label="menu"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <Transition name="fade">
      <nav v-if="mobileOpen" class="border-t border-stone-200 px-4 py-3 md:hidden dark:border-stone-800">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="block rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
          @click="mobileOpen = false"
        >
          {{ t(l.key) }}
        </RouterLink>
        <RouterLink
          to="/admin"
          class="block rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
          @click="mobileOpen = false"
        >
          {{ t('nav.admin') }}
        </RouterLink>
      </nav>
    </Transition>
  </header>
</template>
