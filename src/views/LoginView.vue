<template>
  <div class="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden px-4">
    <!-- Animated Background -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 animate-float" />
      <div class="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-accent/5 animate-float" style="animation-delay: -3s;" />
      <div class="absolute top-1/3 left-1/4 w-40 h-40 rounded-full bg-primary/3 animate-float" style="animation-delay: -1.5s;" />
    </div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-md animate-slide-up">
      <div class="bg-card rounded-3xl border border-border shadow-large p-8 sm:p-10">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow mb-4">
            <span class="text-white font-bold text-3xl">T</span>
          </div>
          <h1 class="text-2xl font-bold text-text">
            Tell<span class="text-primary">Me</span>
          </h1>
          <p class="text-sm text-text-muted mt-1">Ruang privat untuk kita berdua 💙</p>
        </div>

        <!-- Error Alert -->
        <div
          v-if="errorMessage"
          class="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm flex items-start gap-2 animate-scale-in"
        >
          <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {{ errorMessage }}
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <BaseInput
            v-model="email"
            label="Email"
            type="email"
            placeholder="email@contoh.com"
            id="login-email"
            required
          />

          <BaseInput
            v-model="password"
            label="Kata Sandi"
            type="password"
            placeholder="••••••••"
            id="login-password"
            required
          />

          <BaseButton
            type="submit"
            :loading="loading"
            class="w-full mt-2"
            size="lg"
          >
            Masuk
          </BaseButton>
        </form>

        <p class="text-center text-xs text-text-muted mt-6">
          Hanya untuk kita berdua. Tidak bisa mendaftar secara publik.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/authStore'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const { signIn } = useAuth()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  loading.value = true
  errorMessage.value = ''

  const { data, error } = await signIn(email.value, password.value)

  if (error) {
    errorMessage.value = error.message === 'Invalid login credentials'
      ? 'Email atau kata sandi salah.'
      : error.message
    loading.value = false
    return
  }

  // Re-init the auth store
  await authStore.initialize()

  router.push({ name: 'dashboard' })
  loading.value = false
}
</script>
