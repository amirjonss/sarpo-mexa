<script setup>
import { RouterView } from 'vue-router'
import StoreHeader from '@/components/layout/StoreHeader.vue'
import StoreFooter from '@/components/layout/StoreFooter.vue'
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <StoreHeader />
    <main class="flex-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    <StoreFooter />
  </div>
</template>
