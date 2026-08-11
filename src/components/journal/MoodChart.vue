<template>
  <div>
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
    <p v-else class="text-sm text-text-muted text-center py-8">Belum ada data mood</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
} from 'chart.js'
import { useJournalStore } from '@/stores/journalStore'
import { formatDateShort } from '@/utils/dateFormatter'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale, Filler)

const journalStore = useJournalStore()
const moodData = ref([])

const moodValues = {
  happy: 5,
  love: 5,
  excited: 4,
  peaceful: 3,
  tired: 2,
  sad: 1,
  angry: 1,
  sick: 1,
}

const moodEmojis = {
  happy: '😊',
  sad: '😢',
  tired: '😴',
  love: '😍',
  angry: '😤',
  peaceful: '😌',
  sick: '🤒',
  excited: '🎉',
}

onMounted(async () => {
  const { data } = await journalStore.fetchMoodData(30)
  moodData.value = data
})

const chartData = computed(() => {
  if (!moodData.value.length) return null

  // Group by user
  const users = {}
  moodData.value.forEach(entry => {
    const userId = entry.user_id
    if (!users[userId]) {
      users[userId] = {
        name: entry.profiles?.full_name || 'User',
        data: [],
      }
    }
    users[userId].data.push({
      date: formatDateShort(entry.created_at),
      value: moodValues[entry.mood] || 3,
      mood: entry.mood,
    })
  })

  const userList = Object.values(users)
  const colors = [
    { bg: 'rgba(8, 145, 178, 0.1)', border: 'rgba(8, 145, 178, 1)' },
    { bg: 'rgba(20, 184, 166, 0.1)', border: 'rgba(20, 184, 166, 1)' },
  ]

  // Merge all dates for labels
  const allDates = [...new Set(moodData.value.map(e => formatDateShort(e.created_at)))]

  return {
    labels: allDates,
    datasets: userList.map((user, i) => ({
      label: user.name,
      data: allDates.map(date => {
        const entry = user.data.find(d => d.date === date)
        return entry ? entry.value : null
      }),
      borderColor: colors[i]?.border || colors[0].border,
      backgroundColor: colors[i]?.bg || colors[0].bg,
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      spanGaps: true,
    })),
  }
})

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        padding: 16,
        font: { family: 'Inter', size: 12 },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      titleFont: { family: 'Inter' },
      bodyFont: { family: 'Inter' },
      padding: 12,
      cornerRadius: 12,
      callbacks: {
        label: (ctx) => {
          const val = ctx.parsed.y
          const moodName = Object.entries(moodValues).find(([, v]) => v === val)?.[0]
          const emoji = moodEmojis[moodName] || ''
          return `${ctx.dataset.label}: ${emoji} ${moodName || val}`
        },
      },
    },
  },
  scales: {
    y: {
      min: 0,
      max: 6,
      ticks: {
        stepSize: 1,
        callback: (val) => {
          const labels = { 1: '😢', 2: '😴', 3: '😌', 4: '🎉', 5: '😊' }
          return labels[val] || ''
        },
        font: { size: 14 },
      },
      grid: { color: 'rgba(148, 163, 184, 0.1)' },
    },
    x: {
      ticks: { font: { family: 'Inter', size: 10 }, maxRotation: 45 },
      grid: { display: false },
    },
  },
})
</script>
