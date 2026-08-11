<template>
  <div
    :class="[
      'rounded-2xl border border-border transition-all duration-300',
      glass ? 'glass bg-card/80 backdrop-blur-xl' : 'bg-card',
      hoverable ? 'hover:shadow-medium hover:-translate-y-0.5 cursor-pointer' : 'shadow-soft',
      padding ? 'p-5' : '',
      className,
    ]"
  >
    <slot />
  </div>
</template>

<script setup>
defineProps({
  hoverable: { type: Boolean, default: false },
  padding: { type: Boolean, default: true },
  glass: { type: Boolean, default: false },
  className: { type: String, default: '' },
})
</script>
