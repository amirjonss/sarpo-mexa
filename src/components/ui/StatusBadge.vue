<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  status: { type: String, required: true },
})
const { t } = useI18n()

const styles = {
  new: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  packing: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  ready: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  delivering: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  returned: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  cancelled: 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300',
}

const cls = computed(() => styles[props.status] || styles.new)
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    :class="cls"
  >
    <span class="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    {{ t(`status.${status}`) }}
  </span>
</template>
