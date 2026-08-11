<template>
  <div class="min-h-screen bg-surface">
    <!-- Top Navbar (Glass) -->
    <nav class="fixed top-0 left-0 right-0 z-40 glass border-b border-border/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center gap-2.5 group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-soft group-hover:shadow-glow transition-shadow duration-300">
              <span class="text-white font-bold text-lg">T</span>
            </div>
            <span class="text-xl font-bold text-text hidden sm:block">
              Tell<span class="text-primary">Me</span>
            </span>
          </router-link>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                $route.path === item.path || $route.path.startsWith(item.path + '/')
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:text-text hover:bg-surface-alt'
              ]"
            >
              <component :is="item.icon" class="w-4 h-4" />
              {{ item.label }}
            </router-link>
          </div>

          <!-- Right Side -->
          <div class="flex items-center gap-3">
            <!-- Theme Toggle -->
            <button
              class="p-2 rounded-xl hover:bg-surface-alt text-text-muted hover:text-text transition-all duration-200 cursor-pointer"
              @click="toggleTheme"
            >
              <Moon v-if="!isDark" class="w-5 h-5" />
              <Sun v-else class="w-5 h-5" />
            </button>

            <!-- User Avatar -->
            <router-link
              to="/pengaturan"
              class="flex items-center gap-2.5 pl-3 pr-1 py-1 rounded-xl hover:bg-surface-alt transition-all duration-200"
            >
              <span class="text-sm font-medium text-text hidden sm:block">{{ authStore.userName }}</span>
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                <img
                  v-if="authStore.userAvatar"
                  :src="authStore.userAvatar"
                  :alt="authStore.userName"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-white text-sm font-semibold">
                  {{ authStore.userName?.charAt(0)?.toUpperCase() }}
                </span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="pt-16 pb-20 md:pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </div>
    </main>

    <!-- Mobile Bottom Nav -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-border/50">
      <div class="flex items-center justify-around py-2">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px]',
            $route.path === item.path || $route.path.startsWith(item.path + '/')
              ? 'text-primary'
              : 'text-text-muted'
          ]"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span class="text-[10px] font-medium">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>

    <!-- Toast Container -->
    <Toast />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'
import { useTheme } from '@/composables/useTheme'
import Toast from '@/components/ui/Toast.vue'
import { Home, Image, BookOpen, Calendar, Settings, Moon, Sun } from '@lucide/vue'

const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const navItems = [
  { path: '/', label: 'Beranda', icon: Home },
  { path: '/kenangan', label: 'Kenangan', icon: Image },
  { path: '/jurnal', label: 'Jurnal', icon: BookOpen },
  { path: '/agenda', label: 'Agenda', icon: Calendar },
  { path: '/pengaturan', label: 'Setelan', icon: Settings },
]
</script>
