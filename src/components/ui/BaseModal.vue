<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="closeable && $emit('update:modelValue', false)"
        @keydown.esc="closeable && $emit('update:modelValue', false)"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />

        <!-- Modal Content -->
        <div
          class="modal-content relative w-full bg-card rounded-2xl shadow-large border border-border overflow-hidden transition-all duration-300"
          :class="sizeClass"
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="flex items-center justify-between px-6 py-4 border-b border-border">
            <slot name="header">
              <h3 class="text-lg font-semibold text-text">{{ title }}</h3>
            </slot>
            <button
              v-if="closeable"
              class="p-1.5 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text transition-colors cursor-pointer"
              @click="$emit('update:modelValue', false)"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 overflow-y-auto max-h-[70vh]">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-border bg-surface/50">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  title: String,
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'xl'].includes(v),
  },
  closeable: {
    type: Boolean,
    default: true,
  },
})

defineEmits(['update:modelValue'])

const sizeClass = computed(() => {
  const map = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
  return map[props.size] || map.md
})
</script>
