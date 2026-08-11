import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useJournalStore = defineStore('journal', () => {
  const entries = ref([])
  const currentEntry = ref(null)
  const reactions = ref([])
  const loading = ref(false)
  const realtimeChannel = ref(null)

  async function fetchEntries(filters = {}) {
    loading.value = true

    let query = supabase
      .from('journal_entries')
      .select('*, profiles:user_id(full_name, avatar_url), journal_reactions(id, reaction_type, user_id)')
      .order('created_at', { ascending: false })

    if (filters.mood) {
      query = query.eq('mood', filters.mood)
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (data) {
      entries.value = data
    }

    loading.value = false
    return { data, error }
  }

  async function fetchEntry(id) {
    loading.value = true

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*, profiles:user_id(full_name, avatar_url), journal_reactions(id, reaction_type, user_id)')
      .eq('id', id)
      .single()

    if (data) {
      currentEntry.value = data
    }

    loading.value = false
    return { data, error }
  }

  async function createEntry(entryData) {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        title: entryData.title,
        content: entryData.content,
        mood: entryData.mood,
      })
      .select('*, profiles:user_id(full_name, avatar_url)')
      .single()

    if (data) {
      entries.value.unshift({ ...data, journal_reactions: [] })
    }

    return { data, error }
  }

  async function deleteEntry(id) {
    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id)

    if (!error) {
      entries.value = entries.value.filter(e => e.id !== id)
      if (currentEntry.value?.id === id) {
        currentEntry.value = null
      }
    }

    return { error }
  }

  async function addReaction(entryId, reactionType) {
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user already reacted with this type
    const { data: existing } = await supabase
      .from('journal_reactions')
      .select('id')
      .eq('entry_id', entryId)
      .eq('user_id', user.id)
      .eq('reaction_type', reactionType)
      .single()

    if (existing) {
      // Remove reaction (toggle off)
      const { error } = await supabase
        .from('journal_reactions')
        .delete()
        .eq('id', existing.id)

      return { action: 'removed', error }
    } else {
      // Add reaction
      const { data, error } = await supabase
        .from('journal_reactions')
        .insert({
          entry_id: entryId,
          user_id: user.id,
          reaction_type: reactionType,
        })
        .select()
        .single()

      return { action: 'added', data, error }
    }
  }

  async function fetchReactions(entryId) {
    const { data, error } = await supabase
      .from('journal_reactions')
      .select('*')
      .eq('entry_id', entryId)

    if (data) {
      reactions.value = data
    }

    return { data, error }
  }

  /**
   * Subscribe to realtime reactions for a specific journal entry
   */
  function subscribeToReactions(entryId, onUpdate) {
    // Unsubscribe from previous channel
    unsubscribeReactions()

    realtimeChannel.value = supabase
      .channel(`reactions-${entryId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'journal_reactions',
          filter: `entry_id=eq.${entryId}`,
        },
        (payload) => {
          if (onUpdate) onUpdate(payload)
          fetchReactions(entryId)
        }
      )
      .subscribe()
  }

  function unsubscribeReactions() {
    if (realtimeChannel.value) {
      supabase.removeChannel(realtimeChannel.value)
      realtimeChannel.value = null
    }
  }

  /**
   * Fetch mood data for chart (last 30 days)
   */
  async function fetchMoodData(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('journal_entries')
      .select('user_id, mood, created_at, profiles:user_id(full_name)')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    return { data: data || [], error }
  }

  return {
    entries,
    currentEntry,
    reactions,
    loading,
    fetchEntries,
    fetchEntry,
    createEntry,
    deleteEntry,
    addReaction,
    fetchReactions,
    subscribeToReactions,
    unsubscribeReactions,
    fetchMoodData,
  }
})
