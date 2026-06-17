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
import IconTrash from '@/components/ui/IconTrash.vue'

const { t, locale } = useI18n()
const data = useDataStore()
const { money } = useFormat()
const toast = useToast()
const { confirm } = useConfirm()

const search = ref('')
const modalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', categoryId: '', image: '', items: [] })

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return data.sets.filter((s) => !q || localized(s.name, locale.value).toLowerCase().includes(q))
})

// Live total of the set being edited, from the current form items.
const formTotal = computed(() =>
  form.items.reduce((sum, it) => sum + (data.productById(Number(it.productId))?.price || 0) * (Number(it.quantity) || 0), 0),
)

function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', categoryId: data.categories[0]?.id ?? '', image: '', items: [] })
  modalOpen.value = true
}
function openEdit(s) {
  editingId.value = s.id
  Object.assign(form, {
    name: localized(s.name, locale.value),
    categoryId: s.categoryId ?? '',
    image: s.image || '',
    items: s.items.map((it) => ({ productId: it.productId, quantity: it.quantity })),
  })
  modalOpen.value = true
}
function addItem() {
  const used = new Set(form.items.map((it) => Number(it.productId)))
  const next = data.products.find((p) => !used.has(p.id)) ?? data.products[0]
  if (next) form.items.push({ productId: next.id, quantity: 1 })
}
function removeItem(idx) {
  form.items.splice(idx, 1)
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
  if (!form.name.trim() || !form.items.length) return
  const payload = {
    name: form.name.trim(),
    categoryId: form.categoryId,
    image: form.image,
    items: form.items.filter((it) => it.productId && Number(it.quantity) > 0),
  }
  if (!payload.items.length) return
  if (editingId.value) {
    data.updateSet(editingId.value, payload)
    toast.success(t('common.saved'))
  } else {
    data.addSet(payload)
    toast.success(t('common.created'))
  }
  modalOpen.value = false
}
async function remove(s) {
  if (await confirm(t('common.deleteConfirm', { name: localized(s.name, locale.value) }))) {
    data.deleteSet(s.id)
    toast.success(t('common.deleted'))
  }
}
</script>

<template>
  <div>
    <PageHeader :title="t('sets.title')" :subtitle="t('sets.subtitle')">
      <template #actions>
        <BaseButton variant="primary" @click="openCreate">+ {{ t('sets.new') }}</BaseButton>
      </template>
    </PageHeader>

    <div class="relative mb-4">
      <svg class="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" d="m21 21-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" /></svg>
      <input v-model="search" :placeholder="t('common.search')" class="sm-field pl-11" />
    </div>

    <div v-if="filtered.length" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="s in filtered" :key="s.id" class="sm-card flex flex-col overflow-hidden">
        <div class="flex gap-3 p-4">
          <div class="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
            <img v-if="s.image" :src="s.image" alt="" class="h-full w-full object-cover" />
            <span v-else class="text-2xl">🎁</span>
          </div>
          <div class="min-w-0 flex-1">
            <span class="text-xs font-medium text-brand-600 dark:text-brand-400">{{ data.categoryName(s.categoryId, locale) }}</span>
            <p class="mt-0.5 line-clamp-1 font-semibold text-stone-800 dark:text-stone-100">{{ localized(s.name, locale) }}</p>
            <p class="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{{ data.setItemCount(s) }} {{ t('builder.setItems') }}</p>
            <p class="mt-1 font-bold text-stone-700 dark:text-stone-200">{{ money(data.setTotal(s)) }}</p>
          </div>
        </div>

        <ul class="space-y-1 border-t border-stone-100 px-4 py-3 text-sm dark:border-stone-800">
          <li v-for="it in s.items" :key="it.productId" class="flex justify-between gap-2 text-stone-600 dark:text-stone-300">
            <span class="truncate">{{ localized(data.productById(it.productId)?.name, locale) }}</span>
            <span class="shrink-0 tabular-nums text-stone-400">×{{ it.quantity }}</span>
          </li>
        </ul>

        <div class="mt-auto flex items-center justify-between gap-2 px-4 pb-4">
          <span
            class="text-xs font-medium"
            :class="data.setAvailable(s) > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'"
          >
            <template v-if="data.setAvailable(s) > 0">{{ data.setAvailable(s) }} {{ t('builder.setAvailable') }}</template>
            <template v-else>{{ t('builder.setOutOfStock') }}</template>
          </span>
          <div class="flex gap-2">
            <BaseButton variant="secondary" size="sm" @click="openEdit(s)">{{ t('common.edit') }}</BaseButton>
            <BaseButton variant="ghost" size="sm" @click="remove(s)" aria-label="delete"><IconTrash /></BaseButton>
          </div>
        </div>
      </div>
    </div>
    <EmptyState v-else icon="🎁" :title="t('sets.empty')" />

    <BaseModal v-model="modalOpen" :title="editingId ? t('sets.editTitle') : t('sets.createTitle')">
      <div class="space-y-4">
        <div class="flex gap-3">
          <div class="shrink-0">
            <label class="sm-label">{{ t('products.fieldImage') }}</label>
            <div class="relative h-20 w-20">
              <div class="grid h-20 w-20 place-items-center overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50 dark:border-stone-600 dark:bg-stone-800">
                <img v-if="form.image" :src="form.image" alt="" class="h-full w-full object-contain p-1" />
                <svg v-else class="h-7 w-7 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16l5-5 4 4 3-3 6 6M3 7h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm6 2a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>
              </div>
              <input type="file" accept="image/*" class="absolute inset-0 cursor-pointer opacity-0" @change="onFile" />
            </div>
            <button v-if="form.image" type="button" class="mt-1 block text-xs text-stone-400 hover:text-red-500" @click="form.image = ''">{{ t('common.delete') }}</button>
          </div>
          <div class="flex-1">
            <label class="sm-label">{{ t('sets.fieldName') }}</label>
            <input v-model="form.name" class="sm-field" />
            <label class="sm-label mt-3">{{ t('products.fieldCategory') }}</label>
            <select v-model="form.categoryId" class="sm-field">
              <option v-for="c in data.categories" :key="c.id" :value="c.id">{{ localized(c.name, locale) }}</option>
            </select>
          </div>
        </div>

        <div>
          <div class="mb-1.5 flex items-center justify-between">
            <label class="sm-label !mb-0">{{ t('sets.fieldItems') }}</label>
            <button type="button" class="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400" @click="addItem">+ {{ t('common.add') }}</button>
          </div>
          <div v-if="form.items.length" class="space-y-2">
            <div v-for="(it, idx) in form.items" :key="idx" class="flex gap-2">
              <select v-model="it.productId" class="sm-field flex-1">
                <option v-for="p in data.products" :key="p.id" :value="p.id">{{ localized(p.name, locale) }}</option>
              </select>
              <input v-model.number="it.quantity" type="number" min="1" class="sm-field w-20 shrink-0 text-center" />
              <BaseButton variant="ghost" size="sm" @click="removeItem(idx)" aria-label="remove-item"><IconTrash /></BaseButton>
            </div>
          </div>
          <p v-else class="rounded-lg border border-dashed border-stone-300 py-4 text-center text-xs text-stone-400 dark:border-stone-700">{{ t('sets.noItems') }}</p>
          <div v-if="form.items.length" class="mt-2 flex justify-between text-sm font-semibold text-stone-700 dark:text-stone-200">
            <span>{{ t('builder.boxTitle') }}</span>
            <span>{{ money(formTotal) }}</span>
          </div>
        </div>
      </div>
      <template #footer="{ close }">
        <BaseButton variant="secondary" @click="close">{{ t('common.cancel') }}</BaseButton>
        <BaseButton variant="primary" :disabled="!form.name.trim() || !form.items.length" @click="save">{{ t('common.save') }}</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
