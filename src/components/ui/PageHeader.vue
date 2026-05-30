<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
})
</script>

<template>
  <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-stone-500 dark:text-stone-400">{{ subtitle }}</p>
    </div>
    <div class="flex shrink-0 items-center gap-2"><slot name="actions" /></div>
  </div>
</template>
