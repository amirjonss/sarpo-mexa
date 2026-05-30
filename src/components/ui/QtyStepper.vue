<script setup>
defineProps({
  modelValue: { type: Number, default: 1 },
  min: { type: Number, default: 1 },
})
const emit = defineEmits(['update:modelValue', 'increment', 'decrement'])
</script>

<template>
  <div class="inline-flex items-center rounded-xl border border-stone-300 dark:border-stone-700">
    <button
      class="grid h-9 w-9 place-items-center rounded-l-xl text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
      @click="emit('decrement')"
      aria-label="-"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
        <path stroke-linecap="round" d="M5 12h14" />
      </svg>
    </button>
    <span class="grid h-9 min-w-9 place-items-center px-1 text-sm font-semibold tabular-nums">{{ modelValue }}</span>
    <button
      class="grid h-9 w-9 place-items-center rounded-r-xl text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
      @click="emit('increment')"
      aria-label="+"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
        <path stroke-linecap="round" d="M12 5v14M5 12h14" />
      </svg>
    </button>
  </div>
</template>
