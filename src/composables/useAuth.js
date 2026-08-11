import { supabase } from '@/lib/supabase'

const WHITELIST = [
  import.meta.env.VITE_WHITELIST_EMAIL_1,
  import.meta.env.VITE_WHITELIST_EMAIL_2,
]

function isWhitelisted(email) {
  return WHITELIST.includes(email?.toLowerCase())
}

async function signIn(email, password) {
  if (!isWhitelisted(email)) {
    return { error: { message: 'Email tidak terdaftar. Aplikasi ini bersifat privat.' } }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { data: null, error }

  // Double-check whitelist after login
  if (!isWhitelisted(data.user?.email)) {
    await supabase.auth.signOut()
    return { data: null, error: { message: 'Akses ditolak. Email tidak diizinkan.' } }
  }

  return { data, error: null }
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  return { data, error }
}

function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

export function useAuth() {
  return {
    signIn,
    signOut,
    getSession,
    onAuthStateChange,
    isWhitelisted,
  }
}
