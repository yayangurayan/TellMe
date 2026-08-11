<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-large border min-w-[300px] max-w-sm animate-slide-down"
          :class="toastClasses(toast.type)"
        >
          <span class="text-lg mt-0.5">{{ toastIcon(toast.type) }}</span>
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
          <button
            class="text-current opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
            @click="removeToast(toast.id)"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

function toastClasses(type) {
  const map = {
    success: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
    error: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    warning: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    info: 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200',
  }
  return map[type] || map.info
}

function toastIcon(type) {
  const map = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }
  return map[type] || map.info
}
</script>
