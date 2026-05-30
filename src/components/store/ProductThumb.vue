<script setup>
defineProps({
  product: { type: Object, required: true },
  rounded: { type: String, default: 'rounded-2xl' },
})
</script>

<template>
  <div
    :class="rounded"
    class="flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 to-gold-50 dark:from-stone-800 dark:to-stone-700"
  >
    <img
      v-if="product.image"
      :src="product.image"
      :alt="''"
      loading="lazy"
      class="h-full w-full object-contain p-2 transition group-hover:scale-105"
    />
    <span v-else class="text-5xl">{{ product.emoji || '🎁' }}</span>
  </div>
</template>
