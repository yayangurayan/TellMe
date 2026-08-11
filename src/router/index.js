import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/kenangan',
      name: 'memories',
      component: () => import('@/views/MemoriesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/kenangan/tambah',
      name: 'add-memory',
      component: () => import('@/views/AddMemoryView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/jurnal',
      name: 'journal',
      component: () => import('@/views/JournalView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/jurnal/tulis',
      name: 'write-journal',
      component: () => import('@/views/WriteJournalView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/jurnal/:id',
      name: 'journal-detail',
      component: () => import('@/views/JournalDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/agenda',
      name: 'calendar',
      component: () => import('@/views/CalendarView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/pengaturan',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize
  if (authStore.loading) {
    await new Promise((resolve) => {
      const unwatch = authStore.$subscribe((_, state) => {
        if (!state.loading) {
          unwatch()
          resolve()
        }
      })
      // Fallback timeout
      setTimeout(() => { unwatch(); resolve() }, 3000)
    })
  }

  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
