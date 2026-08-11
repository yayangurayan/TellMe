<template>
  <div class="space-y-6 animate-fade-in pb-10">
    <!-- Header Greeting -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-text tracking-tight">
          {{ greeting }}, {{ authStore.userName.split(' ')[0] }}! ✨
        </h1>
        <p class="text-text-muted mt-1 text-sm">Selamat datang di ruang privat kita berdua.</p>
      </div>
    </div>

    <!-- SKELETON LOADING -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-12 gap-4">
      <SkeletonCard class="md:col-span-8 h-[250px]" />
      <SkeletonCard class="md:col-span-4 h-[250px]" />
      <SkeletonCard class="md:col-span-4 h-[200px]" />
      <SkeletonCard class="md:col-span-4 h-[200px]" />
      <SkeletonCard class="md:col-span-4 h-[200px]" />
    </div>

    <!-- BENTO GRID CONTENT -->
    <div v-else class="grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(180px,auto)] gap-4">
      
      <!-- 1. Hero Card (Hari Bersama) - Spans 8 cols -->
      <BaseCard glass class="md:col-span-8 flex flex-col justify-between overflow-hidden relative group p-6 sm:p-8">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 z-0" />
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500" />
        
        <div class="relative z-10 flex items-start gap-4 mb-8">
          <div class="w-12 h-12 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-md flex items-center justify-center shadow-soft">
            <span class="text-2xl">💙</span>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-text">Hari Bersama</h2>
            <p class="text-sm text-text-muted">Sejak memori pertama kita tercipta.</p>
          </div>
        </div>
        
        <div class="relative z-10">
          <div class="flex items-baseline gap-2">
            <span class="text-5xl sm:text-7xl font-black text-text tracking-tighter">{{ daysTogether }}</span>
            <span class="text-xl sm:text-2xl font-bold text-text-muted">Hari</span>
          </div>
        </div>
      </BaseCard>

      <!-- 2. Upcoming Event - Spans 4 cols -->
      <BaseCard hoverable class="md:col-span-4 flex flex-col justify-between p-6 bg-gradient-to-br from-surface to-surface-alt" @click="$router.push('/agenda')">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="text-lg">📅</span>
            <span class="font-semibold text-text text-sm uppercase tracking-wider">Agenda Terdekat</span>
          </div>
          <ArrowUpRight class="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div v-if="upcomingEvents.length">
          <div class="inline-flex px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold mb-2">
            {{ getCountdown(upcomingEvents[0].start_time) }}
          </div>
          <h3 class="text-xl font-bold text-text line-clamp-2 leading-tight">{{ upcomingEvents[0].title }}</h3>
          <p class="text-sm text-text-muted mt-1">{{ formatTime(upcomingEvents[0].start_time) }}</p>
        </div>
        <div v-else class="flex flex-col items-center justify-center h-full opacity-50">
          <span class="text-2xl mb-2">😴</span>
          <p class="text-sm font-medium">Belum ada agenda</p>
        </div>
      </BaseCard>

      <!-- 3. Recent Journal Mini - Spans 4 cols -->
      <BaseCard hoverable class="md:col-span-4 p-6" @click="recentJournals.length ? $router.push(`/jurnal/${recentJournals[0].id}`) : $router.push('/jurnal/tulis')">
        <div class="flex items-center justify-between mb-4">
          <span class="font-semibold text-text text-sm uppercase tracking-wider">Jurnal Terakhir</span>
          <span class="text-2xl">{{ recentJournals.length ? getMoodEmoji(recentJournals[0].mood) : '📝' }}</span>
        </div>
        <div v-if="recentJournals.length">
          <h3 class="text-lg font-bold text-text line-clamp-1">{{ recentJournals[0].title }}</h3>
          <p class="text-sm text-text-muted mt-1 line-clamp-2" v-html="stripHtml(recentJournals[0].content)" />
          <p class="text-xs text-primary font-medium mt-3">{{ formatRelative(recentJournals[0].created_at) }}</p>
        </div>
        <div v-else class="text-center opacity-50 mt-4">
          <p class="text-sm font-medium">Tulis jurnal pertamamu!</p>
        </div>
      </BaseCard>

      <!-- 4. Quick Stats - Spans 4 cols -->
      <BaseCard class="md:col-span-4 p-6 grid grid-cols-2 gap-4">
        <div class="flex flex-col justify-center items-center p-3 rounded-2xl bg-primary/5 border border-primary/10">
          <span class="text-2xl mb-1">📸</span>
          <span class="text-2xl font-black text-text">{{ totalMemories }}</span>
          <span class="text-[10px] uppercase font-bold text-text-muted tracking-wider">Foto</span>
        </div>
        <div class="flex flex-col justify-center items-center p-3 rounded-2xl bg-accent/5 border border-accent/10">
          <span class="text-2xl mb-1">📖</span>
          <span class="text-2xl font-black text-text">{{ totalJournals }}</span>
          <span class="text-[10px] uppercase font-bold text-text-muted tracking-wider">Jurnal</span>
        </div>
      </BaseCard>

      <!-- 5. Mood Trend - Spans 4 cols -->
      <BaseCard class="md:col-span-4 p-6 flex flex-col">
        <div class="flex items-center justify-between mb-2">
          <span class="font-semibold text-text text-sm uppercase tracking-wider">Mood 7 Hari</span>
        </div>
        <div class="flex-1 -mx-2 -mb-2 relative">
          <MoodChart />
        </div>
      </BaseCard>

      <!-- 6. On This Day (Full Width / Spans 12 cols if exists) -->
      <div v-if="onThisDayData.memories.length || onThisDayData.journals.length" class="md:col-span-12 mt-4">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-xl">🕰️</span>
          <h2 class="text-lg font-bold text-text">Pada Hari Ini di Masa Lalu</h2>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Memories On This Day -->
          <BaseCard
            v-for="memory in onThisDayData.memories"
            :key="memory.id"
            hoverable
            :padding="false"
            class="overflow-hidden group"
            @click="$router.push('/kenangan')"
          >
            <div class="aspect-video relative overflow-hidden">
              <img :src="memory.image_url" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div class="absolute bottom-3 left-3 text-white">
                <p class="text-sm font-medium line-clamp-1">{{ memory.caption }}</p>
                <p class="text-xs font-bold text-primary-light mt-0.5">{{ yearsAgo(memory.taken_at) }} tahun yang lalu</p>
              </div>
            </div>
          </BaseCard>

          <!-- Journals On This Day -->
          <BaseCard
            v-for="journal in onThisDayData.journals"
            :key="journal.id"
            hoverable
            class="flex flex-col justify-between"
            @click="$router.push(`/jurnal/${journal.id}`)"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-2xl">{{ getMoodEmoji(journal.mood) }}</span>
                <span class="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{{ yearsAgo(journal.created_at) }} thn lalu</span>
              </div>
              <p class="font-bold text-text line-clamp-1">{{ journal.title }}</p>
              <p class="text-sm text-text-muted mt-1 line-clamp-2" v-html="stripHtml(journal.content)" />
            </div>
          </BaseCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ArrowUpRight } from '@lucide/vue'
import { useAuthStore } from '@/stores/authStore'
import { useJournalStore } from '@/stores/journalStore'
import { useEventStore } from '@/stores/eventStore'
import { useNostalgia } from '@/composables/useNostalgia'
import { getGreeting, formatRelative, formatTime, getCountdown } from '@/utils/dateFormatter'
import BaseCard from '@/components/ui/BaseCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import MoodChart from '@/components/journal/MoodChart.vue'

const authStore = useAuthStore()
const journalStore = useJournalStore()
const eventStore = useEventStore()
const { fetchOnThisDay } = useNostalgia()

const greeting = ref(getGreeting())
const loading = ref(true)

const recentJournals = ref([])
const upcomingEvents = ref([])
const onThisDayData = ref({ memories: [], journals: [] })
const totalMemories = ref(0)
const totalJournals = ref(0)
const daysTogether = ref(0)

const moodEmojis = {
  happy: '😊', sad: '😢', tired: '😴', love: '😍',
  angry: '😤', peaceful: '😌', sick: '🤒', excited: '🎉',
}
function getMoodEmoji(mood) { return moodEmojis[mood] || '😊' }
function stripHtml(html) { return html?.replace(/<[^>]*>/g, '').substring(0, 100) || '' }
function yearsAgo(dateStr) { return new Date().getFullYear() - new Date(dateStr).getFullYear() }

onMounted(async () => {
  loading.value = true
  
  const [journalRes, eventRes, nostalgiaRes] = await Promise.all([
    journalStore.fetchEntries({ limit: 1 }),
    eventStore.fetchUpcoming(),
    fetchOnThisDay(),
  ])

  recentJournals.value = journalStore.entries.slice(0, 1)
  upcomingEvents.value = eventStore.upcomingEvents.slice(0, 1)
  onThisDayData.value = nostalgiaRes

  // Get counts & earliest date for days together
  const { supabase } = await import('@/lib/supabase')
  
  // Parallel fetch counts & earliest record
  const [memCountRes, jCountRes, memOldestRes, jOldestRes] = await Promise.all([
    supabase.from('memories').select('*', { count: 'exact', head: true }),
    supabase.from('journal_entries').select('*', { count: 'exact', head: true }),
    supabase.from('memories').select('taken_at').order('taken_at', { ascending: true }).limit(1),
    supabase.from('journal_entries').select('created_at').order('created_at', { ascending: true }).limit(1)
  ])

  totalMemories.value = memCountRes.count || 0
  totalJournals.value = jCountRes.count || 0

  // Calculate days together from oldest record
  const d1 = memOldestRes.data?.[0]?.taken_at ? new Date(memOldestRes.data[0].taken_at) : new Date()
  const d2 = jOldestRes.data?.[0]?.created_at ? new Date(jOldestRes.data[0].created_at) : new Date()
  const oldestDate = new Date(Math.min(d1.getTime(), d2.getTime()))
  
  const diffTime = Math.abs(new Date() - oldestDate)
  daysTogether.value = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

  loading.value = false
})
</script>
