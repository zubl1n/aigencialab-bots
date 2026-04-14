-- Migration for Fase 4: Widget & CRM Integration
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Update conversations table ──────────────────────────────
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS lead_detected BOOLEAN DEFAULT false;
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- ── 2. Update leads table ──────────────────────────────────────
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS captured_at TIMESTAMPTZ DEFAULT NOW();

-- ── 3. RLS Policies for conversations and messages (for widget) ─
-- Allow the system (Edge Functions) to insert messages
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Admin (Service Role) can do everything (default)
-- For public usage via Edge Functions, we typically use the Service Role inside the function.
-- However, we should ensure clients can see their own conversations in the dashboard.
DROP POLICY IF EXISTS "Clients can view their own conversations" ON public.conversations;
CREATE POLICY "Clients can view their own conversations" ON public.conversations
    FOR ALL USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Clients can view messages of their conversations" ON public.messages;
CREATE POLICY "Clients can view messages of their conversations" ON public.messages
    FOR ALL USING (
        conversation_id IN (
            SELECT id FROM public.conversations WHERE client_id = auth.uid()
        )
    );

-- ── 4. Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON public.conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_leads_conversation_id ON public.leads(conversation_id);
