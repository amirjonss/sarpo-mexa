import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useDataStore } from './data'

const STORAGE_KEY = 'sm.box'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return []
}

// The "box" — products the client is assembling into a gift.
export const useCartStore = defineStore('cart', () => {
  const data = useDataStore()
  const items = ref(load()) // [{ productId, quantity }]

  watch(
    items,
    (v) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
      } catch {
        /* ignore */
      }
    },
    { deep: true },
  )

  const count = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const distinctCount = computed(() => items.value.length)
  const total = computed(() =>
    items.value.reduce((s, i) => s + (data.productById(i.productId)?.price || 0) * i.quantity, 0),
  )
  const isEmpty = computed(() => items.value.length === 0)

  function qtyOf(productId) {
    return items.value.find((i) => i.productId === productId)?.quantity || 0
  }
  function add(productId, qty = 1) {
    const existing = items.value.find((i) => i.productId === productId)
    if (existing) existing.quantity += qty
    else items.value.push({ productId, quantity: qty })
  }
  function setQty(productId, qty) {
    const existing = items.value.find((i) => i.productId === productId)
    if (!existing) return
    if (qty <= 0) remove(productId)
    else existing.quantity = qty
  }
  function increment(productId) {
    add(productId, 1)
  }
  function decrement(productId) {
    const existing = items.value.find((i) => i.productId === productId)
    if (!existing) return
    if (existing.quantity <= 1) remove(productId)
    else existing.quantity -= 1
  }
  function remove(productId) {
    items.value = items.value.filter((i) => i.productId !== productId)
  }
  function clear() {
    items.value = []
  }

  return { items, count, distinctCount, total, isEmpty, qtyOf, add, setQty, increment, decrement, remove, clear }
})
