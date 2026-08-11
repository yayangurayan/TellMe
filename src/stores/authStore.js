import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const session = ref(null)
  const profile = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!session.value && !!user.value)
  const userName = computed(() => profile.value?.full_name || user.value?.email?.split('@')[0] || 'User')
  const userAvatar = computed(() => profile.value?.avatar_url || null)
  const userEmail = computed(() => user.value?.email || '')

  async function initialize() {
    loading.value = true
    const { data } = await supabase.auth.getSession()
    session.value = data.session
    user.value = data.session?.user ?? null

    if (user.value) {
      const { isWhitelisted } = useAuth()
      if (!isWhitelisted(user.value.email)) {
        await supabase.auth.signOut()
        user.value = null
        session.value = null
        loading.value = false
        return
      }
      await fetchProfile()
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
      if (user.value) {
        await fetchProfile()
      } else {
        profile.value = null
      }
    })

    loading.value = false
  }

  async function fetchProfile() {
    if (!user.value) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (data) {
      profile.value = data
    }
  }

  async function updateProfile(updates) {
    if (!user.value) return { error: { message: 'Belum login' } }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.value.id)
      .select()
      .single()

    if (data) {
      profile.value = data
    }

    return { data, error }
  }

  async function uploadAvatar(file) {
    if (!user.value) return { error: { message: 'Belum login' } }

    const ext = file.name.split('.').pop()
    const fileName = `avatars/${user.value.id}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('memories-media')
      .upload(fileName, file, { upsert: true })

    if (uploadError) return { error: uploadError }

    const { data: { publicUrl } } = supabase.storage
      .from('memories-media')
      .getPublicUrl(fileName)

    await updateProfile({ avatar_url: publicUrl })

    return { data: publicUrl, error: null }
  }

  function reset() {
    user.value = null
    session.value = null
    profile.value = null
  }

  return {
    user,
    session,
    profile,
    loading,
    isAuthenticated,
    userName,
    userAvatar,
    userEmail,
    initialize,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    reset,
  }
})
