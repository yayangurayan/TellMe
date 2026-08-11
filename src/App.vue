<template>
  <div v-if="!authStore.loading">
    <DefaultLayout v-if="authStore.isAuthenticated && route.name !== 'login'" />
    <router-view v-else />
  </div>
  <div v-else class="min-h-screen flex items-center justify-center bg-surface">
    <div class="flex flex-col items-center gap-4 animate-fade-in">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow animate-pulse-soft">
        <span class="text-white font-bold text-2xl">T</span>
      </div>
      <p class="text-text-muted text-sm">Memuat TellMe...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/composables/useTheme'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const authStore = useAuthStore()
const { initTheme } = useTheme()
const route = useRoute()

onMounted(async () => {
  initTheme()
  await authStore.initialize()
})
</script>
