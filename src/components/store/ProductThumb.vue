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
    <span v-if="!product.image && product.emoji" class="text-5xl">{{ product.emoji }}</span>
    <svg v-else-if="!product.image" class="h-1/2 w-1/2 text-stone-300 dark:text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2">
      <path stroke-linecap="round" stroke-linejoin="round" d="m20 7-8-4-8 4m16 0-8 4m0 0L4 7m8 4v9m-8-9v9l8 4 8-4V7" />
    </svg>
  </div>
</template>
