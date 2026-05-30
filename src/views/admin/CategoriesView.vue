<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore, localized } from '@/stores/data'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconTrash from '@/components/ui/IconTrash.vue'
import IconPencil from '@/components/ui/IconPencil.vue'

const { t, locale } = useI18n()
const data = useDataStore()
const toast = useToast()
const { confirm } = useConfirm()

const modalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ name: '' })

function openCreate() {
  editingId.value = null
  form.name = ''
  modalOpen.value = true
}
function openEdit(c) {
  editingId.value = c.id
  form.name = localized(c.name, locale.value)
  modalOpen.value = true
}
function save() {
  if (!form.name.trim()) return
  if (editingId.value) {
    data.updateCategory(editingId.value, { name: form.name.trim() })
    toast.success(t('common.saved'))
  } else {
    data.addCategory({ name: form.name.trim() })
    toast.success(t('common.created'))
  }
  modalOpen.value = false
}
async function remove(c) {
  if (await confirm(t('common.deleteConfirm', { name: localized(c.name, locale.value) }))) {
    data.deleteCategory(c.id)
    toast.success(t('common.deleted'))
  }
}
</script>

<template>
  <div>
    <PageHeader :title="t('categories.title')" :subtitle="t('categories.subtitle')">
      <template #actions>
        <BaseButton variant="primary" @click="openCreate">+ {{ t('categories.new') }}</BaseButton>
      </template>
    </PageHeader>

    <div v-if="data.categories.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="c in data.categories" :key="c.id" class="sm-card flex items-center justify-between p-4">
        <div>
          <div class="font-semibold text-stone-800 dark:text-stone-100">{{ localized(c.name, locale) }}</div>
          <div class="text-sm text-stone-500 dark:text-stone-400">
            {{ t('categories.productsCount') }}: {{ data.productCountByCategory[c.id] || 0 }}
          </div>
        </div>
        <div class="flex gap-1">
          <BaseButton variant="ghost" size="sm" @click="openEdit(c)" aria-label="edit"><IconPencil /></BaseButton>
          <BaseButton variant="ghost" size="sm" @click="remove(c)" aria-label="delete"><IconTrash /></BaseButton>
        </div>
      </div>
    </div>
    <EmptyState v-else icon="🗂" :title="t('categories.empty')" />

    <BaseModal v-model="modalOpen" :title="editingId ? t('categories.editTitle') : t('categories.createTitle')">
      <label class="sm-label">{{ t('categories.fieldName') }}</label>
      <input v-model="form.name" class="sm-field" @keyup.enter="save" />
      <template #footer="{ close }">
        <BaseButton variant="secondary" @click="close">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" @click="save">{{ t('common.save') }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
