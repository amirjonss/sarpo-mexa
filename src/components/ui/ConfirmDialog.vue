<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'

const { t } = useI18n()
const open = ref(false)
const message = ref('')
let resolver = null

function ask(msg) {
  message.value = msg
  open.value = true
  return new Promise((resolve) => {
    resolver = resolve
  })
}
function decide(value) {
  open.value = false
  resolver?.(value)
  resolver = null
}

defineExpose({ ask })
</script>

<template>
  <BaseModal v-model="open" :title="t('common.confirm')">
    <p class="text-sm text-stone-600 dark:text-stone-300">{{ message }}</p>
    <template #footer>
      <BaseButton variant="secondary" @click="decide(false)">{{ t('common.cancel') }}</BaseButton>
      <BaseButton variant="danger" @click="decide(true)">{{ t('common.delete') }}</BaseButton>
    </template>
  </BaseModal>
</template>
