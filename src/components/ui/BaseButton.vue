<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses,
      variantClasses,
    ]"
    @click="$emit('click', $event)"
  >
    <LoadingSpinner v-if="loading" class="w-4 h-4" />
    <slot />
  </button>
</template>

<script setup>
import LoadingSpinner from './LoadingSpinner.vue'

defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'danger'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  type: {
    type: String,
    default: 'button',
  },
  loading: Boolean,
  disabled: Boolean,
})

defineEmits(['click'])

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
}

const variantClasses = {
  primary: 'bg-primary text-white hover:bg-primary-dark shadow-soft hover:shadow-medium active:scale-[0.98]',
  secondary: 'bg-card text-text border border-border hover:bg-surface-alt hover:border-primary/30 active:scale-[0.98]',
  ghost: 'text-text-muted hover:bg-surface-alt hover:text-text',
  danger: 'bg-danger text-white hover:bg-danger/90 active:scale-[0.98]',
}
</script>

<script>
export default {
  computed: {
    sizeClasses() {
      const map = {
        sm: 'px-3 py-1.5 text-sm rounded-lg',
        md: 'px-5 py-2.5 text-sm rounded-xl',
        lg: 'px-6 py-3 text-base rounded-xl',
      }
      return map[this.size] || map.md
    },
    variantClasses() {
      const map = {
        primary: 'bg-primary text-white hover:bg-primary-dark shadow-soft hover:shadow-medium active:scale-[0.98]',
        secondary: 'bg-card text-text border border-border hover:bg-surface-alt hover:border-primary/30 active:scale-[0.98]',
        ghost: 'text-text-muted hover:bg-surface-alt hover:text-text',
        danger: 'bg-danger text-white hover:bg-danger/90 active:scale-[0.98]',
      }
      return map[this.variant] || map.primary
    },
  },
}
</script>
