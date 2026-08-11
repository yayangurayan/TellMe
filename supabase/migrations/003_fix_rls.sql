-- ============================================
-- TellMe — Fix RLS Policies
-- Removes hardcoded emails and replaces them with dynamic auth checks
-- ============================================

-- ---- PROFILES ----
DROP POLICY IF EXISTS "Whitelist users can view all profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view all profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ---- MEMORIES ----
DROP POLICY IF EXISTS "Whitelist users can view all memories" ON public.memories;
CREATE POLICY "Authenticated users can view all memories"
  ON public.memories FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Whitelist users can insert memories" ON public.memories;
CREATE POLICY "Authenticated users can insert memories"
  ON public.memories FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ---- JOURNAL_ENTRIES ----
DROP POLICY IF EXISTS "Whitelist users can view all journals" ON public.journal_entries;
CREATE POLICY "Authenticated users can view all journals"
  ON public.journal_entries FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Whitelist users can insert journals" ON public.journal_entries;
CREATE POLICY "Authenticated users can insert journals"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ---- JOURNAL_REACTIONS ----
DROP POLICY IF EXISTS "Whitelist users can view all reactions" ON public.journal_reactions;
CREATE POLICY "Authenticated users can view all reactions"
  ON public.journal_reactions FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Whitelist users can insert reactions" ON public.journal_reactions;
CREATE POLICY "Authenticated users can insert reactions"
  ON public.journal_reactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- ---- EVENTS ----
DROP POLICY IF EXISTS "Whitelist users can view all events" ON public.events;
CREATE POLICY "Authenticated users can view all events"
  ON public.events FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Whitelist users can insert events" ON public.events;
CREATE POLICY "Authenticated users can insert events"
  ON public.events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Whitelist users can update events" ON public.events;
CREATE POLICY "Authenticated users can update events"
  ON public.events FOR UPDATE
  USING (auth.role() = 'authenticated');

-- ---- STORAGE OBJECTS ----
DROP POLICY IF EXISTS "Whitelist users can upload files" ON storage.objects;
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'memories-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Whitelist users can view files" ON storage.objects;
CREATE POLICY "Authenticated users can view files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'memories-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Whitelist users can update files" ON storage.objects;
CREATE POLICY "Authenticated users can update files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'memories-media' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Whitelist users can delete files" ON storage.objects;
CREATE POLICY "Authenticated users can delete files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'memories-media' AND auth.role() = 'authenticated');
