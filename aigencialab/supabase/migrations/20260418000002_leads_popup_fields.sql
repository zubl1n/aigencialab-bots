-- ═══════════════════════════════════════════════════════════════
--  AIgenciaLab — BLOQUE 5: Leads table for popup lead generation
--  Fecha: 2026-04-18
--
--  CAMBIOS:
--    1. Agrega columna `offer` para trackear la oferta del popup
--    2. Extiende el CHECK de `source` con 'popup_landing'
--    3. La tabla `leads` ya existe — todo idempotente con IF NOT EXISTS
-- ═══════════════════════════════════════════════════════════════

-- 1. Agregar columna `offer` (oferta presentada al lead, ej: 'auditoria_gratis_14dias')
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS offer TEXT;

-- 2. Extender el CHECK constraint de `source` para incluir popup_landing
--    Eliminamos el viejo y creamos uno nuevo con el valor adicional
DO $$
BEGIN
  ALTER TABLE public.leads 
    DROP CONSTRAINT IF EXISTS leads_source_check;

  ALTER TABLE public.leads 
    ADD CONSTRAINT leads_source_check 
    CHECK (source IN ('audit', 'manual', 'whatsapp', 'landing', 'popup_landing'));
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;

-- 3. Índice para búsqueda por offer (opcional, útil para tracking de campañas)
CREATE INDEX IF NOT EXISTS idx_leads_offer ON public.leads(offer) WHERE offer IS NOT NULL;
