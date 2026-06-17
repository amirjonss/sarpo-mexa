<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore, localized } from '@/stores/data'
import { useCartStore } from '@/stores/cart'
import { useFormat } from '@/composables/useFormat'
import { useToast } from '@/composables/useToast'
import { useTelegram } from '@/composables/useTelegram'
import { isValidPhone } from '@/composables/usePhone'
import BaseButton from '@/components/ui/BaseButton.vue'
import MoneyInput from '@/components/ui/MoneyInput.vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'
import ProductThumb from '@/components/store/ProductThumb.vue'

const emit = defineEmits(['created'])

const { t, locale } = useI18n()
const data = useDataStore()
const cart = useCartStore()
const { money } = useFormat()
const toast = useToast()
const { haptic } = useTelegram()

const form = reactive({ name: '', phone: '', address: '', targetDate: '', note: '' })
const errors = reactive({ name: false, phone: false, targetDate: false })

// Pick an existing client (fills name + phone) or leave blank to create a new one.
const clientSearch = ref('')
const clientMenuOpen = ref(false)
const selectedClientId = ref(null)

const filteredClients = computed(() => {
  const q = clientSearch.value.trim().toLowerCase()
  const digits = q.replace(/\D/g, '')
  const list = data.clients
  if (!q) return list.slice(0, 50)
  return list
    .filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (digits && c.phone.replace(/\D/g, '').includes(digits)),
    )
    .slice(0, 50)
})

function selectClient(c) {
  selectedClientId.value = c.id
  form.name = c.name
  form.phone = c.phone
  clientSearch.value = ''
  clientMenuOpen.value = false
  errors.name = false
  errors.phone = false
  haptic('light')
}
// Per-product unit price override (discount for this order only).
const prices = reactive({})
const paid = ref(0) // prepayment entered at creation (0 = unpaid, = total = full)

const minDate = computed(() => new Date().toISOString().slice(0, 16))

const lines = computed(() =>
  cart.items
    .map((i) => ({ product: data.productById(i.productId), quantity: i.quantity }))
    .filter((l) => l.product),
)

// Keep an editable price entry for every product in the box (default = base price).
watch(
  () => cart.items.map((i) => i.productId).join(','),
  () => {
    for (const l of lines.value) {
      if (prices[l.product.id] == null) prices[l.product.id] = l.product.price
    }
  },
  { immediate: true },
)

const priceOf = (p) => (prices[p.id] != null ? Number(prices[p.id]) || 0 : p.price)
const total = computed(() => lines.value.reduce((s, l) => s + priceOf(l.product) * l.quantity, 0))

function validate() {
  errors.name = !form.name.trim()
  errors.phone = !isValidPhone(form.phone)
  errors.targetDate = !form.targetDate
  return !errors.name && !errors.phone && !errors.targetDate
}

function submit() {
  if (cart.isEmpty || !validate()) return
  const clientId =
    selectedClientId.value ?? data.findOrCreateClient(form.name.trim(), form.phone.trim())
  const orderId = data.addOrder({
    clientId,
    targetDate: form.targetDate,
    address: form.address.trim(),
    note: form.note.trim(),
    paid: Number(paid.value) || 0,
    items: cart.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: prices[i.productId] != null ? Number(prices[i.productId]) || 0 : undefined,
    })),
  })
  cart.clear()
  for (const k of Object.keys(prices)) delete prices[k]
  form.name = ''
  form.phone = ''
  form.address = ''
  form.targetDate = ''
  form.note = ''
  clientSearch.value = ''
  selectedClientId.value = null
  paid.value = 0
  toast.success(t('builder.created', { id: orderId }))
  haptic('success')
  emit('created', orderId)
}
</script>

<template>
  <div class="flex h-full flex-col">
    <div class="flex items-center justify-between">
      <h2 class="font-semibold text-stone-800 dark:text-stone-100">{{ t('builder.boxTitle') }}</h2>
      <button
        v-if="!cart.isEmpty"
        class="text-xs font-medium text-stone-400 hover:text-red-500"
        @click="cart.clear()"
      >
        {{ t('builder.clear') }}
      </button>
    </div>

    <!-- Items -->
    <ul v-if="!cart.isEmpty" class="mt-3 space-y-2">
      <li v-for="l in lines" :key="l.product.id" class="rounded-xl bg-stone-50 p-2 dark:bg-stone-800/50">
        <div class="flex items-center gap-3">
          <ProductThumb :product="l.product" rounded="rounded-lg" class="h-11 w-11 shrink-0" />
          <div class="min-w-0 flex-1">
            <p class="line-clamp-1 text-sm font-medium text-stone-700 dark:text-stone-200">{{ localized(l.product.name, locale) }}</p>
            <p class="text-xs text-stone-400">{{ t('builder.basePrice') }}: {{ money(l.product.price) }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-1">
            <button class="grid h-7 w-7 place-items-center rounded-lg bg-white text-stone-500 shadow-sm hover:text-brand-600 dark:bg-stone-700 dark:text-stone-300" @click="cart.decrement(l.product.id)">−</button>
            <span class="w-6 text-center text-sm font-semibold tabular-nums">{{ l.quantity }}</span>
            <button class="grid h-7 w-7 place-items-center rounded-lg bg-white text-stone-500 shadow-sm hover:text-brand-600 dark:bg-stone-700 dark:text-stone-300" @click="cart.increment(l.product.id)">+</button>
          </div>
        </div>
        <!-- per-order price override -->
        <div class="mt-2 flex items-center justify-between gap-2 pl-1">
          <label class="text-xs font-medium text-stone-500 dark:text-stone-400">{{ t('builder.unitPrice') }}</label>
          <div class="flex items-center gap-1.5">
            <MoneyInput
              v-model="prices[l.product.id]"
              class="sm-field h-8 w-28 px-2 py-1 text-right text-sm"
              :class="Number(prices[l.product.id]) < l.product.price ? '!border-emerald-400 text-emerald-600 dark:text-emerald-400' : ''"
            />
            <span class="text-xs text-stone-400">{{ t('common.currency') }}</span>
          </div>
        </div>
      </li>
    </ul>

    <!-- Total -->
    <div v-if="!cart.isEmpty" class="mt-4 flex items-center justify-between border-t border-stone-200 pt-3 dark:border-stone-800">
      <span class="text-sm font-medium text-stone-600 dark:text-stone-300">{{ t('common.total') }}</span>
      <span class="text-lg font-bold text-brand-600 dark:text-brand-400">{{ money(total) }}</span>
    </div>

    <!-- Prepayment -->
    <div v-if="!cart.isEmpty" class="mt-3">
      <label class="mb-1 flex items-center justify-between text-sm font-medium text-stone-600 dark:text-stone-300">
        <span>{{ t('payments.prepay') }}</span>
        <button type="button" class="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400" @click="paid = total">{{ t('payments.payFull') }}</button>
      </label>
      <MoneyInput v-model="paid" class="sm-field" placeholder="0" />
      <p class="mt-1 text-xs text-stone-400">{{ t('payments.balance') }}: {{ money(Math.max(0, total - (Number(paid) || 0))) }}</p>
    </div>

    <!-- Recipient + delivery -->
    <form class="mt-5 space-y-3" @submit.prevent="submit">
      <p class="text-xs font-semibold uppercase tracking-wide text-stone-400">{{ t('builder.recipient') }}</p>

      <!-- Name with embedded client-picker icon -->
      <div class="relative">
        <input
          v-model="form.name"
          class="sm-field pr-10"
          :class="errors.name && '!border-red-500'"
          :placeholder="t('builder.name')"
          @input="selectedClientId = null"
        />
        <button
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 grid h-7 w-7 place-items-center rounded-lg transition"
          :class="selectedClientId ? 'text-brand-500 dark:text-brand-400' : 'text-stone-400 hover:bg-stone-100 hover:text-brand-600 dark:hover:bg-stone-700'"
          @click="clientMenuOpen = !clientMenuOpen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a4 4 0 00-5.356-3.712M9 20H4v-2a4 4 0 015.356-3.712M15 7a4 4 0 11-8 0 4 4 0 018 0zm6 3a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <!-- Client dropdown -->
        <div v-if="clientMenuOpen" class="absolute inset-x-0 top-full z-30 mt-1">
          <div class="fixed inset-0 -z-10" @click="clientMenuOpen = false; clientSearch = ''" />
          <div class="rounded-xl border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-800">
            <div class="border-b border-stone-100 p-2 dark:border-stone-700">
              <input
                v-model="clientSearch"
                class="sm-field py-1.5 text-sm"
                :placeholder="t('builder.selectClient')"
                autocomplete="off"
                @click.stop
              />
            </div>
            <ul class="max-h-52 overflow-auto py-1">
              <li
                v-for="c in filteredClients"
                :key="c.id"
                class="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-700/60"
                :class="c.id === selectedClientId ? 'bg-brand-50 dark:bg-brand-500/10' : ''"
                @click="selectClient(c)"
              >
                <span class="truncate font-medium text-stone-700 dark:text-stone-200">{{ c.name }}</span>
                <span class="shrink-0 text-xs text-stone-400">{{ c.phone }}</span>
              </li>
              <li v-if="!filteredClients.length" class="px-3 py-2 text-sm text-stone-400">{{ t('builder.noClients') }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <PhoneInput v-model="form.phone" class="sm-field" :class="errors.phone && '!border-red-500'" @update:model-value="selectedClientId = null" />
      </div>
      <div>
        <textarea v-model="form.address" rows="2" class="sm-field resize-none" :placeholder="t('builder.address')" />
      </div>
      <div>
        <label class="sm-label">{{ t('builder.targetDate') }}</label>
        <input v-model="form.targetDate" type="datetime-local" :min="minDate" class="sm-field" :class="errors.targetDate && '!border-red-500'" />
      </div>
      <div>
        <textarea v-model="form.note" rows="2" class="sm-field resize-none" :placeholder="t('builder.notePlaceholder')" />
      </div>
      <BaseButton type="submit" variant="primary" size="lg" block :disabled="cart.isEmpty">
        {{ t('builder.create') }}
      </BaseButton>
    </form>
  </div>
</template>
