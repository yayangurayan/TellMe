<template>
  <div class="bg-card rounded-2xl border border-border shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group">
    <div class="flex items-start gap-4 p-4">
      <!-- Date Badge -->
      <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex flex-col items-center justify-center text-white shadow-soft">
        <span class="text-lg font-bold leading-none">{{ day }}</span>
        <span class="text-[10px] font-medium uppercase">{{ month }}</span>
      </div>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="font-semibold text-text line-clamp-1">{{ event.title }}</h3>
            <p class="text-sm text-text-muted mt-0.5">
              {{ formatTime(event.start_time) }}
              <span v-if="event.end_time"> — {{ formatTime(event.end_time) }}</span>
            </p>
          </div>

          <!-- Countdown Badge -->
          <span
            :class="[
              'flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap',
              isToday ? 'bg-primary/10 text-primary animate-pulse-soft' : isPast ? 'bg-surface-alt text-text-muted' : 'bg-accent/10 text-accent',
            ]"
          >
            {{ countdown }}
          </span>
        </div>

        <p v-if="event.description" class="text-sm text-text-muted mt-2 line-clamp-2">{{ event.description }}</p>

        <!-- Location -->
        <div v-if="event.location" class="flex items-center gap-1.5 mt-2 text-sm text-text-muted">
          <MapPin class="w-3.5 h-3.5 flex-shrink-0" />
          <span class="line-clamp-1">{{ event.location }}</span>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div class="flex items-center gap-2">
            <div class="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
              <img
                v-if="event.profiles?.avatar_url"
                :src="event.profiles.avatar_url"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-white text-[8px] font-semibold">
                {{ event.profiles?.full_name?.charAt(0)?.toUpperCase() || '?' }}
              </span>
            </div>
            <span class="text-xs text-text-muted">{{ event.profiles?.full_name || 'Anonim' }}</span>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              class="p-1.5 rounded-lg hover:bg-surface-alt text-text-muted hover:text-text transition-colors cursor-pointer"
              @click="$emit('edit', event)"
              title="Edit"
            >
              <Pencil class="w-3.5 h-3.5" />
            </button>
            <button
              class="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer"
              @click="$emit('delete', event.id)"
              title="Hapus"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { MapPin, Pencil, Trash2 } from '@lucide/vue'
import { formatTime, getCountdown } from '@/utils/dateFormatter'

const props = defineProps({
  event: { type: Object, required: true },
})

defineEmits(['edit', 'delete'])

const startDate = computed(() => new Date(props.event.start_time))
const day = computed(() => startDate.value.getDate())
const month = computed(() => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  return months[startDate.value.getMonth()]
})
const countdown = computed(() => getCountdown(props.event.start_time))
const isToday = computed(() => countdown.value === 'Hari ini!')
const isPast = computed(() => startDate.value < new Date())
</script>
