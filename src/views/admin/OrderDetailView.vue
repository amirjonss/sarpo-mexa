<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useDataStore, localized } from '@/stores/data'
import { useFormat } from '@/composables/useFormat'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { useSectionBase } from '@/composables/useSection'
import { ORDER_STATUSES } from '@/stores/seed'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import QtyStepper from '@/components/ui/QtyStepper.vue'
import MoneyInput from '@/components/ui/MoneyInput.vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import ProductThumb from '@/components/store/ProductThumb.vue'
import ProductPickerModal from '@/components/store/ProductPickerModal.vue'
import IconTrash from '@/components/ui/IconTrash.vue'
import IconPencil from '@/components/ui/IconPencil.vue'

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()
const data = useDataStore()
const { money, dateTime, date } = useFormat()
const toast = useToast()
const { confirm } = useConfirm()
const base = useSectionBase()

const order = computed(() => data.orderById(route.params.id))
const client = computed(() => (order.value ? data.clientById(order.value.clientId) : null))
const total = computed(() => (order.value ? data.orderTotal(order.value) : 0))

const pickerOpen = ref(false)
const payAmount = ref(null)

const payStatus = computed(() => (order.value ? data.paymentStatus(order.value) : 'unpaid'))
const payMeta = computed(
  () =>
    ({
      paid: { label: t('payments.statusPaid'), cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
      partial: { label: t('payments.statusPartial'), cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' },
      unpaid: { label: t('payments.statusUnpaid'), cls: 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300' },
    })[payStatus.value],
)
const payProgress = computed(() => {
  if (!order.value) return 0
  const total = data.orderTotal(order.value)
  return total ? Math.min(100, (data.orderPaid(order.value) / total) * 100) : 0
})

function addPayment() {
  const amt = Number(payAmount.value) || 0
  if (amt <= 0) return
  data.addPayment(order.value.id, amt)
  payAmount.value = null
  toast.success(t('payments.added'))
}

const selectedMap = computed(() => {
  const m = {}
  for (const i of order.value?.items || []) m[i.productId] = i.quantity
  return m
})

function changeStatus(e) {
  data.updateOrderStatus(order.value.id, e.target.value)
  toast.success(t('orders.statusUpdated'))
}
function pick(pid) {
  data.addOrderItem(order.value.id, pid, 1)
  toast.success(localized(data.productById(pid)?.name, locale.value))
}

// ---- Edit recipient + delivery details ----
const editing = ref(false)
const edit = reactive({ name: '', phone: '', targetDate: '', returnDate: '', deposit: 0, address: '', note: '' })

function startEdit() {
  edit.name = client.value?.name || ''
  edit.phone = client.value?.phone || ''
  edit.targetDate = order.value.targetDate || ''
  edit.returnDate = order.value.returnDate || ''
  edit.deposit = order.value.deposit || 0
  edit.address = order.value.address || ''
  edit.note = order.value.note || ''
  editing.value = true
}
function saveEdit() {
  if (client.value) {
    data.updateClient(client.value.id, {
      name: edit.name.trim() || client.value.name,
      phone: edit.phone.trim(),
    })
  }
  data.updateOrder(order.value.id, {
    targetDate: edit.targetDate,
    returnDate: edit.returnDate,
    deposit: Number(edit.deposit) || 0,
    address: edit.address.trim(),
    note: edit.note.trim(),
  })
  editing.value = false
  toast.success(t('common.saved'))
}
// Note on condition recorded when the rented set comes back.
const conditionNote = ref('')
watch(order, (o) => { conditionNote.value = o?.conditionNote || '' }, { immediate: true })
function saveCondition() {
  data.updateOrder(order.value.id, { conditionNote: conditionNote.value.trim() })
  toast.success(t('common.saved'))
}
function toggleDeposit(value) {
  data.setDepositRefunded(order.value.id, value)
  toast.success(t('common.saved'))
}
async function removeOrder() {
  if (await confirm(t('common.deleteConfirm', { name: `#${order.value.id}` }))) {
    data.deleteOrder(order.value.id)
    toast.success(t('common.deleted'))
    router.push(`${base.value}/orders`)
  }
}
</script>

<template>
  <div v-if="order" class="mx-auto max-w-7xl px-4 py-6">
    <RouterLink :to="`${base}/orders`" class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200">
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="M15 19l-7-7 7-7" /></svg>
      {{ t('orders.title') }}
    </RouterLink>

    <div class="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold text-stone-800 dark:text-stone-100">{{ t('orders.detailTitle', { id: order.id }) }}</h1>
        <StatusBadge :status="order.status" />
      </div>
      <BaseButton variant="danger" size="sm" @click="removeOrder"><IconTrash /> {{ t('common.delete') }}</BaseButton>
    </div>

    <!-- rental status banner -->
    <div
      v-if="order.returned"
      class="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
    >
      ♻️ {{ t('orders.rentalReturned') }}
    </div>
    <div
      v-else-if="order.status === 'delivered'"
      class="mb-5 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
    >
      ⏳ {{ t('orders.rentalOut') }}
    </div>

    <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
      <!-- Items -->
      <div class="sm-card overflow-hidden">
        <div class="border-b border-stone-200 px-5 py-4 dark:border-stone-800">
          <h2 class="font-semibold text-stone-800 dark:text-stone-100">{{ t('orders.orderItems') }}</h2>
        </div>
        <ul class="divide-y divide-stone-100 dark:divide-stone-800">
          <li v-for="item in order.items" :key="item.id" class="px-5 py-3">
            <div class="flex items-start gap-3">
              <ProductThumb v-if="data.productById(item.productId)" :product="data.productById(item.productId)" rounded="rounded-xl" class="h-12 w-12 shrink-0" />
              <div class="min-w-0 flex-1">
                <div class="line-clamp-2 font-medium text-stone-800 dark:text-stone-100">{{ localized(data.productById(item.productId)?.name, locale) || '—' }}</div>
                <div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span class="text-xs text-stone-400">{{ t('builder.unitPrice') }}</span>
                  <span class="inline-flex items-center gap-1">
                    <MoneyInput
                      :model-value="data.orderItemPrice(item)"
                      class="sm-field h-7 w-24 px-2 py-0.5 text-right text-sm"
                      @update:model-value="data.updateOrderItemPrice(order.id, item.id, $event || 0)"
                    />
                    <span class="text-xs text-stone-400">{{ t('common.currency') }}</span>
                  </span>
                </div>
              </div>
              <button class="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10" @click="data.removeOrderItem(order.id, item.id)">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" d="m6 18 12-12M6 6l12 12" /></svg>
              </button>
            </div>
            <div class="mt-3 flex items-center justify-between gap-3 pl-[3.75rem]">
              <QtyStepper
                :model-value="item.quantity"
                @increment="data.updateOrderItemQty(order.id, item.id, item.quantity + 1)"
                @decrement="data.updateOrderItemQty(order.id, item.id, item.quantity - 1)"
              />
              <span class="text-sm font-semibold text-stone-700 dark:text-stone-200">{{ money(data.orderItemPrice(item) * item.quantity) }}</span>
            </div>
          </li>
        </ul>
        <!-- add item -->
        <div class="border-t border-stone-200 p-4 dark:border-stone-800">
          <BaseButton variant="secondary" block @click="pickerOpen = true">+ {{ t('orders.addItem') }}</BaseButton>
        </div>
        <div class="flex items-center justify-between border-t border-stone-200 px-5 py-4 dark:border-stone-800">
          <span class="font-medium text-stone-700 dark:text-stone-200">{{ t('common.total') }}</span>
          <span class="text-xl font-bold text-brand-600 dark:text-brand-400">{{ money(total) }}</span>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        <div class="sm-card p-5">
          <h2 class="mb-3 font-semibold text-stone-800 dark:text-stone-100">{{ t('orders.changeStatus') }}</h2>
          <select :value="order.status" class="sm-field" @change="changeStatus">
            <option v-for="s in ORDER_STATUSES" :key="s" :value="s">{{ t(`status.${s}`) }}</option>
          </select>
          <p class="mt-2 text-xs text-stone-400">{{ t('orders.rentalHint') }}</p>
        </div>

        <!-- Rental cycle: период, залог, состояние при возврате -->
        <div class="sm-card p-5">
          <h2 class="mb-3 font-semibold text-stone-800 dark:text-stone-100">📅 {{ t('orders.rental') }}</h2>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-stone-500 dark:text-stone-400">{{ t('builder.issueDate') }}</span>
              <span class="font-medium text-stone-700 dark:text-stone-200">{{ dateTime(order.targetDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-500 dark:text-stone-400">{{ t('builder.returnDate') }}</span>
              <span class="font-medium" :class="order.returnDate ? 'text-stone-700 dark:text-stone-200' : 'text-stone-400'">{{ order.returnDate ? dateTime(order.returnDate) : '—' }}</span>
            </div>
          </div>

          <!-- Deposit -->
          <div class="mt-3 border-t border-stone-200 pt-3 dark:border-stone-800">
            <div class="flex items-center justify-between text-sm">
              <span class="text-stone-500 dark:text-stone-400">💰 {{ t('builder.deposit') }}</span>
              <span class="font-semibold text-stone-700 dark:text-stone-200">{{ money(order.deposit || 0) }}</span>
            </div>
            <label
              v-if="(order.deposit || 0) > 0"
              class="mt-2 flex cursor-pointer items-center gap-2 text-sm text-stone-600 dark:text-stone-300"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                :checked="order.depositRefunded"
                @change="toggleDeposit($event.target.checked)"
              />
              {{ t('orders.depositRefunded') }}
            </label>
          </div>

          <!-- Condition on return -->
          <div v-if="order.status === 'delivered' || order.returned" class="mt-3 border-t border-stone-200 pt-3 dark:border-stone-800">
            <label class="sm-label">{{ t('orders.condition') }}</label>
            <textarea v-model="conditionNote" rows="2" class="sm-field resize-none" :placeholder="t('orders.conditionPlaceholder')" @blur="saveCondition" />
          </div>
        </div>

        <!-- Payment -->
        <div class="sm-card p-5">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="font-semibold text-stone-800 dark:text-stone-100">💳 {{ t('payments.title') }}</h2>
            <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="payMeta.cls">{{ payMeta.label }}</span>
          </div>

          <div class="h-2 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
            <div class="h-full rounded-full bg-emerald-500 transition-all" :style="{ width: payProgress + '%' }" />
          </div>

          <div class="mt-3 space-y-1.5 text-sm">
            <div class="flex justify-between">
              <span class="text-stone-500 dark:text-stone-400">{{ t('common.total') }}</span>
              <span class="font-medium text-stone-700 dark:text-stone-200">{{ money(total) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-500 dark:text-stone-400">{{ t('payments.paid') }}</span>
              <span class="font-medium text-emerald-600 dark:text-emerald-400">{{ money(data.orderPaid(order)) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-500 dark:text-stone-400">{{ t('payments.balance') }}</span>
              <span class="font-semibold" :class="data.orderBalance(order) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-stone-700 dark:text-stone-200'">{{ money(Math.max(0, data.orderBalance(order))) }}</span>
            </div>
          </div>

          <!-- history -->
          <ul v-if="order.payments && order.payments.length" class="mt-3 space-y-1.5 border-t border-stone-200 pt-3 dark:border-stone-800">
            <li v-for="p in order.payments" :key="p.id" class="flex items-center justify-between gap-2 text-sm">
              <span class="text-stone-400">{{ date(p.createdAt) }}</span>
              <span class="ml-auto font-medium text-stone-700 dark:text-stone-200">+{{ money(p.amount) }}</span>
              <button class="text-stone-300 hover:text-red-500" :aria-label="t('common.delete')" @click="data.removePayment(order.id, p.id)">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" d="m6 18 12-12M6 6l12 12" /></svg>
              </button>
            </li>
          </ul>

          <!-- add payment -->
          <div v-if="data.orderBalance(order) > 0" class="mt-3 border-t border-stone-200 pt-3 dark:border-stone-800">
            <button type="button" class="mb-1.5 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400" @click="payAmount = data.orderBalance(order)">
              {{ t('payments.fillBalance') }}: {{ money(data.orderBalance(order)) }}
            </button>
            <div class="flex gap-2">
              <MoneyInput v-model="payAmount" class="sm-field" :placeholder="t('payments.amount')" />
              <BaseButton variant="secondary" @click="addPayment">+ {{ t('payments.addPayment') }}</BaseButton>
            </div>
          </div>
        </div>

        <div class="sm-card p-5">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="font-semibold text-stone-800 dark:text-stone-100">👤 {{ t('orders.client') }}</h2>
            <button
              v-if="!editing"
              type="button"
              class="inline-flex items-center gap-1 text-xs font-medium text-stone-400 transition hover:text-brand-600 dark:hover:text-brand-400"
              :title="t('orders.editDelivery')"
              @click="startEdit"
            >
              <IconPencil /> {{ t('common.edit') }}
            </button>
          </div>

          <!-- read mode -->
          <template v-if="!editing">
            <RouterLink v-if="client" :to="`${base}/clients/${client.id}`" class="block rounded-xl p-2 -m-2 transition hover:bg-stone-50 dark:hover:bg-stone-800">
              <div class="font-medium text-brand-600 hover:underline dark:text-brand-400">{{ client.name }}</div>
              <div class="text-sm text-stone-500 dark:text-stone-400">{{ client.phone }}</div>
            </RouterLink>
            <div class="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm dark:border-stone-800">
              <div class="flex justify-between"><span class="text-stone-500 dark:text-stone-400">{{ t('orders.targetDate') }}</span><span class="font-medium text-stone-700 dark:text-stone-200">{{ dateTime(order.targetDate) }}</span></div>
              <div class="flex justify-between"><span class="text-stone-500 dark:text-stone-400">{{ t('common.date') }}</span><span class="font-medium text-stone-700 dark:text-stone-200">{{ date(order.createdAt) }}</span></div>
            </div>
            <div v-if="order.address" class="mt-4 flex gap-2 rounded-xl bg-stone-50 p-3 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              <span class="shrink-0">📍</span>
              <span>{{ order.address }}</span>
            </div>
            <div v-if="order.note" class="mt-4 rounded-xl bg-stone-50 p-3 text-sm text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              💬 {{ order.note }}
            </div>
          </template>

          <!-- edit mode -->
          <div v-else class="space-y-3">
            <div>
              <label class="sm-label">{{ t('builder.name') }}</label>
              <input v-model="edit.name" class="sm-field" :placeholder="t('builder.name')" />
            </div>
            <div>
              <label class="sm-label">{{ t('builder.phone') }}</label>
              <PhoneInput v-model="edit.phone" class="sm-field" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="sm-label">{{ t('builder.issueDate') }}</label>
                <input v-model="edit.targetDate" type="datetime-local" class="sm-field" />
              </div>
              <div>
                <label class="sm-label">{{ t('builder.returnDate') }}</label>
                <input v-model="edit.returnDate" type="datetime-local" :min="edit.targetDate" class="sm-field" />
              </div>
            </div>
            <div>
              <label class="sm-label">{{ t('builder.deposit') }}</label>
              <MoneyInput v-model="edit.deposit" class="sm-field" placeholder="0" />
            </div>
            <div>
              <label class="sm-label">{{ t('builder.address') }}</label>
              <textarea v-model="edit.address" rows="2" class="sm-field resize-none" :placeholder="t('builder.addressPlaceholder')" />
            </div>
            <div>
              <label class="sm-label">{{ t('builder.note') }}</label>
              <textarea v-model="edit.note" rows="2" class="sm-field resize-none" :placeholder="t('builder.notePlaceholder')" />
            </div>
            <div class="flex gap-2 pt-1">
              <BaseButton variant="secondary" size="sm" block @click="editing = false">{{ t('common.cancel') }}</BaseButton>
              <BaseButton variant="primary" size="sm" block @click="saveEdit">{{ t('common.save') }}</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ProductPickerModal v-model="pickerOpen" :selected="selectedMap" @pick="pick" />
  </div>

  <div v-else class="mx-auto max-w-7xl px-4 py-20 text-center text-stone-500">
    404 — {{ t('orders.empty') }}
    <div class="mt-4"><RouterLink :to="`${base}/orders`" class="text-brand-600 hover:underline">{{ t('orders.title') }}</RouterLink></div>
  </div>
</template>
