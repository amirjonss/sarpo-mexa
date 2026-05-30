<script setup>
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useConfirm } from '@/composables/useConfirm'
import ToastHost from '@/components/ui/ToastHost.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

// Initialize UI store (applies persisted theme + locale on load).
useUiStore()

const { registerConfirm } = useConfirm()
const confirmDialog = ref(null)
onMounted(() => registerConfirm(confirmDialog.value))
</script>

<template>
  <RouterView />
  <ToastHost />
  <ConfirmDialog ref="confirmDialog" />
</template>
