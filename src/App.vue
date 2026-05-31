<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useConfirm } from '@/composables/useConfirm'
import { useTelegram } from '@/composables/useTelegram'
import ToastHost from '@/components/ui/ToastHost.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

// Initialize UI store (applies persisted theme + locale on load).
const ui = useUiStore()
const route = useRoute()
const router = useRouter()
const { tg, isTelegram, ready, setBackButton, setHeaderColor } = useTelegram()

const { registerConfirm } = useConfirm()
const confirmDialog = ref(null)

function syncTelegramTheme() {
  if (!tg) return
  ui.setTheme(tg.colorScheme === 'dark' ? 'dark' : 'light')
  setHeaderColor(tg.colorScheme === 'dark' ? '#0c0a09' : '#fafaf9')
}

onMounted(() => {
  registerConfirm(confirmDialog.value)

  if (isTelegram) {
    ready()
    syncTelegramTheme()
    tg.onEvent('themeChanged', syncTelegramTheme)
  }
})

// Native Telegram back button: shown on every screen except the home builder.
watch(
  () => route.path,
  (path) => {
    if (isTelegram) setBackButton(path !== '/', () => router.back())
  },
  { immediate: true },
)
</script>

<template>
  <RouterView />
  <ToastHost />
  <ConfirmDialog ref="confirmDialog" />
</template>
