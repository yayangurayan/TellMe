<template>
  <div class="tiptap-editor">
    <!-- Toolbar -->
    <div
      v-if="editor"
      class="flex items-center gap-1 p-2 border-b border-border bg-surface/50 rounded-t-xl flex-wrap"
    >
      <button
        type="button"
        :class="['p-2 rounded-lg transition-colors cursor-pointer', editor.isActive('bold') ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-alt hover:text-text']"
        @click="editor.chain().focus().toggleBold().run()"
        title="Bold"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
        </svg>
      </button>

      <button
        type="button"
        :class="['p-2 rounded-lg transition-colors cursor-pointer', editor.isActive('italic') ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-alt hover:text-text']"
        @click="editor.chain().focus().toggleItalic().run()"
        title="Italic"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>
        </svg>
      </button>

      <div class="w-px h-6 bg-border mx-1" />

      <button
        type="button"
        :class="['p-2 rounded-lg transition-colors cursor-pointer', editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-alt hover:text-text']"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        title="Heading 2"
      >
        <span class="text-xs font-bold">H2</span>
      </button>

      <button
        type="button"
        :class="['p-2 rounded-lg transition-colors cursor-pointer', editor.isActive('heading', { level: 3 }) ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-surface-alt hover:text-text']"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        title="Heading 3"
      >
        <span class="text-xs font-bold">H3</span>
      </button>

      <div class="w-px h-6 bg-border mx-1" />

      <button
        type="button"
        class="p-2 rounded-lg text-text-muted hover:bg-surface-alt hover:text-text transition-colors cursor-pointer"
        @click="addImage"
        title="Sisipkan Gambar"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>
        </svg>
      </button>
    </div>

    <!-- Editor Content -->
    <div class="border border-border border-t-0 rounded-b-xl bg-card overflow-hidden">
      <EditorContent :editor="editor" />
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileSelected"
    />
  </div>
</template>

<script setup>
import { watch, onBeforeUnmount, ref } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { supabase } from '@/lib/supabase'
import { compressImage, generateFileName } from '@/utils/imageCompressor'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
const { error: showError } = useToast()
const fileInput = ref(null)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: { levels: [2, 3] },
    }),
    ImageExtension.configure({
      inline: false,
      HTMLAttributes: { class: 'rounded-xl max-w-full' },
    }),
    Placeholder.configure({
      placeholder: 'Ceritakan harimu...',
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && val !== editor.value.getHTML()) {
    editor.value.commands.setContent(val, false)
  }
})

function addImage() {
  fileInput.value?.click()
}

async function onFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const compressed = await compressImage(file)
    const fileName = generateFileName(file.name)
    const filePath = `journal-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('memories-media')
      .upload(filePath, compressed)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('memories-media')
      .getPublicUrl(filePath)

    editor.value?.chain().focus().setImage({ src: publicUrl }).run()
  } catch (err) {
    showError('Gagal mengupload gambar: ' + err.message)
  }

  // Reset file input
  event.target.value = ''
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>
