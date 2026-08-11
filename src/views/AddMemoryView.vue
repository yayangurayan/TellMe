<template>
  <div class="max-w-2xl mx-auto space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button
        class="p-2 rounded-xl hover:bg-surface-alt text-text-muted hover:text-text transition-colors cursor-pointer"
        @click="$router.back()"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-text">Tambah Kenangan 📸</h1>
        <p class="text-text-muted text-sm">Upload foto momen spesial</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Image Upload -->
      <div
        :class="[
          'relative border-2 border-dashed rounded-2xl transition-all duration-200 overflow-hidden',
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          preview ? 'aspect-auto' : 'aspect-video',
        ]"
        @dragover.prevent="dragOver = true"
        @dragleave="dragOver = false"
        @drop.prevent="handleDrop"
      >
        <!-- Preview -->
        <div v-if="preview" class="relative">
          <img :src="preview" alt="Preview" class="w-full rounded-2xl" />
          <button
            type="button"
            class="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
            @click="clearImage"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <!-- Compression Info -->
          <div v-if="compressionInfo" class="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-black/50 text-white text-xs">
            {{ compressionInfo }}
          </div>
        </div>

        <!-- Upload Area -->
        <label v-else class="flex flex-col items-center justify-center h-full cursor-pointer p-8">
          <Upload class="w-10 h-10 text-text-muted mb-3" />
          <p class="text-sm font-medium text-text">
            Klik atau seret foto ke sini
          </p>
          <p class="text-xs text-text-muted mt-1">Akan dikompres otomatis (maks 1MB)</p>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleFileSelect"
          />
        </label>
      </div>

      <!-- Form Fields -->
      <BaseInput
        v-model="caption"
        label="Judul / Caption"
        placeholder="Kencan pertama kita 💕"
        required
        :error="errors.caption"
      />

      <BaseTextarea
        v-model="description"
        label="Deskripsi (opsional)"
        placeholder="Ceritakan lebih detail tentang momen ini..."
        :rows="3"
      />

      <BaseInput
        v-model="takenAt"
        label="Tanggal Foto"
        type="date"
        required
        :error="errors.takenAt"
      />

      <!-- Upload Progress -->
      <div v-if="memoryStore.uploading" class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-text-muted">Mengupload...</span>
          <span class="font-medium text-primary">{{ memoryStore.uploadProgress }}%</span>
        </div>
        <div class="w-full h-2 bg-surface-alt rounded-full overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
            :style="{ width: memoryStore.uploadProgress + '%' }"
          />
        </div>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="secondary" @click="$router.back()">Batal</BaseButton>
        <BaseButton type="submit" :loading="memoryStore.uploading" :disabled="!selectedFile">
          Upload Kenangan
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Upload } from '@lucide/vue'
import { useMemoryStore } from '@/stores/memoryStore'
import { useToast } from '@/composables/useToast'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const memoryStore = useMemoryStore()
const toast = useToast()

const selectedFile = ref(null)
const preview = ref(null)
const caption = ref('')
const description = ref('')
const takenAt = ref(new Date().toISOString().split('T')[0])
const dragOver = ref(false)
const compressionInfo = ref('')

const errors = reactive({ caption: '', takenAt: '' })

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (file) processFile(file)
}

function handleDrop(event) {
  dragOver.value = false
  const file = event.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) processFile(file)
}

function processFile(file) {
  selectedFile.value = file
  preview.value = URL.createObjectURL(file)

  const sizeMB = (file.size / 1024 / 1024).toFixed(2)
  compressionInfo.value = `Asli: ${sizeMB}MB — akan dikompres`
}

function clearImage() {
  selectedFile.value = null
  preview.value = null
  compressionInfo.value = ''
}

function validate() {
  let valid = true
  errors.caption = ''
  errors.takenAt = ''

  if (!caption.value.trim()) { errors.caption = 'Caption harus diisi'; valid = false }
  if (!takenAt.value) { errors.takenAt = 'Tanggal harus diisi'; valid = false }
  if (!selectedFile.value) { toast.error('Pilih foto terlebih dahulu'); valid = false }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  const { error } = await memoryStore.addMemory(selectedFile.value, {
    caption: caption.value,
    description: description.value,
    taken_at: takenAt.value,
  })

  if (error) {
    toast.error('Gagal upload: ' + error.message)
  } else {
    toast.success('Kenangan berhasil ditambahkan! 🎉')
    router.push('/kenangan')
  }
}
</script>
