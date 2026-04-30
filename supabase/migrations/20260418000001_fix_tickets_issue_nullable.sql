-- ═══════════════════════════════════════════════════════════════
--  AIgenciaLab — BLOQUE 1: Fix NOT NULL constraint on tickets.issue
--  Fecha: 2026-04-18
--
--  PROBLEMA:
--    La tabla `tickets` fue creada con `issue text NOT NULL` (schema v1).
--    El sistema de soporte v2 usa `subject` + `message` en su lugar.
--    La API /api/support/tickets hace INSERT sin incluir `issue` → crash.
--
--  SOLUCIÓN:
--    Caso C del prompt: El campo `issue` debería ser opcional.
--    Hacemos DROP NOT NULL y ponemos DEFAULT '' para retrocompatibilidad.
--    La columna sigue existiendo pero ya no bloquea los INSERTs del sistema v2.
-- ═══════════════════════════════════════════════════════════════

-- 1. Eliminar la restricción NOT NULL de issue
ALTER TABLE public.tickets 
  ALTER COLUMN issue DROP NOT NULL;

-- 2. Establecer valor por defecto vacío (retrocompatibilidad con v1)
ALTER TABLE public.tickets 
  ALTER COLUMN issue SET DEFAULT '';

-- 3. Rellenar NULLs existentes con cadena vacía (por si hubiera rows con NULL)
UPDATE public.tickets 
  SET issue = '' 
  WHERE issue IS NULL;

-- 4. Normalizamos el campo status para aceptar los valores del sistema v2
--    El sistema v1 usaba: 'Abierto','En progreso','Esperando cliente','Resuelto'
--    El sistema v2 usa:   'open','in_progress','resolved','closed'
--    Damos soporte a ambos sin dropear la constraint vieja (por si hay datos v1)
DO $$
BEGIN
  -- Eliminar la constraint antigua si existe
  ALTER TABLE public.tickets 
    DROP CONSTRAINT IF EXISTS tickets_status_check;
  
  -- Nueva constraint que soporta AMBOS sistemas (v1 y v2)
  ALTER TABLE public.tickets 
    ADD CONSTRAINT tickets_status_check 
    CHECK (status IN (
      'open', 'in_progress', 'resolved', 'closed',
      'Abierto', 'En progreso', 'Esperando cliente', 'Resuelto'
    ));
EXCEPTION
  WHEN undefined_column THEN NULL;  -- Si status no existe, ignorar
END $$;

-- 5. Normalizar priority constraint para aceptar valores v2
DO $$
BEGIN
  ALTER TABLE public.tickets 
    DROP CONSTRAINT IF EXISTS tickets_priority_check;
  
  ALTER TABLE public.tickets 
    ADD CONSTRAINT tickets_priority_check 
    CHECK (priority IN (
      'low', 'normal', 'medium', 'high', 'urgent',
      'critico', 'alto', 'medio', 'bajo'
    ));
EXCEPTION
  WHEN undefined_column THEN NULL;
END $$;
