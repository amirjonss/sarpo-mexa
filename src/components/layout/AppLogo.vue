<script setup>
defineProps({
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <div class="flex items-center gap-2.5">
    <span
      class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-gold-500 text-lg shadow-sm shadow-brand-600/30"
    >
      🎁
    </span>
    <span v-if="!compact" class="flex flex-col leading-none">
      <span class="text-lg font-bold tracking-tight text-stone-800 dark:text-stone-100">
        Sarpo <span class="text-brand-600 dark:text-brand-400">Mexa</span>
      </span>
    </span>
  </div>
</template>
