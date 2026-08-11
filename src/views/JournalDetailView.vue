<template>
  <div class="max-w-3xl mx-auto animate-fade-in">
    <!-- Loading -->
    <LoadingSpinner v-if="journalStore.loading && !entry" size="lg" class="py-20" />

    <!-- Content -->
    <template v-else-if="entry">
      <!-- Back + Actions -->
      <div class="flex items-center justify-between mb-6">
        <button
          class="p-2 rounded-xl hover:bg-surface-alt text-text-muted hover:text-text transition-colors cursor-pointer"
          @click="$router.back()"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>

        <button
          v-if="isAuthor"
          class="p-2 rounded-xl hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer"
          @click="handleDelete"
          title="Hapus jurnal"
        >
          <Trash2 class="w-5 h-5" />
        </button>
      </div>

      <!-- Journal Card -->
      <div class="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
        <div class="p-6 sm:p-8">
          <!-- Mood & Date -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <span class="text-4xl">{{ getMoodEmoji(entry.mood) }}</span>
              <div>
                <p class="text-sm font-medium text-primary capitalize">{{ entry.mood }}</p>
                <p class="text-xs text-text-muted">{{ formatDate(entry.created_at) }}</p>
              </div>
            </div>

            <!-- Author -->
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
                <img v-if="entry.profiles?.avatar_url" :src="entry.profiles.avatar_url" class="w-full h-full object-cover" />
                <span v-else class="text-white text-sm font-semibold">{{ entry.profiles?.full_name?.charAt(0) }}</span>
              </div>
              <span class="text-sm font-medium text-text">{{ entry.profiles?.full_name }}</span>
            </div>
          </div>

          <!-- Title -->
          <h1 class="text-2xl font-bold text-text mb-6">{{ entry.title }}</h1>

          <!-- Content -->
          <div class="journal-content prose max-w-none" v-html="entry.content" />
        </div>

        <!-- Reactions -->
        <div class="px-6 sm:px-8 py-4 border-t border-border bg-surface/30">
          <ReactionBar
            :reactions="reactions"
            :entry-id="entry.id"
            @react="handleReaction"
          />
        </div>
      </div>
    </template>

    <!-- Not Found -->
    <EmptyState v-else icon="📝" title="Jurnal tidak ditemukan" message="Jurnal yang kamu cari tidak ada atau sudah dihapus." />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Trash2 } from '@lucide/vue'
import { useJournalStore } from '@/stores/journalStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'
import { formatDate } from '@/utils/dateFormatter'
import ReactionBar from '@/components/journal/ReactionBar.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const journalStore = useJournalStore()
const authStore = useAuthStore()
const toast = useToast()

const entry = ref(null)
const reactions = ref([])

const moodEmojis = {
  happy: '😊', sad: '😢', tired: '😴', love: '😍',
  angry: '😤', peaceful: '😌', sick: '🤒', excited: '🎉',
}

function getMoodEmoji(mood) { return moodEmojis[mood] || '😊' }

const isAuthor = computed(() => entry.value?.user_id === authStore.user?.id)

onMounted(async () => {
  const { data } = await journalStore.fetchEntry(route.params.id)
  if (data) {
    entry.value = data
    reactions.value = data.journal_reactions || []

    // Subscribe to realtime reactions
    journalStore.subscribeToReactions(data.id, (payload) => {
      // Refetch reactions on any change
      journalStore.fetchReactions(data.id).then(({ data: rData }) => {
        if (rData) reactions.value = rData
      })
    })
  }
})

onUnmounted(() => {
  journalStore.unsubscribeReactions()
})

async function handleReaction({ entryId, reactionType }) {
  const { error } = await journalStore.addReaction(entryId, reactionType)
  if (error) {
    toast.error('Gagal memberikan reaksi')
  }
  // Reactions will auto-update via realtime subscription
}

async function handleDelete() {
  if (!confirm('Yakin ingin menghapus jurnal ini?')) return

  const { error } = await journalStore.deleteEntry(entry.value.id)
  if (error) {
    toast.error('Gagal menghapus jurnal')
  } else {
    toast.success('Jurnal dihapus')
    router.push('/jurnal')
  }
}
</script>
