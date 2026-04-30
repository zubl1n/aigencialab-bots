-- MIGRATION_TICKETS_V2.sql
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new

-- 1. Add missing columns to tickets table
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS unread_client BOOLEAN DEFAULT false;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS unread_admin BOOLEAN DEFAULT true;

-- 2. Create ticket_messages table for conversation threads
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  author_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'agent')),
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on ticket_messages
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- 4. Policy: clients can read messages from their own tickets
DROP POLICY IF EXISTS "client_read_own_messages" ON ticket_messages;
CREATE POLICY "client_read_own_messages" ON ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_messages.ticket_id
        AND tickets.client_id = auth.uid()
    )
  );

-- 5. Policy: service role has full access (for admin API)
DROP POLICY IF EXISTS "service_role_all_messages" ON ticket_messages;
CREATE POLICY "service_role_all_messages" ON ticket_messages
  FOR ALL USING (auth.role() = 'service_role');

-- 6. Policy: clients can insert their own messages
DROP POLICY IF EXISTS "client_insert_own_messages" ON ticket_messages;
CREATE POLICY "client_insert_own_messages" ON ticket_messages
  FOR INSERT WITH CHECK (
    author_id = auth.uid()::text
    AND EXISTS (
      SELECT 1 FROM tickets
      WHERE tickets.id = ticket_messages.ticket_id
        AND tickets.client_id = auth.uid()
    )
  );
