<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore, localized } from '@/stores/data'
import { useFormat } from '@/composables/useFormat'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/ui/PageHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import ProductThumb from '@/components/store/ProductThumb.vue'
import IconTrash from '@/components/ui/IconTrash.vue'

const { t, locale } = useI18n()
const data = useDataStore()
const { money } = useFormat()
const toast = useToast()
const { confirm } = useConfirm()

const search = ref('')
const modalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', price: '', categoryId: '', image: '', quantity: 0 })
const newCategory = ref('')

function addCategoryInline() {
  const name = newCategory.value.trim()
  if (!name) return
  form.categoryId = data.addCategory({ name })
  newCategory.value = ''
  toast.success(t('common.created'))
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return data.products.filter((p) => !q || localized(p.name, locale.value).toLowerCase().includes(q))
})

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', price: '', categoryId: data.categories[0]?.id ?? '', image: '', quantity: 0 })
  newCategory.value = ''
  modalOpen.value = true
}
function openEdit(p) {
  editingId.value = p.id
  newCategory.value = ''
  Object.assign(form, {
    name: localized(p.name, locale.value),
    price: p.price,
    categoryId: p.categoryId ?? '',
    image: p.image || '',
    quantity: data.stockOf(p.id),
  })
  modalOpen.value = true
}
function onFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    form.image = reader.result
  }
  reader.readAsDataURL(file)
  e.target.value = ''
}
function save() {
  if (!form.name.trim()) return
  // Pending inline category that wasn't confirmed yet — create it on save.
  if (form.categoryId === '__new') addCategoryInline()
  if (editingId.value) {
    data.updateProduct(editingId.value, form)
    data.setStock(editingId.value, form.quantity)
    toast.success(t('common.saved'))
  } else {
    data.addProduct(form)
    toast.success(t('common.created'))
  }
  modalOpen.value = false
}
async function remove(p) {
  if (await confirm(t('common.deleteConfirm', { name: localized(p.name, locale.value) }))) {
    data.deleteProduct(p.id)
    toast.success(t('common.deleted'))
  }
}
</script>

<template>
  <div>
    <PageHeader :title="t('products.title')" :subtitle="t('products.subtitle')">
      <template #actions>
        <BaseButton variant="primary" @click="openCreate">+ {{ t('products.new') }}</BaseButton>
      </template>
    </PageHeader>

    <div class="relative mb-4">
      <svg class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /></svg>
      <input v-model="search" :placeholder="t('common.search')" class="sm-field pl-11" />
    </div>

    <div v-if="filtered.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      <div v-for="p in filtered" :key="p.id" class="sm-card flex flex-col overflow-hidden">
        <div class="relative">
          <ProductThumb :product="p" rounded="rounded-none" class="aspect-[4/3]" />
          <span
            class="absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium shadow-sm backdrop-blur"
            :class="data.stockOf(p.id) === 0
              ? 'bg-red-500/90 text-white'
              : data.stockOf(p.id) <= 5
                ? 'bg-amber-400/90 text-amber-950'
                : 'bg-white/85 text-stone-600 dark:bg-stone-900/85 dark:text-stone-200'"
          >
            {{ t('inventory.quantity') }}: {{ data.stockOf(p.id) }}
          </span>
        </div>
        <div class="flex flex-1 flex-col p-4">
          <span class="text-xs font-medium text-brand-600 dark:text-brand-400">{{ data.categoryName(p.categoryId, locale) }}</span>
          <span class="mt-0.5 line-clamp-1 font-semibold text-stone-800 dark:text-stone-100">{{ localized(p.name, locale) }}</span>
          <div class="mt-1">
            <span class="font-bold text-stone-700 dark:text-stone-200">{{ money(p.price) }}</span>
          </div>
          <div class="mt-3 flex gap-2">
            <BaseButton variant="secondary" size="sm" block @click="openEdit(p)">{{ t('common.edit') }}</BaseButton>
            <BaseButton variant="ghost" size="sm" @click="remove(p)" aria-label="delete"><IconTrash /></BaseButton>
          </div>
        </div>
      </div>
    </div>
    <EmptyState v-else icon="🎁" :title="t('products.empty')" />

    <BaseModal v-model="modalOpen" :title="editingId ? t('products.editTitle') : t('products.createTitle')">
      <div class="space-y-4">
        <div class="flex gap-3">
          <div class="shrink-0">
            <label class="sm-label">{{ t('products.fieldImage') }}</label>
            <div class="relative h-20 w-20">
              <div class="grid h-20 w-20 place-items-center overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50 dark:border-stone-600 dark:bg-stone-800">
                <img v-if="form.image" :src="form.image" alt="" class="h-full w-full object-contain p-1" />
                <svg v-else class="h-7 w-7 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16l5-5 4 4 3-3 6 6M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm6 2a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>
              </div>
              <input type="file" accept="image/*" class="absolute inset-0 cursor-pointer opacity-0" :title="t('products.uploadImage')" @change="onFile" />
            </div>
            <button v-if="form.image" type="button" class="mt-1 block text-xs text-stone-400 hover:text-red-500" @click="form.image = ''">{{ t('common.delete') }}</button>
          </div>
          <div class="flex-1">
            <label class="sm-label">{{ t('products.fieldName') }}</label>
            <input v-model="form.name" class="sm-field" />
            <p class="mt-1.5 text-xs text-stone-400">{{ t('products.uploadImage') }}</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="sm-label">{{ t('products.fieldPrice') }}</label>
            <input v-model="form.price" type="number" min="0" class="sm-field" />
          </div>
          <div>
            <label class="sm-label">{{ t('inventory.quantity') }}</label>
            <input v-model="form.quantity" type="number" min="0" class="sm-field" />
          </div>
        </div>
        <div>
          <label class="sm-label">{{ t('products.fieldCategory') }}</label>
          <select v-model="form.categoryId" class="sm-field">
            <option v-for="c in data.categories" :key="c.id" :value="c.id">{{ localized(c.name, locale) }}</option>
            <option value="__new">+ {{ t('categories.new') }}</option>
          </select>
          <div v-if="form.categoryId === '__new'" class="mt-2 flex gap-2">
            <input
              v-model="newCategory"
              class="sm-field"
              :placeholder="t('categories.fieldName')"
              @keydown.enter.prevent="addCategoryInline"
            />
            <BaseButton variant="secondary" @click="addCategoryInline">{{ t('common.add') }}</BaseButton>
          </div>
        </div>
      </div>
      <template #footer="{ close }">
        <BaseButton variant="secondary" @click="close">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" @click="save">{{ t('common.save') }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
