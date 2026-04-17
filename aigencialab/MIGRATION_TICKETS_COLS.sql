-- MIGRATION_TICKETS_COLS.sql
-- Ejecutar en: https://supabase.com/dashboard/project/hmnbbzpucefcldziwrvs/sql/new
-- 
-- DIAGNÓSTICO: La tabla 'tickets' existía antes con columnas distintas.
-- Hay que agregar todas las columnas del sistema de soporte v2.

-- Columnas core del sistema de tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS subject TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS admin_response TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
