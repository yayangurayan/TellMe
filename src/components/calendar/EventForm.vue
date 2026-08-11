<template>
  <BaseModal :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" :title="isEdit ? 'Edit Agenda' : 'Agenda Baru'" size="md">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseInput
        v-model="form.title"
        label="Judul"
        placeholder="Makan malam berdua 🍕"
        required
        :error="errors.title"
      />

      <BaseTextarea
        v-model="form.description"
        label="Deskripsi"
        placeholder="Detail tentang acara ini..."
        :rows="3"
      />

      <BaseInput
        v-model="form.location"
        label="Lokasi"
        placeholder="Cafe Kopi Kenangan, Jakarta"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseInput
          v-model="form.start_time"
          label="Mulai"
          type="datetime-local"
          required
          :error="errors.start_time"
        />
        <BaseInput
          v-model="form.end_time"
          label="Selesai"
          type="datetime-local"
          :error="errors.end_time"
        />
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">
          Batal
        </BaseButton>
        <BaseButton type="submit" :loading="submitting">
          {{ isEdit ? 'Simpan' : 'Tambah Agenda' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useEventStore } from '@/stores/eventStore'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  modelValue: Boolean,
  event: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const eventStore = useEventStore()
const toast = useToast()
const submitting = ref(false)
const isEdit = ref(false)

const form = reactive({
  title: '',
  description: '',
  location: '',
  start_time: '',
  end_time: '',
})

const errors = reactive({
  title: '',
  start_time: '',
  end_time: '',
})

watch(() => props.event, (event) => {
  if (event) {
    isEdit.value = true
    form.title = event.title || ''
    form.description = event.description || ''
    form.location = event.location || ''
    form.start_time = event.start_time ? new Date(event.start_time).toISOString().slice(0, 16) : ''
    form.end_time = event.end_time ? new Date(event.end_time).toISOString().slice(0, 16) : ''
  } else {
    isEdit.value = false
    Object.assign(form, { title: '', description: '', location: '', start_time: '', end_time: '' })
  }
}, { immediate: true })

function validate() {
  let valid = true
  errors.title = ''
  errors.start_time = ''
  errors.end_time = ''

  if (!form.title.trim()) {
    errors.title = 'Judul harus diisi'
    valid = false
  }
  if (!form.start_time) {
    errors.start_time = 'Waktu mulai harus diisi'
    valid = false
  }
  if (form.end_time && form.start_time && new Date(form.end_time) <= new Date(form.start_time)) {
    errors.end_time = 'Waktu selesai harus setelah waktu mulai'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  submitting.value = true

  try {
    if (isEdit.value && props.event) {
      const { error } = await eventStore.updateEvent(props.event.id, { ...form })
      if (error) throw error
      toast.success('Agenda berhasil diperbarui!')
    } else {
      const { error } = await eventStore.createEvent({ ...form })
      if (error) throw error
      toast.success('Agenda baru berhasil ditambahkan!')
    }

    emit('saved')
    emit('update:modelValue', false)
  } catch (err) {
    toast.error('Gagal menyimpan agenda: ' + err.message)
  } finally {
    submitting.value = false
  }
}
</script>
