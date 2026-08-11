<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Greeting -->
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-text">
        {{ greeting }}, {{ authStore.userName }}! 💙
      </h1>
      <p class="text-text-muted mt-1">Apa yang ingin kamu ceritakan hari ini?</p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-card rounded-2xl border border-border p-4 shadow-soft hover:shadow-medium transition-all duration-300"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center" :class="stat.bgClass">
            <span class="text-xl">{{ stat.icon }}</span>
          </div>
          <div>
            <p class="text-2xl font-bold text-text">{{ stat.value }}</p>
            <p class="text-xs text-text-muted">{{ stat.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- On This Day (Nostalgia) -->
    <section v-if="onThisDayData.memories.length || onThisDayData.journals.length">
      <div class="flex items-center gap-2 mb-4">
        <span class="text-xl">🕰️</span>
        <h2 class="text-lg font-semibold text-text">Pada Hari Ini</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="memory in onThisDayData.memories"
          :key="memory.id"
          class="bg-card rounded-2xl border border-border shadow-soft overflow-hidden group cursor-pointer hover:shadow-medium transition-all duration-300"
          @click="$router.push('/kenangan')"
        >
          <div class="aspect-video overflow-hidden">
            <img
              :src="memory.image_url"
              :alt="memory.caption"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div class="p-3">
            <p class="text-sm font-medium text-text line-clamp-1">{{ memory.caption }}</p>
            <p class="text-xs text-primary mt-0.5">
              {{ yearsAgo(memory.taken_at) }} tahun yang lalu
            </p>
          </div>
        </div>

        <div
          v-for="journal in onThisDayData.journals"
          :key="journal.id"
          class="bg-card rounded-2xl border border-border shadow-soft p-4 cursor-pointer hover:shadow-medium transition-all duration-300"
          @click="$router.push(`/jurnal/${journal.id}`)"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-lg">{{ getMoodEmoji(journal.mood) }}</span>
            <span class="text-xs text-primary font-medium">
              {{ yearsAgo(journal.created_at) }} tahun yang lalu
            </span>
          </div>
          <p class="font-medium text-text line-clamp-1">{{ journal.title }}</p>
          <p class="text-sm text-text-muted mt-1 line-clamp-2" v-html="stripHtml(journal.content)" />
        </div>
      </div>
    </section>

    <!-- Recent Journals -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="text-xl">📝</span>
          <h2 class="text-lg font-semibold text-text">Jurnal Terbaru</h2>
        </div>
        <router-link to="/jurnal" class="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
          Lihat semua →
        </router-link>
      </div>

      <div v-if="recentJournals.length" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="entry in recentJournals"
          :key="entry.id"
          class="bg-card rounded-2xl border border-border shadow-soft p-4 cursor-pointer hover:shadow-medium hover:-translate-y-0.5 transition-all duration-300"
          @click="$router.push(`/jurnal/${entry.id}`)"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="text-2xl">{{ getMoodEmoji(entry.mood) }}</span>
            <span class="text-xs text-text-muted">{{ formatRelative(entry.created_at) }}</span>
          </div>
          <h3 class="font-semibold text-text line-clamp-1">{{ entry.title }}</h3>
          <p class="text-sm text-text-muted mt-1 line-clamp-2" v-html="stripHtml(entry.content)" />
          <div class="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
            <div class="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
              <img v-if="entry.profiles?.avatar_url" :src="entry.profiles.avatar_url" class="w-full h-full object-cover" />
              <span v-else class="text-white text-[8px] font-semibold">{{ entry.profiles?.full_name?.charAt(0) }}</span>
            </div>
            <span class="text-xs text-text-muted">{{ entry.profiles?.full_name }}</span>
          </div>
        </div>
      </div>
      <EmptyState v-else icon="📝" title="Belum ada jurnal" message="Mulai tulis cerita harimu!" />
    </section>

    <!-- Upcoming Events -->
    <section>
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="text-xl">📅</span>
          <h2 class="text-lg font-semibold text-text">Agenda Terdekat</h2>
        </div>
        <router-link to="/agenda" class="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
          Lihat semua →
        </router-link>
      </div>
      <div v-if="upcomingEvents.length" class="space-y-3">
        <EventCard
          v-for="event in upcomingEvents"
          :key="event.id"
          :event="event"
        />
      </div>
      <EmptyState v-else icon="📅" title="Tidak ada agenda" message="Belum ada acara yang dijadwalkan." />
    </section>

    <!-- Mood Tracker Mini -->
    <section>
      <div class="flex items-center gap-2 mb-4">
        <span class="text-xl">📊</span>
        <h2 class="text-lg font-semibold text-text">Tren Mood (7 Hari)</h2>
      </div>
      <div class="bg-card rounded-2xl border border-border shadow-soft p-4" style="height: 250px;">
        <MoodChart />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useJournalStore } from '@/stores/journalStore'
import { useEventStore } from '@/stores/eventStore'
import { useNostalgia } from '@/composables/useNostalgia'
import { getGreeting, formatRelative } from '@/utils/dateFormatter'
import EmptyState from '@/components/ui/EmptyState.vue'
import EventCard from '@/components/calendar/EventCard.vue'
import MoodChart from '@/components/journal/MoodChart.vue'

const authStore = useAuthStore()
const journalStore = useJournalStore()
const eventStore = useEventStore()
const { fetchOnThisDay } = useNostalgia()

const greeting = ref(getGreeting())
const recentJournals = ref([])
const upcomingEvents = ref([])
const onThisDayData = ref({ memories: [], journals: [] })
const totalMemories = ref(0)
const totalJournals = ref(0)

const stats = computed(() => [
  { icon: '📸', label: 'Kenangan', value: totalMemories.value, bgClass: 'bg-primary/10' },
  { icon: '📝', label: 'Jurnal', value: totalJournals.value, bgClass: 'bg-accent/10' },
  { icon: '📅', label: 'Agenda', value: upcomingEvents.value.length, bgClass: 'bg-warning/10' },
  { icon: '💙', label: 'Hari Bersama', value: daysTogether.value, bgClass: 'bg-info/10' },
])

const daysTogether = computed(() => {
  // Simple counter from first memory date
  return '∞'
})

const moodEmojis = {
  happy: '😊', sad: '😢', tired: '😴', love: '😍',
  angry: '😤', peaceful: '😌', sick: '🤒', excited: '🎉',
}

function getMoodEmoji(mood) {
  return moodEmojis[mood] || '😊'
}

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').substring(0, 100)
}

function yearsAgo(dateStr) {
  return new Date().getFullYear() - new Date(dateStr).getFullYear()
}

onMounted(async () => {
  // Fetch data in parallel
  const [journalRes, eventRes, nostalgiaRes] = await Promise.all([
    journalStore.fetchEntries({ limit: 3 }),
    eventStore.fetchUpcoming(),
    fetchOnThisDay(),
  ])

  recentJournals.value = journalStore.entries.slice(0, 3)
  upcomingEvents.value = eventStore.upcomingEvents.slice(0, 3)
  onThisDayData.value = nostalgiaRes

  // Get counts
  const { supabase } = await import('@/lib/supabase')
  const { count: memCount } = await supabase.from('memories').select('*', { count: 'exact', head: true })
  const { count: jCount } = await supabase.from('journal_entries').select('*', { count: 'exact', head: true })
  totalMemories.value = memCount || 0
  totalJournals.value = jCount || 0
})
</script>
