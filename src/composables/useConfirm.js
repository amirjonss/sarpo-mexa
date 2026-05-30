import { ref } from 'vue'

// Shared handle to the single ConfirmDialog mounted in App.vue.
const dialogRef = ref(null)

export function useConfirm() {
  function registerConfirm(instance) {
    dialogRef.value = instance
  }
  function confirm(message) {
    if (!dialogRef.value) return Promise.resolve(window.confirm(message))
    return dialogRef.value.ask(message)
  }
  return { registerConfirm, confirm }
}
