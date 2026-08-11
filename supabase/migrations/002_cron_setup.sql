-- ============================================
-- TellMe — Cron Job Setup
-- Menjalankan Edge Function send-event-reminder setiap hari jam 08:00 WIB (01:00 UTC)
-- ============================================

-- Pastikan pg_cron dan pg_net sudah di-enable di Supabase Dashboard → Extensions

-- Simpan project URL dan service role key di Vault
-- Ganti nilai di bawah ini dengan credential project Supabase kamu!

-- SELECT vault.create_secret('https://YOUR_PROJECT_REF.supabase.co', 'project_url');
-- SELECT vault.create_secret('YOUR_SERVICE_ROLE_KEY', 'service_role_key');

-- Schedule cron job: setiap hari jam 01:00 UTC (08:00 WIB)
SELECT cron.schedule(
  'send-event-reminder-daily',
  '0 1 * * *',
  $$
  SELECT net.http_post(
    url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/send-event-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key')
    ),
    body := jsonb_build_object('trigger', 'daily_reminder')
  ) AS request_id;
  $$
);

-- ============================================
-- Untuk menghapus cron job:
-- SELECT cron.unschedule('send-event-reminder-daily');
--
-- Untuk melihat semua cron jobs:
-- SELECT * FROM cron.job;
-- ============================================
