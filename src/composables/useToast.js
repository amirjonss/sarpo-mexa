import { ref } from 'vue'

// Simple global toast queue, rendered by ToastHost.vue.
const toasts = ref([])
let seq = 0

export function useToast() {
  function show(message, type = 'success', timeout = 2600) {
    const id = ++seq
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), timeout)
  }
  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }
  return {
    toasts,
    dismiss,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error'),
    info: (m) => show(m, 'info'),
  }
}
