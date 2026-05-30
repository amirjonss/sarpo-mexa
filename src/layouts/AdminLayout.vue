<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import ThemeToggle from '@/components/layout/ThemeToggle.vue'
import LangSwitcher from '@/components/layout/LangSwitcher.vue'

const drawerOpen = ref(false)
</script>

<template>
  <div class="flex min-h-screen bg-stone-100 dark:bg-stone-950">
    <!-- Desktop sidebar -->
    <div class="hidden shrink-0 lg:block">
      <div class="sticky top-0 h-screen">
        <AdminSidebar />
      </div>
    </div>

    <!-- Mobile drawer -->
    <Transition name="fade">
      <div v-if="drawerOpen" class="fixed inset-0 z-40 lg:hidden">
        <div class="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" @click="drawerOpen = false" />
        <div class="absolute inset-y-0 left-0"><AdminSidebar mobile @navigate="drawerOpen = false" /></div>
      </div>
    </Transition>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-stone-200 bg-white/85 px-4 backdrop-blur dark:border-stone-800 dark:bg-stone-900/85">
        <button
          class="grid h-9 w-9 place-items-center rounded-xl text-stone-600 hover:bg-stone-100 lg:hidden dark:text-stone-300 dark:hover:bg-stone-800"
          @click="drawerOpen = true"
          aria-label="menu"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div class="ml-auto flex items-center gap-2">
          <LangSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-6">
        <div class="mx-auto max-w-6xl">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </main>
    </div>
  </div>
</template>
