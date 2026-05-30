<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, RouterLink } from 'vue-router'
import { useFormat } from '@/composables/useFormat'
import BaseButton from '@/components/ui/BaseButton.vue'

const { t } = useI18n()
const route = useRoute()
const { dateTime } = useFormat()

const orderId = computed(() => route.query.id || '—')
const targetDate = computed(() => dateTime(route.query.date))
</script>

<template>
  <div class="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center">
    <div class="grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-4xl dark:bg-emerald-500/15">🎉</div>
    <h1 class="mt-6 text-2xl font-bold text-stone-800 dark:text-stone-100">{{ t('checkout.successTitle') }}</h1>
    <p class="mt-2 text-stone-500 dark:text-stone-400">
      {{ t('checkout.successText', { id: orderId, date: targetDate }) }}
    </p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <RouterLink to="/"><BaseButton variant="primary">{{ t('checkout.continueShopping') }}</BaseButton></RouterLink>
      <RouterLink :to="`/orders/${orderId}`"><BaseButton variant="outline">{{ t('checkout.viewInAdmin') }}</BaseButton></RouterLink>
    </div>
  </div>
</template>
