<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useDataStore } from '@/stores/data'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { useSectionBase } from '@/composables/useSection'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconTrash from '@/components/ui/IconTrash.vue'
import IconPencil from '@/components/ui/IconPencil.vue'

const { t } = useI18n()
const data = useDataStore()
const toast = useToast()
const { confirm } = useConfirm()
const base = useSectionBase()

const search = ref('')
const modalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', phone: '' })

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return data.clients.filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q))
})

function initials(name) {
  return name.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}
function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', phone: '' })
  modalOpen.value = true
}
function openEdit(c) {
  editingId.value = c.id
  Object.assign(form, { name: c.name, phone: c.phone })
  modalOpen.value = true
}
function save() {
  if (!form.name.trim()) return
  if (editingId.value) {
    data.updateClient(editingId.value, { ...form })
    toast.success(t('common.saved'))
  } else {
    data.addClient({ ...form })
    toast.success(t('common.created'))
  }
  modalOpen.value = false
}
async function remove(c) {
  if (await confirm(t('common.deleteConfirm', { name: c.name }))) {
    data.deleteClient(c.id)
    toast.success(t('common.deleted'))
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 py-6">
    <PageHeader :title="t('clients.title')" :subtitle="t('clients.subtitle')">
      <template #actions>
        <BaseButton variant="primary" @click="openCreate">+ {{ t('clients.new') }}</BaseButton>
      </template>
    </PageHeader>

    <div class="relative mb-4">
      <svg class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /></svg>
      <input v-model="search" :placeholder="t('common.search')" class="sm-field pl-11" />
    </div>

    <div v-if="filtered.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="c in filtered" :key="c.id" class="sm-card flex items-center gap-3 p-4">
        <RouterLink :to="`${base}/clients/${c.id}`" class="flex min-w-0 flex-1 items-center gap-3">
          <div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{{ initials(c.name) }}</div>
          <div class="min-w-0 flex-1">
            <div class="truncate font-semibold text-stone-800 hover:text-brand-600 dark:text-stone-100 dark:hover:text-brand-400">{{ c.name }}</div>
            <div class="text-sm text-stone-500 dark:text-stone-400">{{ c.phone }}</div>
            <div class="text-xs text-stone-400">{{ t('clients.ordersCount') }}: {{ data.orderCountByClient[c.id] || 0 }}</div>
          </div>
        </RouterLink>
        <div class="flex flex-col gap-1">
          <BaseButton variant="ghost" size="sm" @click="openEdit(c)" aria-label="edit"><IconPencil /></BaseButton>
          <BaseButton variant="ghost" size="sm" @click="remove(c)" aria-label="delete"><IconTrash /></BaseButton>
        </div>
      </div>
    </div>
    <EmptyState v-else icon="👥" :title="t('clients.empty')" />

    <BaseModal v-model="modalOpen" :title="editingId ? t('clients.editTitle') : t('clients.createTitle')">
      <div class="space-y-4">
        <div>
          <label class="sm-label">{{ t('clients.fieldName') }}</label>
          <input v-model="form.name" class="sm-field" />
        </div>
        <div>
          <label class="sm-label">{{ t('clients.fieldPhone') }}</label>
          <input v-model="form.phone" class="sm-field" placeholder="+998 ..." />
        </div>
      </div>
      <template #footer="{ close }">
        <BaseButton variant="secondary" @click="close">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" @click="save">{{ t('common.save') }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
