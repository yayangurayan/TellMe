<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="id" class="block text-sm font-medium text-text">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :rows="rows"
      :class="[
        'w-full px-4 py-2.5 rounded-xl border bg-card text-text placeholder-text-muted',
        'transition-all duration-200 outline-none resize-none',
        'focus:ring-2 focus:ring-primary/30 focus:border-primary',
        error ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-border',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String,
  placeholder: String,
  id: String,
  rows: { type: Number, default: 3 },
  required: Boolean,
  disabled: Boolean,
  error: String,
})

defineEmits(['update:modelValue'])
</script>
