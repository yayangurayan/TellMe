<template>
  <div class="relative">
    <!-- Timeline Line -->
    <div class="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-accent/30 to-transparent md:left-1/2 md:-translate-x-px" />

    <!-- Timeline Item -->
    <div
      :class="[
        'relative flex items-start gap-4 mb-8 animate-slide-up',
        'md:w-1/2',
        isEven ? 'md:ml-auto md:pl-8' : 'md:pr-8',
      ]"
    >
      <!-- Timeline Dot -->
      <div
        :class="[
          'relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-soft',
          'md:absolute md:left-auto',
          isEven ? 'md:-left-5' : 'md:-right-5',
        ]"
      >
        <span class="text-sm">📸</span>
      </div>

      <!-- Content Card -->
      <div
        class="flex-1 bg-card rounded-2xl border border-border shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden cursor-pointer group"
        @click="$emit('view', memory)"
      >
        <!-- Image -->
        <div class="relative aspect-[4/3] overflow-hidden">
          <img
            :src="memory.image_url"
            :alt="memory.caption"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <!-- Info -->
        <div class="p-4">
          <p class="font-semibold text-text mb-1 line-clamp-1">{{ memory.caption }}</p>
          <p v-if="memory.description" class="text-sm text-text-muted line-clamp-2 mb-3">{{ memory.description }}</p>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                <img
                  v-if="memory.profiles?.avatar_url"
                  :src="memory.profiles.avatar_url"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-white text-[10px] font-semibold">
                  {{ memory.profiles?.full_name?.charAt(0)?.toUpperCase() || '?' }}
                </span>
              </div>
              <span class="text-xs text-text-muted">{{ memory.profiles?.full_name || 'Anonim' }}</span>
            </div>
            <span class="text-xs text-text-muted">{{ formatDate(memory.taken_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/dateFormatter'

const props = defineProps({
  memory: { type: Object, required: true },
  index: { type: Number, default: 0 },
})

defineEmits(['view'])

const isEven = computed(() => props.index % 2 !== 0)
</script>
