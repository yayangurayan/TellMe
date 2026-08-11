<template>
  <div class="max-w-2xl mx-auto space-y-8 animate-fade-in">
    <h1 class="text-2xl font-bold text-text">Pengaturan ⚙️</h1>

    <!-- Profile Section -->
    <section class="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-text mb-4">Profil</h2>

        <div class="flex flex-col sm:flex-row items-start gap-6">
          <!-- Avatar -->
          <div class="flex flex-col items-center gap-2">
            <div class="relative group">
              <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden shadow-medium">
                <img
                  v-if="authStore.userAvatar"
                  :src="authStore.userAvatar"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-white text-3xl font-bold">
                  {{ authStore.userName?.charAt(0)?.toUpperCase() }}
                </span>
              </div>
              <label class="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera class="w-6 h-6 text-white" />
                <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
              </label>
            </div>
            <p class="text-xs text-text-muted">Klik untuk ubah</p>
          </div>

          <!-- Name -->
          <div class="flex-1 w-full space-y-4">
            <BaseInput
              v-model="displayName"
              label="Nama Tampilan"
              placeholder="Nama kamu"
            />
            <BaseButton :loading="savingProfile" @click="saveProfile">
              Simpan Profil
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Theme Section -->
    <section class="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-text mb-4">Tampilan</h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="font-medium text-text">Mode Gelap</p>
            <p class="text-sm text-text-muted">Ubah tampilan menjadi mode gelap</p>
          </div>
          <button
            @click="toggleTheme"
            :class="[
              'relative w-14 h-7 rounded-full transition-colors duration-300 cursor-pointer',
              isDark ? 'bg-primary' : 'bg-border'
            ]"
          >
            <span
              :class="[
                'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center',
                isDark ? 'translate-x-7.5' : 'translate-x-0.5'
              ]"
            >
              <Moon v-if="isDark" class="w-3.5 h-3.5 text-primary" />
              <Sun v-else class="w-3.5 h-3.5 text-amber-500" />
            </span>
          </button>
        </div>
      </div>
    </section>

    <!-- Account Section -->
    <section class="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
      <div class="p-6">
        <h2 class="text-lg font-semibold text-text mb-4">Akun</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between py-2">
            <span class="text-sm text-text-muted">Email</span>
            <span class="text-sm font-medium text-text">{{ authStore.userEmail }}</span>
          </div>
          <div class="border-t border-border" />
          <BaseButton variant="danger" @click="handleLogout" :loading="loggingOut" class="w-full">
            <LogOut class="w-4 h-4" /> Keluar
          </BaseButton>
        </div>
      </div>
    </section>

    <!-- About -->
    <section class="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
      <div class="p-6 text-center">
        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-3 shadow-soft">
          <span class="text-white font-bold text-xl">T</span>
        </div>
        <h3 class="font-semibold text-text">
          Tell<span class="text-primary">Me</span>
        </h3>
        <p class="text-xs text-text-muted mt-1">Ruang privat untuk kita berdua 💙</p>
        <p class="text-xs text-text-muted mt-2">Versi 1.0.0</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Camera, Moon, Sun, LogOut } from '@lucide/vue'
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/composables/useTheme'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { compressImage } from '@/utils/imageCompressor'

const router = useRouter()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()
const { signOut } = useAuth()
const toast = useToast()

const displayName = ref('')
const savingProfile = ref(false)
const loggingOut = ref(false)

onMounted(() => {
  displayName.value = authStore.profile?.full_name || ''
})

async function saveProfile() {
  savingProfile.value = true
  const { error } = await authStore.updateProfile({ full_name: displayName.value })
  savingProfile.value = false

  if (error) {
    toast.error('Gagal menyimpan profil')
  } else {
    toast.success('Profil berhasil diperbarui!')
  }
}

async function handleAvatarUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const compressed = await compressImage(file)
    const { error } = await authStore.uploadAvatar(compressed)
    if (error) throw error
    toast.success('Foto profil diperbarui!')
  } catch (err) {
    toast.error('Gagal mengupload foto: ' + err.message)
  }
}

async function handleLogout() {
  loggingOut.value = true
  await signOut()
  authStore.reset()
  router.push('/login')
}
</script>
