import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, differenceInDays } from 'date-fns'
import { id } from 'date-fns/locale'

/**
 * Format tanggal: "12 Agustus 2026"
 */
export function formatDate(date) {
  return format(new Date(date), 'd MMMM yyyy', { locale: id })
}

/**
 * Format tanggal singkat: "12 Agu 2026"
 */
export function formatDateShort(date) {
  return format(new Date(date), 'd MMM yyyy', { locale: id })
}

/**
 * Format waktu: "14:30"
 */
export function formatTime(date) {
  return format(new Date(date), 'HH:mm', { locale: id })
}

/**
 * Format tanggal + waktu: "12 Agu 2026, 14:30"
 */
export function formatDateTime(date) {
  return format(new Date(date), 'd MMM yyyy, HH:mm', { locale: id })
}

/**
 * Format relatif: "2 jam yang lalu", "3 hari yang lalu"
 */
export function formatRelative(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id })
}

/**
 * Salam sesuai waktu
 */
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 11) return 'Selamat pagi'
  if (hour >= 11 && hour < 15) return 'Selamat siang'
  if (hour >= 15 && hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

/**
 * Hitung countdown: "Hari ini!", "Besok", "Dalam 3 hari"
 */
export function getCountdown(date) {
  const target = new Date(date)
  if (isToday(target)) return 'Hari ini!'
  if (isTomorrow(target)) return 'Besok'
  if (isYesterday(target)) return 'Kemarin'

  const days = differenceInDays(target, new Date())
  if (days > 0 && days <= 30) return `Dalam ${days} hari`
  if (days > 30) return formatDateShort(date)
  if (days < 0 && days >= -30) return `${Math.abs(days)} hari lalu`
  return formatDateShort(date)
}

/**
 * Format nama bulan: "Agustus"
 */
export function getMonthName(monthIndex) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  return months[monthIndex]
}
