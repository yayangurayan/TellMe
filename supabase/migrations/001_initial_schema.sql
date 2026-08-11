-- ============================================
-- TellMe — Database Schema & Security
-- Initial Migration
-- ============================================

-- Ganti email di bawah ini dengan email kamu & pasangan
-- Pastikan kedua email ini sudah dibuat manual di Supabase Auth Dashboard
-- ============================================

-- ============================================
-- 1. TABEL: profiles
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile saat user baru dibuat
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger untuk auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 2. TABEL: memories
-- ============================================
CREATE TABLE IF NOT EXISTS public.memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL,
  description TEXT,
  taken_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_taken_at ON public.memories(taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON public.memories(user_id);

-- ============================================
-- 3. TABEL: journal_entries
-- ============================================
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  mood TEXT CHECK (mood IN ('happy', 'sad', 'tired', 'love', 'angry', 'peaceful', 'sick', 'excited')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON public.journal_entries(mood);
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON public.journal_entries(user_id);

-- ============================================
-- 4. TABEL: journal_reactions
-- ============================================
CREATE TABLE IF NOT EXISTS public.journal_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID REFERENCES public.journal_entries(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('❤️', '🤗', '😂', '😢')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entry_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_journal_reactions_entry_id ON public.journal_reactions(entry_id);

-- ============================================
-- 5. TABEL: events
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_start_time ON public.events(start_time);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- Hanya 2 email yang di-whitelist bisa akses
-- ============================================

-- GANTI EMAIL DI BAWAH INI!
-- Contoh: 'aku@gmail.com', 'dia@gmail.com'

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- ---- profiles ----
CREATE POLICY "Whitelist users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Allow profile creation via trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ---- memories ----
CREATE POLICY "Whitelist users can view all memories"
  ON public.memories FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com'));

CREATE POLICY "Whitelist users can insert memories"
  ON public.memories FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com'));

CREATE POLICY "Users can delete own memories"
  ON public.memories FOR DELETE
  USING (auth.uid() = user_id);

-- ---- journal_entries ----
CREATE POLICY "Whitelist users can view all journals"
  ON public.journal_entries FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com'));

CREATE POLICY "Whitelist users can insert journals"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com'));

CREATE POLICY "Users can delete own journals"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ---- journal_reactions ----
CREATE POLICY "Whitelist users can view all reactions"
  ON public.journal_reactions FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com'));

CREATE POLICY "Whitelist users can insert reactions"
  ON public.journal_reactions FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com'));

CREATE POLICY "Users can delete own reactions"
  ON public.journal_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ---- events ----
CREATE POLICY "Whitelist users can view all events"
  ON public.events FOR SELECT
  USING (auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com'));

CREATE POLICY "Whitelist users can insert events"
  ON public.events FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com'));

CREATE POLICY "Whitelist users can update events"
  ON public.events FOR UPDATE
  USING (auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com'));

CREATE POLICY "Users can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = created_by);

-- ============================================
-- 7. ENABLE REALTIME untuk journal_reactions
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.journal_reactions;

-- ============================================
-- 8. STORAGE BUCKET: memories-media
-- ============================================
-- Jalankan ini di SQL Editor Supabase:

INSERT INTO storage.buckets (id, name, public)
VALUES ('memories-media', 'memories-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Whitelist users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'memories-media'
    AND auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com')
  );

CREATE POLICY "Whitelist users can view files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'memories-media'
    AND auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com')
  );

CREATE POLICY "Whitelist users can update files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'memories-media'
    AND auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com')
  );

CREATE POLICY "Whitelist users can delete files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'memories-media'
    AND auth.jwt() ->> 'email' IN ('email_anda@domain.com', 'email_pasangan@domain.com')
  );

-- ============================================
-- DONE! 🎉
-- Jangan lupa:
-- 1. Ganti semua 'email_anda@domain.com' dan 'email_pasangan@domain.com'
--    dengan email asli kamu dan pasangan
-- 2. Buat 2 user manual di Supabase Dashboard → Authentication → Users
-- 3. Matikan "Enable Email Signup" di Auth Settings
-- ============================================
