<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useDataStore, localized } from '@/stores/data'
import { useFormat } from '@/composables/useFormat'
import { ORDER_STATUSES } from '@/stores/seed'
import PageHeader from '@/components/ui/PageHeader.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import ProductThumb from '@/components/store/ProductThumb.vue'

const { t, locale } = useI18n()
const data = useDataStore()
const { money, date } = useFormat()

const localeCode = computed(() => (locale.value === 'uz' ? 'uz-UZ' : 'ru-RU'))
const now = new Date()
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
const monthLabel = (d) => new Intl.DateTimeFormat(localeCode.value, { month: 'short' }).format(d)
const compactMoney = (v) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}М`
  if (v >= 1000) return `${Math.round(v / 1000)}К`
  return String(v)
}

const activeOrders = computed(() => data.orders.filter((o) => o.status !== 'cancelled'))

const revenue = computed(() => activeOrders.value.reduce((s, o) => s + data.orderTotal(o), 0))
const recentOrders = computed(() => [...data.orders].sort((a, b) => b.id - a.id).slice(0, 5))
const upcoming = computed(() =>
  [...data.orders]
    .filter((o) => !['delivered', 'returned', 'cancelled'].includes(o.status))
    .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
    .slice(0, 5),
)
const statusCounts = computed(() => {
  const map = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]))
  for (const o of data.orders) map[o.status]++
  return map
})

const stats = computed(() => [
  { key: 'dashboard.totalOrders', value: data.orders.length, icon: '🧾', tint: 'from-brand-500 to-brand-600' },
  { key: 'dashboard.revenue', value: money(revenue.value), icon: '💰', tint: 'from-gold-400 to-gold-600' },
  { key: 'dashboard.clients', value: data.clients.length, icon: '👥', tint: 'from-emerald-500 to-emerald-600' },
  { key: 'dashboard.products', value: data.products.length, icon: '📦', tint: 'from-violet-500 to-violet-600' },
])

// ---- Finance ----
const monthRevenue = (offset) => {
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const key = monthKey(d)
  return activeOrders.value
    .filter((o) => (o.createdAt || '').slice(0, 7) === key)
    .reduce((s, o) => s + data.orderTotal(o), 0)
}
const revenueThisMonth = computed(() => monthRevenue(0))
const revenueLastMonth = computed(() => monthRevenue(-1))
const revenueGrowth = computed(() => {
  const last = revenueLastMonth.value
  if (!last) return null
  return Math.round(((revenueThisMonth.value - last) / last) * 100)
})
const avgOrder = computed(() => (activeOrders.value.length ? Math.round(revenue.value / activeOrders.value.length) : 0))
const totalDiscount = computed(() =>
  activeOrders.value.reduce(
    (s, o) =>
      s +
      o.items.reduce((ss, it) => {
        const base = data.productById(it.productId)?.price || 0
        const diff = base - data.orderItemPrice(it)
        return ss + (diff > 0 ? diff * it.quantity : 0)
      }, 0),
    0,
  ),
)

// ---- Tops ----
const topProducts = computed(() => {
  const m = {}
  for (const o of activeOrders.value) {
    for (const it of o.items) {
      if (!m[it.productId]) m[it.productId] = { qty: 0, revenue: 0 }
      m[it.productId].qty += it.quantity
      m[it.productId].revenue += data.orderItemPrice(it) * it.quantity
    }
  }
  return Object.entries(m)
    .map(([pid, v]) => ({ product: data.productById(Number(pid)), ...v }))
    .filter((x) => x.product)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
})
// ---- Trends ----
const monthlyTrend = computed(() => {
  const arr = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthKey(d)
    const inMonth = activeOrders.value.filter((o) => (o.createdAt || '').slice(0, 7) === key)
    arr.push({
      key,
      label: monthLabel(d),
      revenue: inMonth.reduce((s, o) => s + data.orderTotal(o), 0),
      count: inMonth.length,
    })
  }
  return arr
})
const maxMonthly = computed(() => Math.max(1, ...monthlyTrend.value.map((m) => m.revenue)))

const categoryStats = computed(() => {
  const m = {}
  for (const o of activeOrders.value) {
    for (const it of o.items) {
      const p = data.productById(it.productId)
      if (!p) continue
      if (!m[p.categoryId]) m[p.categoryId] = 0
      m[p.categoryId] += data.orderItemPrice(it) * it.quantity
    }
  }
  return Object.entries(m)
    .map(([cid, rev]) => ({ category: data.categoryById(Number(cid)), revenue: rev }))
    .filter((x) => x.category)
    .sort((a, b) => b.revenue - a.revenue)
})
const maxCategory = computed(() => Math.max(1, ...categoryStats.value.map((c) => c.revenue)))
</script>

<template>
  <div>
    <PageHeader :title="t('dashboard.title')" :subtitle="t('dashboard.subtitle')" />

    <!-- Stat cards -->
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <div v-for="s in stats" :key="s.key" class="sm-card p-5">
        <div class="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-xl text-white" :class="s.tint">{{ s.icon }}</div>
        <div class="mt-3 text-2xl font-bold text-stone-800 dark:text-stone-100">{{ s.value }}</div>
        <div class="text-sm text-stone-500 dark:text-stone-400">{{ t(s.key) }}</div>
      </div>
    </div>

    <!-- Finance row -->
    <div class="mt-4 grid gap-4 sm:grid-cols-3">
      <div class="sm-card p-5">
        <div class="text-sm text-stone-500 dark:text-stone-400">{{ t('dashboard.revenueMonth') }}</div>
        <div class="mt-1 text-2xl font-bold text-stone-800 dark:text-stone-100">{{ money(revenueThisMonth) }}</div>
        <div v-if="revenueGrowth !== null" class="mt-1 inline-flex items-center gap-1 text-sm font-medium" :class="revenueGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'">
          <span>{{ revenueGrowth >= 0 ? '▲' : '▼' }} {{ Math.abs(revenueGrowth) }}%</span>
          <span class="font-normal text-stone-400">{{ t('dashboard.vsLastMonth') }}</span>
        </div>
        <div v-else class="mt-1 text-sm text-stone-400">{{ t('dashboard.vsLastMonth') }}: —</div>
      </div>
      <div class="sm-card p-5">
        <div class="text-sm text-stone-500 dark:text-stone-400">{{ t('dashboard.avgOrder') }}</div>
        <div class="mt-1 text-2xl font-bold text-stone-800 dark:text-stone-100">{{ money(avgOrder) }}</div>
        <div class="mt-1 text-sm text-stone-400">{{ activeOrders.length }} {{ t('dashboard.ordersWord') }}</div>
      </div>
      <div class="sm-card p-5">
        <div class="text-sm text-stone-500 dark:text-stone-400">{{ t('dashboard.discountsGiven') }}</div>
        <div class="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ money(totalDiscount) }}</div>
        <div class="mt-1 text-sm text-stone-400">{{ t('dashboard.discountsHint') }}</div>
      </div>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <!-- Recent orders -->
      <div class="sm-card lg:col-span-2">
        <div class="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-stone-800">
          <h2 class="font-semibold text-stone-800 dark:text-stone-100">{{ t('dashboard.recentOrders') }}</h2>
          <RouterLink to="/admin/orders" class="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">{{ t('home.viewAll') }} →</RouterLink>
        </div>
        <ul class="divide-y divide-stone-100 dark:divide-stone-800">
          <li v-for="o in recentOrders" :key="o.id" class="flex items-center gap-3 px-5 py-3">
            <RouterLink :to="`/admin/orders/${o.id}`" class="font-semibold text-stone-700 hover:text-brand-600 dark:text-stone-200">#{{ o.id }}</RouterLink>
            <span class="min-w-0 flex-1 truncate text-sm text-stone-500 dark:text-stone-400">{{ data.clientById(o.clientId)?.name }}</span>
            <span class="hidden text-sm text-stone-400 sm:block">{{ date(o.targetDate) }}</span>
            <StatusBadge :status="o.status" />
            <span class="hidden w-28 text-right text-sm font-medium text-stone-700 sm:block dark:text-stone-200">{{ money(data.orderTotal(o)) }}</span>
          </li>
        </ul>
      </div>

      <!-- Status breakdown -->
      <div class="sm-card p-5">
        <h2 class="mb-4 font-semibold text-stone-800 dark:text-stone-100">{{ t('dashboard.byStatus') }}</h2>
        <ul class="space-y-3">
          <li v-for="st in ORDER_STATUSES" :key="st">
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-stone-600 dark:text-stone-300">{{ t(`status.${st}`) }}</span>
              <span class="font-medium text-stone-700 dark:text-stone-200">{{ statusCounts[st] }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div class="h-full rounded-full bg-brand-500" :style="{ width: (data.orders.length ? (statusCounts[st] / data.orders.length) * 100 : 0) + '%' }" />
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Top products + by category -->
    <div class="mt-6 grid gap-6 lg:grid-cols-2">
      <div class="sm-card p-5">
        <h2 class="mb-4 font-semibold text-stone-800 dark:text-stone-100">🔥 {{ t('dashboard.topProducts') }}</h2>
        <ul class="space-y-3">
          <li v-for="(p, idx) in topProducts" :key="p.product.id" class="flex items-center gap-3">
            <span class="w-5 shrink-0 text-center text-sm font-bold text-stone-400">{{ idx + 1 }}</span>
            <ProductThumb :product="p.product" rounded="rounded-lg" class="h-10 w-10 shrink-0" />
            <div class="min-w-0 flex-1">
              <div class="line-clamp-1 text-sm font-medium text-stone-800 dark:text-stone-100">{{ localized(p.product.name, locale) }}</div>
              <div class="text-xs text-stone-400">{{ p.qty }} {{ t('dashboard.soldQty') }}</div>
            </div>
            <span class="shrink-0 text-sm font-semibold text-stone-700 dark:text-stone-200">{{ money(p.revenue) }}</span>
          </li>
          <li v-if="!topProducts.length" class="text-sm text-stone-400">{{ t('common.none') }}</li>
        </ul>
      </div>

      <!-- By category -->
      <div class="sm-card p-5">
        <h2 class="mb-4 font-semibold text-stone-800 dark:text-stone-100">📦 {{ t('dashboard.byCategory') }}</h2>
        <ul class="space-y-3">
          <li v-for="c in categoryStats" :key="c.category.id">
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="text-stone-600 dark:text-stone-300">{{ localized(c.category.name, locale) }}</span>
              <span class="font-medium text-stone-700 dark:text-stone-200">{{ money(c.revenue) }}</span>
            </div>
            <div class="h-2.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div class="h-full rounded-full bg-gradient-to-r from-gold-400 to-brand-500" :style="{ width: (c.revenue / maxCategory) * 100 + '%' }" />
            </div>
          </li>
          <li v-if="!categoryStats.length" class="text-sm text-stone-400">{{ t('common.none') }}</li>
        </ul>
      </div>
    </div>

    <!-- Revenue trend + upcoming -->
    <div class="mt-6 grid gap-6 lg:grid-cols-3">
      <!-- Revenue by month -->
      <div class="sm-card p-5 lg:col-span-2">
        <h2 class="mb-5 font-semibold text-stone-800 dark:text-stone-100">📈 {{ t('dashboard.revenueTrend') }}</h2>
        <div class="flex h-44 gap-2">
          <div v-for="m in monthlyTrend" :key="m.key" class="flex h-full flex-1 flex-col items-center gap-2">
            <span class="text-[11px] font-medium text-stone-400">{{ compactMoney(m.revenue) }}</span>
            <div class="flex min-h-0 w-full flex-1 items-end">
              <div
                class="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-400 transition-all"
                :style="{ height: Math.max(3, (m.revenue / maxMonthly) * 100) + '%' }"
                :title="money(m.revenue)"
              />
            </div>
            <span class="text-xs capitalize text-stone-500 dark:text-stone-400">{{ m.label }}</span>
          </div>
        </div>
      </div>

      <!-- Upcoming deliveries -->
      <div class="sm-card p-5">
        <h2 class="mb-4 font-semibold text-stone-800 dark:text-stone-100">📅 {{ t('dashboard.upcomingDeliveries') }}</h2>
        <ul class="space-y-3">
          <li v-for="o in upcoming" :key="o.id" class="flex items-center justify-between gap-2">
            <div class="min-w-0">
              <RouterLink :to="`/admin/orders/${o.id}`" class="text-sm font-medium text-stone-700 hover:text-brand-600 dark:text-stone-200">#{{ o.id }}</RouterLink>
              <div class="truncate text-xs text-stone-500 dark:text-stone-400">{{ data.clientById(o.clientId)?.name }}</div>
            </div>
            <span class="shrink-0 text-sm font-medium text-stone-600 dark:text-stone-300">{{ date(o.targetDate) }}</span>
          </li>
          <li v-if="!upcoming.length" class="text-sm text-stone-400">{{ t('common.none') }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
