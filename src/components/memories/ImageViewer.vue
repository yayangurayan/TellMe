<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue && images.length"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        @click.self="$emit('update:modelValue', false)"
        @keydown.esc="$emit('update:modelValue', false)"
        @keydown.left="prevImage"
        @keydown.right="nextImage"
        tabindex="0"
        ref="viewer"
      >
        <!-- Close Button -->
        <button
          class="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          @click="$emit('update:modelValue', false)"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Counter -->
        <div v-if="images.length > 1" class="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium">
          {{ currentIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Previous Button -->
        <button
          v-if="images.length > 1"
          class="absolute left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          @click="prevImage"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <!-- Image -->
        <div class="max-w-[90vw] max-h-[85vh] flex items-center justify-center">
          <img
            :src="images[currentIndex]?.image_url || images[currentIndex]"
            :alt="images[currentIndex]?.caption || 'Foto'"
            class="max-w-full max-h-[85vh] object-contain rounded-lg animate-scale-in"
          />
        </div>

        <!-- Next Button -->
        <button
          v-if="images.length > 1"
          class="absolute right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          @click="nextImage"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Caption -->
        <div v-if="currentCaption" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-xl bg-black/50 text-white text-sm max-w-md text-center">
          {{ currentCaption }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  images: { type: Array, default: () => [] },
  startIndex: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue'])
const viewer = ref(null)
const currentIndex = ref(0)

watch(() => props.startIndex, (val) => { currentIndex.value = val })
watch(() => props.modelValue, async (val) => {
  if (val) {
    currentIndex.value = props.startIndex
    await nextTick()
    viewer.value?.focus()
  }
})

const currentCaption = computed(() => {
  const img = props.images[currentIndex.value]
  return img?.caption || ''
})

function prevImage() {
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
}

function nextImage() {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}
</script>
