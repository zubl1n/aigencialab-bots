-- ════════════════════════════════════════════════════
-- PATCH B1: Crear tabla ticket_messages (Fix Bug B1)
-- Ejecutar en Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new
-- ════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id  UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id  TEXT NOT NULL DEFAULT 'client',
  role       TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client','agent','system')),
  body       TEXT NOT NULL DEFAULT '',
  attachments TEXT[] DEFAULT '{}',
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.ticket_messages(ticket_id, created_at ASC);

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Clients can see messages from their own tickets
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_see_own_ticket_messages') THEN
    CREATE POLICY client_see_own_ticket_messages ON public.ticket_messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = ticket_messages.ticket_id
            AND t.client_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Clients can insert messages in their own tickets
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_insert_own_ticket_messages') THEN
    CREATE POLICY client_insert_own_ticket_messages ON public.ticket_messages
      FOR INSERT WITH CHECK (
        role = 'client' AND
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = ticket_messages.ticket_id
            AND t.client_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Migrate existing ticket data: if ticket has admin_response, create a message
INSERT INTO public.ticket_messages (ticket_id, author_id, role, body, created_at)
SELECT
  id,
  'admin',
  'agent',
  admin_response,
  COALESCE(updated_at, now())
FROM public.tickets
WHERE admin_response IS NOT NULL
  AND admin_response <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.ticket_messages tm
    WHERE tm.ticket_id = tickets.id AND tm.role = 'agent'
  );

-- Also migrate initial messages from tickets.issue column
INSERT INTO public.ticket_messages (ticket_id, author_id, role, body, created_at)
SELECT
  id,
  client_id::text,
  'client',
  COALESCE(issue, message, subject, 'Sin mensaje'),
  created_at
FROM public.tickets t
WHERE NOT EXISTS (
  SELECT 1 FROM public.ticket_messages tm
  WHERE tm.ticket_id = t.id AND tm.role = 'client'
)
AND (issue IS NOT NULL OR message IS NOT NULL)
AND COALESCE(issue, message, '') <> '';

SELECT 'ticket_messages table ready ✅' AS result;
