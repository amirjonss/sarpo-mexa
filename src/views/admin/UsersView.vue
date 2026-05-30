<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDataStore } from '@/stores/data'
import { USER_ROLES } from '@/stores/seed'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
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

const roleStyles = {
  admin: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  manager: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  packer: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  courier: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
}

const modalOpen = ref(false)
const editingId = ref(null)
const form = reactive({ username: '', roles: [] })

function openCreate() {
  editingId.value = null
  Object.assign(form, { username: '', roles: [] })
  modalOpen.value = true
}
function openEdit(u) {
  editingId.value = u.id
  Object.assign(form, { username: u.username, roles: [...u.roles] })
  modalOpen.value = true
}
function toggleRole(role) {
  const i = form.roles.indexOf(role)
  if (i === -1) form.roles.push(role)
  else form.roles.splice(i, 1)
}
function save() {
  if (!form.username.trim()) return
  if (editingId.value) {
    data.updateUser(editingId.value, { ...form })
    toast.success(t('common.saved'))
  } else {
    data.addUser({ ...form })
    toast.success(t('common.created'))
  }
  modalOpen.value = false
}
async function remove(u) {
  if (await confirm(t('common.deleteConfirm', { name: u.username }))) {
    data.deleteUser(u.id)
    toast.success(t('common.deleted'))
  }
}
</script>

<template>
  <div>
    <PageHeader :title="t('users.title')" :subtitle="t('users.subtitle')">
      <template #actions>
        <BaseButton variant="primary" @click="openCreate">+ {{ t('users.new') }}</BaseButton>
      </template>
    </PageHeader>

    <div v-if="data.users.length" class="sm-card divide-y divide-stone-100 overflow-hidden dark:divide-stone-800">
      <div v-for="u in data.users" :key="u.id" class="flex items-center gap-3 p-4">
        <div class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-stone-100 text-lg dark:bg-stone-800">👤</div>
        <div class="min-w-0 flex-1">
          <div class="font-semibold text-stone-800 dark:text-stone-100">{{ u.username }}</div>
          <div class="mt-1 flex flex-wrap gap-1.5">
            <span v-for="r in u.roles" :key="r" class="rounded-full px-2 py-0.5 text-xs font-medium" :class="roleStyles[r]">
              {{ t(`users.roles.${r}`) }}
            </span>
            <span v-if="!u.roles.length" class="text-xs text-stone-400">—</span>
          </div>
        </div>
        <BaseButton variant="ghost" size="sm" @click="openEdit(u)" aria-label="edit"><IconPencil /></BaseButton>
        <BaseButton variant="ghost" size="sm" @click="remove(u)" aria-label="delete"><IconTrash /></BaseButton>
      </div>
    </div>
    <EmptyState v-else icon="👤" :title="t('users.empty')" />

    <BaseModal v-model="modalOpen" :title="editingId ? t('users.editTitle') : t('users.createTitle')">
      <div class="space-y-4">
        <div>
          <label class="sm-label">{{ t('users.fieldUsername') }}</label>
          <input v-model="form.username" class="sm-field" />
        </div>
        <div>
          <label class="sm-label">{{ t('users.fieldRole') }}</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="r in USER_ROLES"
              :key="r"
              type="button"
              class="rounded-xl border px-3 py-2 text-sm font-medium transition"
              :class="form.roles.includes(r) ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'border-stone-300 text-stone-600 dark:border-stone-700 dark:text-stone-300'"
              @click="toggleRole(r)"
            >
              {{ t(`users.roles.${r}`) }}
            </button>
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
