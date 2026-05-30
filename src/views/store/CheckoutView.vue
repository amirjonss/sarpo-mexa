<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, RouterLink } from 'vue-router'
import { useDataStore, localized } from '@/stores/data'
import { useCartStore } from '@/stores/cart'
import { useFormat } from '@/composables/useFormat'
import BaseButton from '@/components/ui/BaseButton.vue'
import ProductThumb from '@/components/store/ProductThumb.vue'

const { t, locale } = useI18n()
const router = useRouter()
const data = useDataStore()
const cart = useCartStore()
const { money } = useFormat()

const form = reactive({ name: '', phone: '', address: '', targetDate: '', note: '' })
const errors = reactive({ name: false, phone: false, targetDate: false })

const minDate = computed(() => new Date().toISOString().slice(0, 16))

onMounted(() => {
  if (cart.isEmpty) router.replace('/box')
})

const lines = computed(() =>
  cart.items.map((i) => ({ product: data.productById(i.productId), quantity: i.quantity })).filter((l) => l.product),
)

function validate() {
  errors.name = !form.name.trim()
  errors.phone = !form.phone.trim()
  errors.targetDate = !form.targetDate
  return !errors.name && !errors.phone && !errors.targetDate
}

function submit() {
  if (!validate()) return
  const clientId = data.findOrCreateClient(form.name.trim(), form.phone.trim())
  const orderId = data.addOrder({
    clientId,
    targetDate: form.targetDate,
    address: form.address.trim(),
    note: form.note.trim(),
    items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  })
  cart.clear()
  router.push({ path: '/order-success', query: { id: orderId, date: form.targetDate } })
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <h1 class="text-2xl font-bold tracking-tight text-stone-800 dark:text-stone-100">{{ t('checkout.title') }}</h1>

    <form class="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]" @submit.prevent="submit">
      <div class="space-y-5">
        <!-- Recipient -->
        <div class="sm-card p-5">
          <h2 class="mb-4 font-semibold text-stone-800 dark:text-stone-100">👤 {{ t('checkout.clientSection') }}</h2>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="sm-label">{{ t('checkout.clientName') }}</label>
              <input v-model="form.name" class="sm-field" :class="errors.name && '!border-red-500'" />
              <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ t('common.requiredField') }}</p>
            </div>
            <div>
              <label class="sm-label">{{ t('checkout.clientPhone') }}</label>
              <input v-model="form.phone" class="sm-field" :class="errors.phone && '!border-red-500'" placeholder="+998 ..." />
              <p v-if="errors.phone" class="mt-1 text-xs text-red-500">{{ t('common.requiredField') }}</p>
            </div>
          </div>
        </div>

        <!-- Delivery -->
        <div class="sm-card p-5">
          <h2 class="mb-4 font-semibold text-stone-800 dark:text-stone-100">📅 {{ t('checkout.deliverySection') }}</h2>
          <div class="grid gap-4">
            <div>
              <label class="sm-label">{{ t('builder.address') }}</label>
              <textarea v-model="form.address" rows="2" class="sm-field resize-none" :placeholder="t('builder.addressPlaceholder')" />
            </div>
            <div>
              <label class="sm-label">{{ t('checkout.targetDate') }}</label>
              <input v-model="form.targetDate" type="datetime-local" :min="minDate" class="sm-field" :class="errors.targetDate && '!border-red-500'" />
              <p v-if="errors.targetDate" class="mt-1 text-xs text-red-500">{{ t('common.requiredField') }}</p>
            </div>
            <div>
              <label class="sm-label">{{ t('checkout.note') }} <span class="text-stone-400">({{ t('common.optional') }})</span></label>
              <textarea v-model="form.note" rows="3" class="sm-field resize-none" :placeholder="t('checkout.notePlaceholder')" />
            </div>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="lg:sticky lg:top-20 lg:self-start">
        <div class="sm-card p-5">
          <h2 class="mb-3 font-semibold text-stone-800 dark:text-stone-100">{{ t('checkout.orderSummary') }}</h2>
          <ul class="space-y-2.5">
            <li v-for="l in lines" :key="l.product.id" class="flex items-center justify-between gap-2 text-sm">
              <span class="flex min-w-0 items-center gap-2 text-stone-600 dark:text-stone-300">
                <ProductThumb :product="l.product" rounded="rounded-md" class="h-7 w-7 shrink-0" />
                <span class="line-clamp-1">{{ localized(l.product.name, locale) }}</span>
                <span class="text-stone-400">×{{ l.quantity }}</span>
              </span>
              <span class="shrink-0 font-medium text-stone-700 dark:text-stone-200">{{ money(l.product.price * l.quantity) }}</span>
            </li>
          </ul>
          <div class="mt-4 flex items-center justify-between border-t border-stone-200 pt-3 dark:border-stone-800">
            <span class="font-medium text-stone-700 dark:text-stone-200">{{ t('common.total') }}</span>
            <span class="text-xl font-bold text-brand-600 dark:text-brand-400">{{ money(cart.total) }}</span>
          </div>
          <BaseButton type="submit" variant="primary" size="lg" block class="mt-5">{{ t('checkout.place') }}</BaseButton>
          <RouterLink to="/box" class="mt-3 block text-center text-sm text-stone-500 hover:underline dark:text-stone-400">← {{ t('nav.box') }}</RouterLink>
        </div>
      </div>
    </form>
  </div>
</template>
