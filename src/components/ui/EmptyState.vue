<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="w-20 h-20 mb-4 rounded-full bg-surface-alt flex items-center justify-center">
      <span class="text-3xl">{{ icon }}</span>
    </div>
    <h3 class="text-lg font-semibold text-text mb-1">{{ title }}</h3>
    <p class="text-sm text-text-muted max-w-sm">{{ message }}</p>
    <slot name="action" />
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, default: 'Belum ada data' },
  message: { type: String, default: 'Data yang kamu cari belum tersedia.' },
})
</script>
