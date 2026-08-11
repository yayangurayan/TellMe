<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-text">Arsip Kenangan 📸</h1>
        <p class="text-text-muted text-sm mt-1">Momen-momen berharga kita berdua</p>
      </div>
      <div class="flex items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1 sm:w-64">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari kenangan..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-text placeholder-text-muted focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 outline-none text-sm"
            @input="handleSearch"
          />
        </div>
        <router-link
          to="/kenangan/tambah"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark shadow-soft hover:shadow-medium transition-all duration-200 active:scale-[0.98] whitespace-nowrap"
        >
          <Plus class="w-4 h-4" />
          Tambah
        </router-link>
      </div>
    </div>

    <!-- Timeline -->
    <div v-if="memoryStore.memories.length" class="relative">
      <TimelineItem
        v-for="(memory, index) in memoryStore.memories"
        :key="memory.id"
        :memory="memory"
        :index="index"
        @view="openViewer(index)"
      />

      <!-- Load More -->
      <div v-if="memoryStore.hasMore" class="flex justify-center pt-4">
        <BaseButton variant="secondary" :loading="memoryStore.loading" @click="loadMore">
          Muat lebih banyak
        </BaseButton>
      </div>
    </div>

    <!-- Loading Skeletons -->
    <div v-else-if="memoryStore.loading" class="space-y-8">
      <SkeletonCard withImage class="max-w-md mx-auto h-[350px]" />
      <SkeletonCard withImage class="max-w-md mx-auto h-[350px]" />
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else
      icon="📸"
      title="Belum ada kenangan"
      message="Mulai upload foto-foto berharga kalian berdua!"
    >
      <template #action>
        <router-link
          to="/kenangan/tambah"
          class="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-all"
        >
          <Plus class="w-4 h-4" /> Upload Kenangan
        </router-link>
      </template>
    </EmptyState>

    <!-- Image Viewer -->
    <ImageViewer
      v-model="showViewer"
      :images="memoryStore.memories"
      :start-index="viewerIndex"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search, Plus } from '@lucide/vue'
import { useMemoryStore } from '@/stores/memoryStore'
import TimelineItem from '@/components/memories/TimelineItem.vue'
import ImageViewer from '@/components/memories/ImageViewer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const memoryStore = useMemoryStore()
const searchQuery = ref('')
const showViewer = ref(false)
const viewerIndex = ref(0)
let searchTimeout = null

onMounted(() => {
  memoryStore.fetchMemories(true)
})

function loadMore() {
  memoryStore.fetchMemories()
}

function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (searchQuery.value.trim()) {
      memoryStore.searchMemories(searchQuery.value)
    } else {
      memoryStore.fetchMemories(true)
    }
  }, 300)
}

function openViewer(index) {
  viewerIndex.value = index
  showViewer.value = true
}
</script>
