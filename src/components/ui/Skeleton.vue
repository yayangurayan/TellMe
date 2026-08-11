<template>
  <div
    :class="[
      'animate-pulse bg-surface-alt rounded-lg',
      className
    ]"
    :style="{ width, height }"
  ></div>
</template>

<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1rem' },
  className: { type: String, default: '' },
})
</script>
