<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text">Agenda Bersama 📅</h1>
        <p class="text-text-muted text-sm mt-1">Rencana dan acara kita berdua</p>
      </div>
      <BaseButton @click="openForm()">
        <Plus class="w-4 h-4" />
        Tambah Agenda
      </BaseButton>
    </div>

    <!-- Upcoming Events -->
    <section>
      <h2 class="text-lg font-semibold text-text mb-4 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
        Agenda Mendatang
      </h2>

      <div v-if="eventStore.upcomingEvents.length" class="space-y-3">
        <EventCard
          v-for="event in eventStore.upcomingEvents"
          :key="event.id"
          :event="event"
          @edit="openForm(event)"
          @delete="handleDelete"
        />
      </div>
      <EmptyState v-else icon="📅" title="Tidak ada agenda" message="Tambahkan acara atau rencana berdua!" />
    </section>

    <!-- Past Events -->
    <section v-if="eventStore.pastEvents.length">
      <button
        class="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-colors mb-4 cursor-pointer"
        @click="showPast = !showPast"
      >
        <ChevronDown :class="['w-4 h-4 transition-transform', showPast ? 'rotate-180' : '']" />
        Agenda yang sudah lewat ({{ eventStore.pastEvents.length }})
      </button>

      <Transition name="page">
        <div v-if="showPast" class="space-y-3 opacity-70">
          <EventCard
            v-for="event in eventStore.pastEvents"
            :key="event.id"
            :event="event"
            @edit="openForm(event)"
            @delete="handleDelete"
          />
        </div>
      </Transition>
    </section>

    <!-- Loading Skeletons -->
    <div v-if="eventStore.loading" class="space-y-3">
      <SkeletonCard class="h-[120px]" />
      <SkeletonCard class="h-[120px]" />
    </div>

    <!-- Event Form Modal -->
    <EventForm
      v-model="showForm"
      :event="editingEvent"
      @saved="onSaved"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, ChevronDown } from '@lucide/vue'
import { useEventStore } from '@/stores/eventStore'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'
import EventCard from '@/components/calendar/EventCard.vue'
import EventForm from '@/components/calendar/EventForm.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'

const eventStore = useEventStore()
const toast = useToast()

const showForm = ref(false)
const showPast = ref(false)
const editingEvent = ref(null)

onMounted(async () => {
  await Promise.all([
    eventStore.fetchUpcoming(),
    eventStore.fetchPast(),
  ])
})

function openForm(event = null) {
  editingEvent.value = event
  showForm.value = true
}

function onSaved() {
  editingEvent.value = null
  eventStore.fetchUpcoming()
  eventStore.fetchPast()
}

async function handleDelete(eventId) {
  if (!confirm('Yakin ingin menghapus agenda ini?')) return

  const { error } = await eventStore.deleteEvent(eventId)
  if (error) {
    toast.error('Gagal menghapus agenda')
  } else {
    toast.success('Agenda dihapus')
  }
}
</script>
