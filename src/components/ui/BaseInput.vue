<template>
  <div class="space-y-1.5">
    <label v-if="label" :for="id" class="block text-sm font-medium text-text">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="[
        'w-full px-4 py-2.5 rounded-xl border bg-card text-text placeholder-text-muted',
        'transition-all duration-200 outline-none',
        'focus:ring-2 focus:ring-primary/30 focus:border-primary',
        error ? 'border-danger focus:ring-danger/30 focus:border-danger' : 'border-border',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" class="text-sm text-danger mt-1">{{ error }}</p>
    <p v-if="hint && !error" class="text-xs text-text-muted mt-1">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  id: String,
  required: Boolean,
  disabled: Boolean,
  error: String,
  hint: String,
})

defineEmits(['update:modelValue'])
</script>
