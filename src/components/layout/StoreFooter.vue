<script setup>
import { useI18n } from 'vue-i18n'
import AppLogo from './AppLogo.vue'
const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-16 border-t border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
    <div class="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
      <div class="flex flex-col items-center gap-1 sm:items-start">
        <AppLogo />
        <p class="text-sm text-stone-500 dark:text-stone-400">{{ t('brand.tagline') }}</p>
      </div>
      <p class="text-xs text-stone-400 dark:text-stone-500">© {{ year }} Sarpo Mexa — demo prototype</p>
    </div>
  </footer>
</template>
