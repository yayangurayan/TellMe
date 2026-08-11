<template>
  <div class="space-y-1 relative group">
    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        v-bind="$attrs"
        placeholder=" "
        :disabled="disabled"
        :class="[
          'peer w-full px-4 pt-5 pb-2 rounded-xl border bg-card text-text transition-all duration-200 outline-none text-sm',
          error 
            ? 'border-danger focus:ring-2 focus:ring-danger/20' 
            : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-primary/50',
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        ]"
      />
      <label
        :for="id"
        :class="[
          'absolute left-4 top-1/2 -translate-y-1/2 text-text-muted transition-all duration-200 pointer-events-none text-sm',
          'peer-focus:top-3 peer-focus:text-xs peer-focus:text-primary',
          'peer-not-placeholder-shown:top-3 peer-not-placeholder-shown:text-xs'
        ]"
      >
        {{ label }} <span v-if="required" class="text-danger">*</span>
      </label>
    </div>
    <p v-if="error" class="text-xs text-danger">{{ error }}</p>
    <p v-if="hint && !error" class="text-xs text-text-muted">{{ hint }}</p>
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
