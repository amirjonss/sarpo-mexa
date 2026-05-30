<script setup>
defineProps({
  icon: { type: String, default: '📦' },
  title: { type: String, default: '' },
  text: { type: String, default: '' },
})
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 px-6 py-14 text-center dark:border-stone-700">
    <div class="mb-3 text-5xl">{{ icon }}</div>
    <h3 v-if="title" class="text-base font-semibold text-stone-700 dark:text-stone-200">{{ title }}</h3>
    <p v-if="text" class="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">{{ text }}</p>
    <div class="mt-5"><slot /></div>
  </div>
</template>
