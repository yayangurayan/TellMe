<template>
  <div class="flex items-center gap-2">
    <button
      v-for="reaction in reactionTypes"
      :key="reaction.type"
      type="button"
      :class="[
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer',
        hasUserReacted(reaction.type)
          ? 'border-primary bg-primary/10 scale-105'
          : 'border-border bg-card hover:border-primary/30 hover:bg-surface-alt'
      ]"
      @click="handleReaction(reaction.type)"
    >
      <span class="text-base">{{ reaction.emoji }}</span>
      <span v-if="getReactionCount(reaction.type) > 0" class="text-xs font-semibold text-text-muted">
        {{ getReactionCount(reaction.type) }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  reactions: { type: Array, default: () => [] },
  entryId: { type: String, required: true },
})

const emit = defineEmits(['react'])
const authStore = useAuthStore()

const reactionTypes = [
  { type: '❤️', emoji: '❤️' },
  { type: '🤗', emoji: '🤗' },
  { type: '😂', emoji: '😂' },
  { type: '😢', emoji: '😢' },
]

function getReactionCount(type) {
  return props.reactions.filter(r => r.reaction_type === type).length
}

function hasUserReacted(type) {
  return props.reactions.some(
    r => r.reaction_type === type && r.user_id === authStore.user?.id
  )
}

function handleReaction(type) {
  emit('react', { entryId: props.entryId, reactionType: type })
}
</script>
