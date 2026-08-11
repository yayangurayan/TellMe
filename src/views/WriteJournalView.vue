<template>
  <div class="max-w-3xl mx-auto space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <button
        class="p-2 rounded-xl hover:bg-surface-alt text-text-muted hover:text-text transition-colors cursor-pointer"
        @click="$router.back()"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-2xl font-bold text-text">Tulis Jurnal ✍️</h1>
        <p class="text-text-muted text-sm">Ungkapkan perasaan dan ceritamu hari ini</p>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Title -->
      <BaseInput
        v-model="title"
        label="Judul Jurnal"
        placeholder="Hari yang indah bersama..."
        required
        :error="errors.title"
      />

      <!-- Mood Selector -->
      <MoodSelector
        v-model="mood"
        :error="errors.mood"
      />

      <!-- TipTap Editor -->
      <div class="space-y-1.5">
        <label class="block text-sm font-medium text-text">Isi Jurnal <span class="text-danger">*</span></label>
        <TiptapEditor v-model="content" />
        <p v-if="errors.content" class="text-sm text-danger">{{ errors.content }}</p>
      </div>

      <!-- Submit -->
      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="secondary" @click="$router.back()">Batal</BaseButton>
        <BaseButton type="submit" :loading="submitting">
          Publikasikan
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'
import { useJournalStore } from '@/stores/journalStore'
import { useToast } from '@/composables/useToast'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TiptapEditor from '@/components/journal/TiptapEditor.vue'
import MoodSelector from '@/components/journal/MoodSelector.vue'

const router = useRouter()
const journalStore = useJournalStore()
const toast = useToast()

const title = ref('')
const content = ref('')
const mood = ref('')
const submitting = ref(false)
const errors = reactive({ title: '', mood: '', content: '' })

function validate() {
  let valid = true
  errors.title = ''; errors.mood = ''; errors.content = ''

  if (!title.value.trim()) { errors.title = 'Judul harus diisi'; valid = false }
  if (!mood.value) { errors.mood = 'Pilih mood kamu hari ini'; valid = false }
  if (!content.value || content.value === '<p></p>') { errors.content = 'Isi jurnal tidak boleh kosong'; valid = false }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  submitting.value = true

  const { data, error } = await journalStore.createEntry({
    title: title.value,
    content: content.value,
    mood: mood.value,
  })

  submitting.value = false

  if (error) {
    toast.error('Gagal menyimpan jurnal: ' + error.message)
  } else {
    toast.success('Jurnal berhasil dipublikasikan! 📝')
    router.push(`/jurnal/${data.id}`)
  }
}
</script>
