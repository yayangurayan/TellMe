import { ref, watch } from 'vue'

const isDark = ref(false)

// Initialize theme from localStorage or system preference
function initTheme() {
  const stored = localStorage.getItem('tellme-theme')
  if (stored) {
    isDark.value = stored === 'dark'
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme()
}

function applyTheme() {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function toggleTheme() {
  isDark.value = !isDark.value
  localStorage.setItem('tellme-theme', isDark.value ? 'dark' : 'light')
  applyTheme()
}

function setTheme(dark) {
  isDark.value = dark
  localStorage.setItem('tellme-theme', dark ? 'dark' : 'light')
  applyTheme()
}

// Watch for changes
watch(isDark, applyTheme)

export function useTheme() {
  return {
    isDark,
    toggleTheme,
    setTheme,
    initTheme,
  }
}
