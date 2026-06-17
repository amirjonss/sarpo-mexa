<script setup>
// Phone input that auto-formats to the Uzbek mask +998 XX XXX XX XX and emits
// the formatted string via v-model. Keeps stored numbers consistent so the same
// client isn't created twice from differently typed phones.
import { ref, watch } from 'vue'
import { formatPhone, phoneDigits } from '@/composables/usePhone'

const props = defineProps({
  modelValue: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)
const display = ref(formatPhone(props.modelValue))

watch(
  () => props.modelValue,
  (v) => {
    if (phoneDigits(v) !== phoneDigits(display.value)) display.value = formatPhone(v)
  },
)

function onInput(e) {
  const formatted = formatPhone(e.target.value)
  display.value = formatted
  emit('update:modelValue', formatted)
  requestAnimationFrame(() => {
    const node = inputRef.value
    if (!node) return
    const pos = formatted.length
    node.setSelectionRange(pos, pos)
  })
}
</script>

<template>
  <input
    ref="inputRef"
    :value="display"
    type="tel"
    inputmode="tel"
    autocomplete="off"
    placeholder="+998 90 123 45 67"
    @input="onInput"
  />
</template>
