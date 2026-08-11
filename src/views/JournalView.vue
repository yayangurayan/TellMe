<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text">Jurnal Harian 📝</h1>
        <p class="text-text-muted text-sm mt-1">Ceritakan isi hati dan pikiranmu</p>
      </div>
      <router-link
        to="/jurnal/tulis"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark shadow-soft hover:shadow-medium transition-all duration-200 active:scale-[0.98] whitespace-nowrap"
      >
        <PenLine class="w-4 h-4" />
        Tulis Jurnal
      </router-link>
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        :class="[
          'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer',
          !selectedMood ? 'bg-primary text-white shadow-soft' : 'bg-card text-text-muted border border-border hover:bg-surface-alt'
        ]"
        @click="filterByMood(null)"
      >
        Semua
      </button>
      <button
        v-for="mood in moods"
        :key="mood.value"
        :class="[
          'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap cursor-pointer',
          selectedMood === mood.value ? 'bg-primary text-white shadow-soft' : 'bg-card text-text-muted border border-border hover:bg-surface-alt'
        ]"
        @click="filterByMood(mood.value)"
      >
        <span>{{ mood.emoji }}</span> {{ mood.label }}
      </button>
    </div>

    <!-- Journal Grid -->
    <div v-if="journalStore.entries.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="entry in journalStore.entries"
        :key="entry.id"
        class="bg-card rounded-2xl border border-border shadow-soft hover:shadow-medium hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden group"
        @click="$router.push(`/jurnal/${entry.id}`)"
      >
        <div class="p-5">
          <div class="flex items-center justify-between mb-3">
            <span class="text-3xl">{{ getMoodEmoji(entry.mood) }}</span>
            <span class="text-xs text-text-muted">{{ formatRelative(entry.created_at) }}</span>
          </div>

          <h3 class="text-lg font-semibold text-text line-clamp-1 group-hover:text-primary transition-colors">
            {{ entry.title }}
          </h3>
          <p class="text-sm text-text-muted mt-2 line-clamp-3" v-html="stripHtml(entry.content)" />

          <div class="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                <img v-if="entry.profiles?.avatar_url" :src="entry.profiles.avatar_url" class="w-full h-full object-cover" />
                <span v-else class="text-white text-[10px] font-semibold">{{ entry.profiles?.full_name?.charAt(0) }}</span>
              </div>
              <span class="text-xs text-text-muted">{{ entry.profiles?.full_name }}</span>
            </div>

            <!-- Reactions summary -->
            <div v-if="entry.journal_reactions?.length" class="flex items-center gap-1">
              <span
                v-for="r in getUniqueReactions(entry.journal_reactions)"
                :key="r"
                class="text-sm"
              >{{ r }}</span>
              <span class="text-xs text-text-muted ml-1">{{ entry.journal_reactions.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Skeletons -->
    <div v-else-if="journalStore.loading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SkeletonCard v-for="i in 4" :key="i" class="h-[200px]" />
    </div>

    <!-- Empty -->
    <EmptyState v-else icon="📝" title="Belum ada jurnal" message="Mulai tulis cerita dan perasaanmu hari ini!">
      <template #action>
        <router-link
          to="/jurnal/tulis"
          class="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-all"
        >
          <PenLine class="w-4 h-4" /> Tulis Jurnal
        </router-link>
      </template>
    </EmptyState>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { PenLine } from '@lucide/vue'
import { useJournalStore } from '@/stores/journalStore'
import { formatRelative } from '@/utils/dateFormatter'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const journalStore = useJournalStore()
const selectedMood = ref(null)

const moods = [
  { value: 'happy', emoji: '😊', label: 'Senang' },
  { value: 'sad', emoji: '😢', label: 'Sedih' },
  { value: 'love', emoji: '😍', label: 'Cinta' },
  { value: 'excited', emoji: '🎉', label: 'Semangat' },
  { value: 'peaceful', emoji: '😌', label: 'Damai' },
]

const moodEmojis = {
  happy: '😊', sad: '😢', tired: '😴', love: '😍',
  angry: '😤', peaceful: '😌', sick: '🤒', excited: '🎉',
}

function getMoodEmoji(mood) { return moodEmojis[mood] || '😊' }

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').substring(0, 150)
}

function getUniqueReactions(reactions) {
  return [...new Set(reactions.map(r => r.reaction_type))]
}

function filterByMood(mood) {
  selectedMood.value = mood
  journalStore.fetchEntries(mood ? { mood } : {})
}

onMounted(() => {
  journalStore.fetchEntries()
})
</script>
