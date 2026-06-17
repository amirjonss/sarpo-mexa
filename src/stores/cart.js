import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useDataStore } from './data'

// The "box" — products being assembled into the current order. Kept in memory
// only: a half-built order should not survive a reload (the recipient/delivery
// fields aren't persisted either, so reviving just the items would desync).
export const useCartStore = defineStore('cart', () => {
  const data = useDataStore()
  const items = ref([]) // [{ productId, quantity }]

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
  // Add every product of a ready-made set (комплект) to the box at once.
  function addSet(setId) {
    const set = data.setById(setId)
    if (!set) return
    for (const it of set.items) add(it.productId, it.quantity)
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

  return { items, count, distinctCount, total, isEmpty, qtyOf, add, addSet, setQty, increment, decrement, remove, clear }
})
