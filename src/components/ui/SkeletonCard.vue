<template>
  <div class="bg-card rounded-2xl border border-border overflow-hidden">
    <!-- Image/Header placeholder -->
    <div v-if="withImage" class="aspect-video bg-surface-alt animate-pulse w-full"></div>
    <div v-else class="p-5 pb-0 flex items-center justify-between">
      <Skeleton width="3rem" height="3rem" className="rounded-full" />
      <Skeleton width="4rem" height="1rem" />
    </div>

    <div class="p-4 space-y-3">
      <!-- Title -->
      <Skeleton width="70%" height="1.25rem" />
      <!-- Content lines -->
      <div class="space-y-2">
        <Skeleton width="100%" height="0.875rem" />
        <Skeleton width="85%" height="0.875rem" />
      </div>
      <!-- Footer -->
      <div class="flex items-center gap-2 pt-3 border-t border-border/50">
        <Skeleton width="1.5rem" height="1.5rem" className="rounded-full" />
        <Skeleton width="5rem" height="0.75rem" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from './Skeleton.vue'

defineProps({
  withImage: { type: Boolean, default: false }
})
</script>
