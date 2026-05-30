<script setup>
import { useUiStore } from '@/stores/ui'
const ui = useUiStore()
const langs = [
  { code: 'ru', label: 'RU' },
  { code: 'uz', label: 'UZ' },
]
</script>

<template>
  <div class="flex items-center rounded-xl bg-stone-100 p-0.5 dark:bg-stone-800">
    <button
      v-for="l in langs"
      :key="l.code"
      class="rounded-lg px-2.5 py-1 text-xs font-semibold transition"
      :class="
        ui.locale === l.code
          ? 'bg-white text-brand-600 shadow-sm dark:bg-stone-700 dark:text-brand-400'
          : 'text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200'
      "
      @click="ui.setLocale(l.code)"
    >
      {{ l.label }}
    </button>
  </div>
</template>
