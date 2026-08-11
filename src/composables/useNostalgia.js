import { supabase } from '@/lib/supabase'

/**
 * Composable untuk fitur "Pada Hari Ini" — mengambil kenangan nostalgia
 */
export function useNostalgia() {
  /**
   * Ambil kenangan & jurnal di tanggal dan bulan yang sama dari tahun-tahun sebelumnya
   */
  async function fetchOnThisDay() {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    const year = now.getFullYear()

    // Fetch memories on this day in previous years
    const { data: memories, error: memError } = await supabase
      .from('memories')
      .select('*')
      .not('taken_at', 'is', null)
      .order('taken_at', { ascending: false })

    // Fetch journal entries on this day in previous years
    const { data: journals, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter client-side for matching day+month, different year
    const filteredMemories = (memories || []).filter(m => {
      const d = new Date(m.taken_at)
      return d.getMonth() + 1 === month && d.getDate() === day && d.getFullYear() < year
    })

    const filteredJournals = (journals || []).filter(j => {
      const d = new Date(j.created_at)
      return d.getMonth() + 1 === month && d.getDate() === day && d.getFullYear() < year
    })

    return {
      memories: filteredMemories,
      journals: filteredJournals,
      error: memError || journalError,
    }
  }

  /**
   * Ambil kenangan di bulan yang sama tahun lalu
   */
  async function fetchMonthlyMemories() {
    const now = new Date()
    const month = now.getMonth() + 1
    const lastYear = now.getFullYear() - 1
    const startDate = `${lastYear}-${String(month).padStart(2, '0')}-01`
    const endDate = `${lastYear}-${String(month).padStart(2, '0')}-31`

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .gte('taken_at', startDate)
      .lte('taken_at', endDate)
      .order('taken_at', { ascending: true })

    return { data: data || [], error }
  }

  /**
   * Ambil kenangan di tahun yang sama bulan lalu
   */
  async function fetchYearlyMemories() {
    const now = new Date()
    const year = now.getFullYear()
    const lastMonth = now.getMonth() // 0-indexed, so this is actually last month
    const startDate = `${year}-${String(lastMonth).padStart(2, '0')}-01`
    const endDate = `${year}-${String(lastMonth).padStart(2, '0')}-31`

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .gte('taken_at', startDate)
      .lte('taken_at', endDate)
      .order('taken_at', { ascending: true })

    return { data: data || [], error }
  }

  return {
    fetchOnThisDay,
    fetchMonthlyMemories,
    fetchYearlyMemories,
  }
}
