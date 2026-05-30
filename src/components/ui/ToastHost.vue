<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

const styles = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-stone-800 text-white dark:bg-stone-700',
}
const icons = {
  success: 'M4.5 12.75l6 6 9-13.5',
  error: 'M6 18 18 6M6 6l12 12',
  info: 'M12 9v3.75m0 3.75h.008M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
}
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      <TransitionGroup name="fade">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg"
          :class="styles[toast.type]"
          @click="dismiss(toast.id)"
        >
          <svg class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" :d="icons[toast.type]" />
          </svg>
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
