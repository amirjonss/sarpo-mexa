<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger | gold
  size: { type: String, default: 'md' }, // sm | md | lg
  block: { type: Boolean, default: false },
  type: { type: String, default: 'button' },
})

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap'

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20',
  secondary:
    'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700',
  ghost: 'text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  gold: 'bg-gold-400 text-gold-950 hover:bg-gold-300 shadow-sm shadow-gold-500/20',
  outline:
    'border border-stone-300 text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

const classes = computed(() => [
  base,
  variants[props.variant] || variants.primary,
  sizes[props.size] || sizes.md,
  props.block ? 'w-full' : '',
])
</script>

<template>
  <button :type="type" :class="classes">
    <slot />
  </button>
</template>
