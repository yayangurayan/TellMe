<template>
  <div class="space-y-2">
    <label class="block text-sm font-medium text-text">
      Bagaimana perasaanmu hari ini? <span class="text-danger">*</span>
    </label>
    <div class="grid grid-cols-4 gap-2 sm:grid-cols-8">
      <button
        v-for="mood in moods"
        :key="mood.value"
        type="button"
        :class="[
          'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all duration-200 cursor-pointer',
          modelValue === mood.value
            ? 'border-primary bg-primary/10 scale-105 shadow-soft'
            : 'border-border bg-card hover:border-primary/30 hover:bg-surface-alt'
        ]"
        @click="$emit('update:modelValue', mood.value)"
      >
        <span class="text-2xl" :class="modelValue === mood.value ? 'animate-scale-in' : ''">{{ mood.emoji }}</span>
        <span class="text-[10px] font-medium text-text-muted">{{ mood.label }}</span>
      </button>
    </div>
    <p v-if="error" class="text-sm text-danger">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  error: String,
})

defineEmits(['update:modelValue'])

const moods = [
  { value: 'happy', emoji: '😊', label: 'Senang' },
  { value: 'sad', emoji: '😢', label: 'Sedih' },
  { value: 'tired', emoji: '😴', label: 'Lelah' },
  { value: 'love', emoji: '😍', label: 'Cinta' },
  { value: 'angry', emoji: '😤', label: 'Kesal' },
  { value: 'peaceful', emoji: '😌', label: 'Damai' },
  { value: 'sick', emoji: '🤒', label: 'Sakit' },
  { value: 'excited', emoji: '🎉', label: 'Semangat' },
]
</script>
