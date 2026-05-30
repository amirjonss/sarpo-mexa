<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useDataStore, localized } from '@/stores/data'
import { useFormat } from '@/composables/useFormat'
import { useToast } from '@/composables/useToast'
import { useSectionBase } from '@/composables/useSection'
import { ORDER_STATUSES } from '@/stores/seed'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const { t, locale } = useI18n()
const data = useDataStore()
const { money, date } = useFormat()
const toast = useToast()
const base = useSectionBase()

const statusFilter = ref('all')
const minDate = new Date().toISOString().slice(0, 16)

const filtered = computed(() => {
  const list = statusFilter.value === 'all' ? data.orders : data.orders.filter((o) => o.status === statusFilter.value)
  return [...list].sort((a, b) => b.id - a.id)
})

// ---- New order modal ----
const modalOpen = ref(false)
const form = reactive({ clientId: '', targetDate: '', address: '', status: 'new', note: '', paid: 0, items: [] })
const picker = ref('')

function openCreate() {
  Object.assign(form, { clientId: data.clients[0]?.id ?? '', targetDate: '', address: '', status: 'new', note: '', paid: 0, items: [] })
  picker.value = ''
  modalOpen.value = true
}
function addItem() {
  const pid = Number(picker.value)
  if (!pid) return
  const existing = form.items.find((i) => i.productId === pid)
  if (existing) existing.quantity++
  else form.items.push({ productId: pid, quantity: 1, price: data.productById(pid)?.price || 0 })
  picker.value = ''
}
function removeItem(pid) {
  form.items = form.items.filter((i) => i.productId !== pid)
}
const formTotal = computed(() =>
  form.items.reduce((s, i) => s + (Number(i.price) || 0) * i.quantity, 0),
)
function save() {
  if (!form.clientId || !form.targetDate || !form.items.length) {
    toast.error(t('common.requiredField'))
    return
  }
  data.addOrder({
    clientId: Number(form.clientId),
    targetDate: form.targetDate,
    address: form.address,
    status: form.status,
    note: form.note,
    paid: Number(form.paid) || 0,
    items: form.items,
  })
  toast.success(t('common.created'))
  modalOpen.value = false
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-6">
    <PageHeader :title="t('orders.title')" :subtitle="t('orders.subtitle')">
      <template #actions>
        <BaseButton variant="primary" @click="openCreate">+ {{ t('orders.new') }}</BaseButton>
      </template>
    </PageHeader>

    <!-- status filter -->
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        class="rounded-full px-3.5 py-1.5 text-sm font-medium transition"
        :class="statusFilter === 'all' ? 'bg-brand-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'"
        @click="statusFilter = 'all'"
      >
        {{ t('common.all') }}
      </button>
      <button
        v-for="s in ORDER_STATUSES"
        :key="s"
        class="rounded-full px-3.5 py-1.5 text-sm font-medium transition"
        :class="statusFilter === s ? 'bg-brand-600 text-white' : 'bg-white text-stone-600 hover:bg-stone-100 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800'"
        @click="statusFilter = s"
      >
        {{ t(`status.${s}`) }}
      </button>
    </div>

    <div v-if="filtered.length" class="sm-card overflow-hidden">
      <div class="hidden grid-cols-[80px_1fr_140px_90px_120px_120px] gap-4 border-b border-stone-200 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-stone-400 lg:grid dark:border-stone-800">
        <span>{{ t('orders.id') }}</span>
        <span>{{ t('orders.client') }}</span>
        <span>{{ t('orders.targetDate') }}</span>
        <span>{{ t('orders.items') }}</span>
        <span>{{ t('common.status') }}</span>
        <span class="text-right">{{ t('orders.total') }}</span>
      </div>
      <ul class="divide-y divide-stone-100 dark:divide-stone-800">
        <li v-for="o in filtered" :key="o.id">
          <RouterLink :to="`${base}/orders/${o.id}`" class="grid grid-cols-2 items-center gap-2 px-5 py-3.5 transition hover:bg-stone-50 lg:grid-cols-[80px_1fr_140px_90px_120px_120px] lg:gap-4 dark:hover:bg-stone-800/50">
            <span class="font-semibold text-stone-800 dark:text-stone-100">#{{ o.id }}</span>
            <span class="truncate text-sm text-stone-600 dark:text-stone-300">{{ data.clientById(o.clientId)?.name || '—' }}</span>
            <span class="hidden text-sm text-stone-500 lg:block dark:text-stone-400">{{ date(o.targetDate) }}</span>
            <span class="hidden text-sm text-stone-500 lg:block dark:text-stone-400">{{ data.orderItemCount(o) }}</span>
            <span class="justify-self-start lg:justify-self-auto"><StatusBadge :status="o.status" /></span>
            <span class="text-right text-sm font-semibold text-stone-800 dark:text-stone-100">{{ money(data.orderTotal(o)) }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
    <EmptyState v-else icon="🧾" :title="t('orders.empty')" />

    <!-- New order -->
    <BaseModal v-model="modalOpen" :title="t('orders.createTitle')">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="sm-label">{{ t('orders.client') }}</label>
            <select v-model="form.clientId" class="sm-field">
              <option v-for="c in data.clients" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div>
            <label class="sm-label">{{ t('common.status') }}</label>
            <select v-model="form.status" class="sm-field">
              <option v-for="s in ORDER_STATUSES" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="sm-label">{{ t('orders.targetDate') }}</label>
          <input v-model="form.targetDate" type="datetime-local" :min="minDate" class="sm-field" />
        </div>
        <div>
          <label class="sm-label">{{ t('builder.address') }}</label>
          <textarea v-model="form.address" rows="2" class="sm-field resize-none" :placeholder="t('builder.addressPlaceholder')" />
        </div>

        <!-- items -->
        <div>
          <label class="sm-label">{{ t('orders.orderItems') }}</label>
          <div class="flex gap-2">
            <select v-model="picker" class="sm-field">
              <option value="">{{ t('orders.selectProduct') }}</option>
              <option v-for="p in data.products" :key="p.id" :value="p.id">{{ localized(p.name, locale) }}</option>
            </select>
            <BaseButton variant="secondary" @click="addItem">+</BaseButton>
          </div>
          <ul v-if="form.items.length" class="mt-3 space-y-2">
            <li v-for="i in form.items" :key="i.productId" class="flex items-center gap-2 rounded-xl bg-stone-50 px-3 py-2 dark:bg-stone-800">
              <span class="min-w-0 flex-1 truncate text-sm text-stone-700 dark:text-stone-200">{{ localized(data.productById(i.productId)?.name, locale) }}</span>
              <input v-model.number="i.price" type="number" min="0" step="1000" class="sm-field h-8 w-24 px-2 py-1 text-right" :title="t('builder.unitPrice')" />
              <span class="text-stone-300">×</span>
              <input v-model.number="i.quantity" type="number" min="1" class="sm-field h-8 w-14 px-2 py-1 text-center" />
              <button class="text-stone-400 hover:text-red-600" @click="removeItem(i.productId)">✕</button>
            </li>
          </ul>
        </div>

        <div>
          <label class="sm-label">{{ t('checkout.note') }}</label>
          <textarea v-model="form.note" rows="2" class="sm-field resize-none" />
        </div>

        <div>
          <label class="sm-label flex items-center justify-between">
            <span>{{ t('payments.prepay') }}</span>
            <button type="button" class="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400" @click="form.paid = formTotal">{{ t('payments.payFull') }}</button>
          </label>
          <input v-model.number="form.paid" type="number" min="0" step="1000" class="sm-field" placeholder="0" />
          <p class="mt-1 text-xs text-stone-400">{{ t('payments.balance') }}: {{ money(Math.max(0, formTotal - (Number(form.paid) || 0))) }}</p>
        </div>

        <div class="flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3 dark:bg-brand-500/10">
          <span class="font-medium text-stone-700 dark:text-stone-200">{{ t('common.total') }}</span>
          <span class="text-lg font-bold text-brand-600 dark:text-brand-400">{{ money(formTotal) }}</span>
        </div>
      </div>
      <template #footer="{ close }">
        <BaseButton variant="secondary" @click="close">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" @click="save">{{ t('common.save') }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
