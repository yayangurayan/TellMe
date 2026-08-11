import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useEventStore = defineStore('events', () => {
  const events = ref([])
  const pastEvents = ref([])
  const loading = ref(false)

  const upcomingEvents = computed(() =>
    events.value.filter(e => new Date(e.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
  )

  async function fetchUpcoming() {
    loading.value = true

    const { data, error } = await supabase
      .from('events')
      .select('*, profiles:created_by(full_name, avatar_url)')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true })

    if (data) {
      events.value = data
    }

    loading.value = false
    return { data, error }
  }

  async function fetchPast() {
    loading.value = true

    const { data, error } = await supabase
      .from('events')
      .select('*, profiles:created_by(full_name, avatar_url)')
      .lt('start_time', new Date().toISOString())
      .order('start_time', { ascending: false })
      .limit(20)

    if (data) {
      pastEvents.value = data
    }

    loading.value = false
    return { data, error }
  }

  async function createEvent(eventData) {
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        start_time: eventData.start_time,
        end_time: eventData.end_time,
        created_by: user.id,
      })
      .select('*, profiles:created_by(full_name, avatar_url)')
      .single()

    if (data) {
      events.value.push(data)
    }

    return { data, error }
  }

  async function updateEvent(id, updates) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select('*, profiles:created_by(full_name, avatar_url)')
      .single()

    if (data) {
      const index = events.value.findIndex(e => e.id === id)
      if (index > -1) {
        events.value[index] = data
      }
    }

    return { data, error }
  }

  async function deleteEvent(id) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)

    if (!error) {
      events.value = events.value.filter(e => e.id !== id)
      pastEvents.value = pastEvents.value.filter(e => e.id !== id)
    }

    return { error }
  }

  return {
    events,
    pastEvents,
    upcomingEvents,
    loading,
    fetchUpcoming,
    fetchPast,
    createEvent,
    updateEvent,
    deleteEvent,
  }
})
