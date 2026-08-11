import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { compressImage, generateFileName } from '@/utils/imageCompressor'

export const useMemoryStore = defineStore('memories', () => {
  const memories = ref([])
  const loading = ref(false)
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const hasMore = ref(true)
  const page = ref(0)
  const pageSize = 12

  async function fetchMemories(reset = false) {
    if (reset) {
      page.value = 0
      memories.value = []
      hasMore.value = true
    }

    loading.value = true
    const from = page.value * pageSize
    const to = from + pageSize - 1

    const { data, error } = await supabase
      .from('memories')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .order('taken_at', { ascending: false })
      .range(from, to)

    if (data) {
      if (data.length < pageSize) {
        hasMore.value = false
      }
      if (reset) {
        memories.value = data
      } else {
        memories.value.push(...data)
      }
      page.value++
    }

    loading.value = false
    return { data, error }
  }

  async function searchMemories(query) {
    loading.value = true

    const { data, error } = await supabase
      .from('memories')
      .select('*, profiles:user_id(full_name, avatar_url)')
      .or(`caption.ilike.%${query}%,description.ilike.%${query}%`)
      .order('taken_at', { ascending: false })
      .limit(50)

    if (data) {
      memories.value = data
      hasMore.value = false
    }

    loading.value = false
    return { data, error }
  }

  async function addMemory(file, metadata) {
    uploading.value = true
    uploadProgress.value = 0

    try {
      // Step 1: Compress image
      uploadProgress.value = 10
      const compressedFile = await compressImage(file)
      uploadProgress.value = 40

      // Step 2: Upload to Supabase Storage
      const fileName = generateFileName(file.name)
      const filePath = `memories/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('memories-media')
        .upload(filePath, compressedFile)

      if (uploadError) throw uploadError
      uploadProgress.value = 70

      // Step 3: Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('memories-media')
        .getPublicUrl(filePath)

      // Step 4: Insert record in DB
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('memories')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          caption: metadata.caption,
          description: metadata.description,
          taken_at: metadata.taken_at,
        })
        .select('*, profiles:user_id(full_name, avatar_url)')
        .single()

      if (error) throw error
      uploadProgress.value = 100

      // Add to top of list
      memories.value.unshift(data)

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      uploading.value = false
      setTimeout(() => { uploadProgress.value = 0 }, 1000)
    }
  }

  async function deleteMemory(id) {
    const memory = memories.value.find(m => m.id === id)
    if (!memory) return { error: { message: 'Kenangan tidak ditemukan' } }

    // Delete from storage (extract path from URL)
    const urlParts = memory.image_url.split('/memories-media/')
    if (urlParts[1]) {
      await supabase.storage.from('memories-media').remove([urlParts[1]])
    }

    // Delete from DB
    const { error } = await supabase
      .from('memories')
      .delete()
      .eq('id', id)

    if (!error) {
      memories.value = memories.value.filter(m => m.id !== id)
    }

    return { error }
  }

  return {
    memories,
    loading,
    uploading,
    uploadProgress,
    hasMore,
    fetchMemories,
    searchMemories,
    addMemory,
    deleteMemory,
  }
})
