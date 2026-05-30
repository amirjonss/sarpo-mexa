import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { buildSeed, SEED_VERSION, CLOSED_STATUSES } from './seed'

const STORAGE_KEY = 'sm.data'
const VERSION_KEY = 'sm.seedVersion'

function load() {
  try {
    const storedVersion = Number(localStorage.getItem(VERSION_KEY))
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw && storedVersion === SEED_VERSION) return JSON.parse(raw)
  } catch {
    /* ignore corrupt storage */
  }
  // Stale or missing data — start from a fresh seed and drop any old box.
  try {
    localStorage.setItem(VERSION_KEY, String(SEED_VERSION))
    localStorage.removeItem('sm.box')
  } catch {
    /* ignore */
  }
  return buildSeed()
}

// Resolve a localized { ru, uz } name or a plain string for display.
export function localized(value, locale) {
  if (value && typeof value === 'object') return value[locale] ?? value.ru ?? ''
  return value ?? ''
}

export const useDataStore = defineStore('data', () => {
  const initial = load()

  const categories = ref(initial.categories)
  const products = ref(initial.products)
  const inventory = ref(initial.inventory)
  const clients = ref(initial.clients)
  const orders = ref(initial.orders)
  const users = ref(initial.users)

  // Persist any change to localStorage (debounced via microtask-free deep watch).
  watch(
    [categories, products, inventory, clients, orders, users],
    () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            categories: categories.value,
            products: products.value,
            inventory: inventory.value,
            clients: clients.value,
            orders: orders.value,
            users: users.value,
          }),
        )
      } catch {
        /* storage may be full / unavailable */
      }
    },
    { deep: true },
  )

  const nextId = (list) => (list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1)

  // ---- Lookups -------------------------------------------------------------
  const productById = (id) => products.value.find((p) => p.id === id)
  const categoryById = (id) => categories.value.find((c) => c.id === id)
  const clientById = (id) => clients.value.find((c) => c.id === id)
  const stockOf = (productId) =>
    inventory.value.find((i) => i.productId === productId)?.quantity ?? 0

  const categoryName = (id, locale) => {
    const c = categoryById(id)
    return c ? localized(c.name, locale) : '—'
  }

  // ---- Categories ----------------------------------------------------------
  function addCategory(data) {
    const id = nextId(categories.value)
    categories.value.push({ id, name: data.name })
    return id
  }
  function updateCategory(id, data) {
    const c = categoryById(id)
    if (c) c.name = data.name
  }
  function deleteCategory(id) {
    categories.value = categories.value.filter((c) => c.id !== id)
  }

  // ---- Products ------------------------------------------------------------
  function addProduct(data) {
    const id = nextId(products.value)
    products.value.push({
      id,
      name: data.name,
      price: Number(data.price) || 0,
      categoryId: data.categoryId ? Number(data.categoryId) : null,
      image: data.image || '',
      emoji: data.emoji || '🎁',
    })
    inventory.value.push({ id: nextId(inventory.value), productId: id, quantity: Number(data.quantity) || 0 })
  }
  function updateProduct(id, data) {
    const p = productById(id)
    if (!p) return
    p.name = data.name
    p.price = Number(data.price) || 0
    p.categoryId = data.categoryId ? Number(data.categoryId) : null
    if (data.image !== undefined) p.image = data.image
    p.emoji = data.emoji || p.emoji
  }
  function deleteProduct(id) {
    products.value = products.value.filter((p) => p.id !== id)
    inventory.value = inventory.value.filter((i) => i.productId !== id)
  }

  // ---- Inventory -----------------------------------------------------------
  function setStock(productId, quantity) {
    const inv = inventory.value.find((i) => i.productId === productId)
    if (inv) inv.quantity = Math.max(0, Number(quantity) || 0)
    else inventory.value.push({ id: nextId(inventory.value), productId, quantity: Math.max(0, Number(quantity) || 0) })
  }
  // Rental movement: sign -1 sends boxes out (order created/active),
  // sign +1 returns them to stock (order closed / cancelled / item removed).
  function applyStock(items, sign) {
    for (const it of items) {
      const inv = inventory.value.find((i) => i.productId === it.productId)
      if (inv) inv.quantity = Math.max(0, inv.quantity + sign * it.quantity)
      else if (sign > 0) inventory.value.push({ id: nextId(inventory.value), productId: it.productId, quantity: it.quantity })
    }
  }
  const isClosed = (status) => CLOSED_STATUSES.includes(status)

  // ---- Clients -------------------------------------------------------------
  function addClient(data) {
    const id = nextId(clients.value)
    clients.value.push({ id, name: data.name, phone: data.phone })
    return id
  }
  function updateClient(id, data) {
    const c = clientById(id)
    if (c) {
      c.name = data.name
      c.phone = data.phone
    }
  }
  function deleteClient(id) {
    clients.value = clients.value.filter((c) => c.id !== id)
  }
  function findOrCreateClient(name, phone) {
    const existing = clients.value.find(
      (c) => c.phone.replace(/\D/g, '') === phone.replace(/\D/g, '') && phone.replace(/\D/g, ''),
    )
    if (existing) return existing.id
    return addClient({ name, phone })
  }

  // ---- Orders --------------------------------------------------------------
  function addOrder({ clientId, targetDate, address, note, items, status = 'new', paid = 0 }) {
    const id = orders.value.length ? Math.max(...orders.value.map((o) => o.id)) + 1 : 1001
    const built = items.map((it, idx) => ({
      id: idx + 1,
      productId: it.productId,
      quantity: it.quantity,
      price: it.price != null ? Number(it.price) : (productById(it.productId)?.price || 0),
    }))
    const createdAt = new Date().toISOString().slice(0, 10)
    const paidNum = Math.max(0, Number(paid) || 0)
    const order = {
      id,
      clientId,
      targetDate,
      address: address || '',
      status,
      returned: isClosed(status),
      note: note || '',
      createdAt,
      items: built,
      payments: paidNum > 0 ? [{ id: 1, amount: paidNum, createdAt }] : [],
    }
    orders.value.push(order)
    // Boxes leave inventory unless the order starts already closed.
    if (!order.returned) applyStock(built, -1)
    return id
  }
  function updateOrderStatus(id, status) {
    const o = orders.value.find((o) => o.id === id)
    if (!o) return
    const closing = isClosed(status)
    if (closing && !o.returned) {
      applyStock(o.items, +1) // rented boxes come back
      o.returned = true
    } else if (!closing && o.returned) {
      applyStock(o.items, -1) // re-opened: boxes go back out
      o.returned = false
    }
    o.status = status
  }
  function deleteOrder(id) {
    const o = orders.value.find((o) => o.id === id)
    if (o && !o.returned) applyStock(o.items, +1)
    orders.value = orders.value.filter((o) => o.id !== id)
  }
  function orderById(id) {
    return orders.value.find((o) => o.id === Number(id))
  }
  function ordersByClient(clientId) {
    return orders.value.filter((o) => o.clientId === Number(clientId)).sort((a, b) => b.id - a.id)
  }
  function addOrderItem(orderId, productId, quantity = 1, price = null) {
    const o = orderById(orderId)
    if (!o) return
    const existing = o.items.find((i) => i.productId === productId)
    if (existing) existing.quantity += quantity
    else o.items.push({ id: nextId(o.items), productId, quantity, price: price != null ? Number(price) : (productById(productId)?.price || 0) })
    if (!o.returned) applyStock([{ productId, quantity }], -1)
  }
  function updateOrderItemQty(orderId, itemId, quantity) {
    const o = orderById(orderId)
    const item = o?.items.find((i) => i.id === itemId)
    if (!item) return
    const next = Math.max(1, Number(quantity) || 1)
    const delta = next - item.quantity
    item.quantity = next
    if (!o.returned && delta !== 0) applyStock([{ productId: item.productId, quantity: Math.abs(delta) }], delta > 0 ? -1 : +1)
  }
  function updateOrderItemPrice(orderId, itemId, price) {
    const o = orderById(orderId)
    const item = o?.items.find((i) => i.id === itemId)
    if (item) item.price = Math.max(0, Number(price) || 0)
  }
  function removeOrderItem(orderId, itemId) {
    const o = orderById(orderId)
    if (!o) return
    const item = o.items.find((i) => i.id === itemId)
    o.items = o.items.filter((i) => i.id !== itemId)
    if (!o.returned && item) applyStock([item], +1)
  }
  function orderItemPrice(item) {
    return item.price != null ? item.price : (productById(item.productId)?.price || 0)
  }
  function orderTotal(order) {
    return order.items.reduce((sum, it) => sum + orderItemPrice(it) * it.quantity, 0)
  }

  // ---- Payments (full or partial; clients may pay in instalments) ----------
  function addPayment(orderId, amount) {
    const o = orderById(orderId)
    if (!o) return
    if (!o.payments) o.payments = []
    const amt = Math.max(0, Number(amount) || 0)
    if (amt <= 0) return
    o.payments.push({ id: nextId(o.payments), amount: amt, createdAt: new Date().toISOString().slice(0, 10) })
  }
  function removePayment(orderId, paymentId) {
    const o = orderById(orderId)
    if (o?.payments) o.payments = o.payments.filter((p) => p.id !== paymentId)
  }
  function orderPaid(order) {
    return (order.payments || []).reduce((s, p) => s + (Number(p.amount) || 0), 0)
  }
  function orderBalance(order) {
    return orderTotal(order) - orderPaid(order)
  }
  function paymentStatus(order) {
    const paid = orderPaid(order)
    if (paid <= 0) return 'unpaid'
    if (paid >= orderTotal(order)) return 'paid'
    return 'partial'
  }
  function orderItemCount(order) {
    return order.items.reduce((sum, it) => sum + it.quantity, 0)
  }

  // ---- Users ---------------------------------------------------------------
  function addUser(data) {
    users.value.push({ id: nextId(users.value), username: data.username, roles: data.roles || [] })
  }
  function updateUser(id, data) {
    const u = users.value.find((u) => u.id === id)
    if (u) {
      u.username = data.username
      u.roles = data.roles || []
    }
  }
  function deleteUser(id) {
    users.value = users.value.filter((u) => u.id !== id)
  }

  // ---- Derived counts ------------------------------------------------------
  const productCountByCategory = computed(() => {
    const map = {}
    for (const p of products.value) map[p.categoryId] = (map[p.categoryId] || 0) + 1
    return map
  })
  const orderCountByClient = computed(() => {
    const map = {}
    for (const o of orders.value) map[o.clientId] = (map[o.clientId] || 0) + 1
    return map
  })

  function resetDemo() {
    const fresh = buildSeed()
    categories.value = fresh.categories
    products.value = fresh.products
    inventory.value = fresh.inventory
    clients.value = fresh.clients
    orders.value = fresh.orders
    users.value = fresh.users
    try {
      localStorage.setItem(VERSION_KEY, String(SEED_VERSION))
      localStorage.removeItem('sm.box')
    } catch {
      /* ignore */
    }
  }

  return {
    categories,
    products,
    inventory,
    clients,
    orders,
    users,
    productById,
    categoryById,
    clientById,
    stockOf,
    categoryName,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    setStock,
    addClient,
    updateClient,
    deleteClient,
    findOrCreateClient,
    addOrder,
    updateOrderStatus,
    deleteOrder,
    orderById,
    ordersByClient,
    addOrderItem,
    updateOrderItemQty,
    updateOrderItemPrice,
    removeOrderItem,
    orderItemPrice,
    orderTotal,
    orderItemCount,
    addPayment,
    removePayment,
    orderPaid,
    orderBalance,
    paymentStatus,
    addUser,
    updateUser,
    deleteUser,
    productCountByCategory,
    orderCountByClient,
    resetDemo,
  }
})
