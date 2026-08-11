<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
      colorClasses,
    ]"
  >
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  color: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'primary', 'success', 'warning', 'danger', 'info', 'love', 'mood'].includes(v),
  },
})

const colorClasses = computed(() => {
  const map = {
    default: 'bg-surface-alt text-text-muted',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
    love: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    mood: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  }
  return map[props.color] || map.default
})
</script>
