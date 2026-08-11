// TellMe — Edge Function: send-event-reminder
// Mengirim email reminder untuk event yang terjadi dalam 24 jam ke depan
// Deploy: supabase functions deploy send-event-reminder

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

// Email whitelist — ganti dengan email asli
const WHITELIST_EMAILS = [
  Deno.env.get('WHITELIST_EMAIL_1') || 'email_anda@domain.com',
  Deno.env.get('WHITELIST_EMAIL_2') || 'email_pasangan@domain.com',
]

Deno.serve(async (req) => {
  try {
    // Inisialisasi Supabase client dengan service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Hitung range 24 jam ke depan
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Ambil events yang terjadi dalam 24 jam ke depan
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_time', now.toISOString())
      .lte('start_time', tomorrow.toISOString())
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching events:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ message: 'Tidak ada event dalam 24 jam ke depan' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Format email content
    const eventList = events.map((event) => {
      const startTime = new Date(event.start_time).toLocaleString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      return `
        <div style="padding: 16px; margin-bottom: 12px; background: #f0fdfa; border-radius: 12px; border-left: 4px solid #0891b2;">
          <h3 style="margin: 0 0 4px; color: #0f172a; font-size: 16px;">${event.title}</h3>
          <p style="margin: 0; color: #64748b; font-size: 14px;">📅 ${startTime}</p>
          ${event.location ? `<p style="margin: 4px 0 0; color: #64748b; font-size: 14px;">📍 ${event.location}</p>` : ''}
          ${event.description ? `<p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">${event.description}</p>` : ''}
        </div>
      `
    }).join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Inter', Arial, sans-serif; background: #f0fdfa; padding: 32px;">
        <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 48px; height: 48px; background: linear-gradient(135deg, #0891b2, #14b8a6); border-radius: 12px; line-height: 48px; color: white; font-weight: bold; font-size: 24px;">T</div>
            <h1 style="margin: 12px 0 4px; color: #0f172a; font-size: 20px;">Pengingat Agenda 💙</h1>
            <p style="margin: 0; color: #64748b; font-size: 14px;">Ada ${events.length} agenda dalam 24 jam ke depan</p>
          </div>
          ${eventList}
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 24px;">
            Dikirim oleh TellMe — Ruang privat untuk kita berdua
          </p>
        </div>
      </body>
      </html>
    `

    // Kirim email via Resend API ke kedua user
    const emailPromises = WHITELIST_EMAILS.filter(Boolean).map(async (email) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'TellMe <onboarding@resend.dev>',
          to: [email],
          subject: `📅 Pengingat: ${events.length} agenda dalam 24 jam`,
          html: htmlContent,
        }),
      })

      if (!response.ok) {
        const errBody = await response.text()
        console.error(`Failed to send email to ${email}:`, errBody)
      }

      return response.ok
    })

    const results = await Promise.all(emailPromises)
    const successCount = results.filter(Boolean).length

    return new Response(
      JSON.stringify({
        message: `Reminder terkirim ke ${successCount}/${WHITELIST_EMAILS.length} email`,
        events_count: events.length,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
