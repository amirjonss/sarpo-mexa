<script setup>
// Text input that shows money grouped by thousands (e.g. 10 000) while emitting
// a plain Number via v-model. Uses inputmode="numeric" so mobile shows a keypad.
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: [Number, String, null], default: null },
})
const emit = defineEmits(['update:modelValue'])

const inputRef = ref(null)

function onlyDigits(s) {
  return String(s ?? '').replace(/\D/g, '')
}
function group(d) {
  return d.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
function toDisplay(v) {
  const d = onlyDigits(v)
  return d ? group(d) : ''
}

const display = ref(toDisplay(props.modelValue))

// Reformat when the value is changed from outside (e.g. "pay full" button).
watch(
  () => props.modelValue,
  (v) => {
    if (onlyDigits(v) !== onlyDigits(display.value)) display.value = toDisplay(v)
  },
)

function onInput(e) {
  const el = e.target
  const caret = el.selectionStart ?? el.value.length
  const digitsBeforeCaret = onlyDigits(el.value.slice(0, caret)).length

  const digits = onlyDigits(el.value)
  const formatted = digits ? group(digits) : ''
  display.value = formatted
  emit('update:modelValue', digits ? Number(digits) : null)

  // Restore the caret after reformatting, keeping it past the same digit count.
  requestAnimationFrame(() => {
    const node = inputRef.value
    if (!node) return
    let pos = formatted.length
    if (digitsBeforeCaret === 0) {
      pos = 0
    } else {
      let seen = 0
      for (let i = 0; i < formatted.length; i++) {
        if (formatted[i] >= '0' && formatted[i] <= '9') {
          seen++
          if (seen === digitsBeforeCaret) {
            pos = i + 1
            break
          }
        }
      }
    }
    node.setSelectionRange(pos, pos)
  })
}
</script>

<template>
  <input
    ref="inputRef"
    :value="display"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    @input="onInput"
  />
</template>
