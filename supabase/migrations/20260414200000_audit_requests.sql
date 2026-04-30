-- Migration: audit_requests table for /audit lead magnet
-- Run in Supabase SQL Editor if not using CLI migrations

CREATE TABLE IF NOT EXISTS audit_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  empresa text NOT NULL,
  email text NOT NULL,
  telefono text,
  sitio_web text,
  industria text,
  empleados text,
  desafio text,
  consultas_mensuales text,
  status text DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'entregada')),
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE audit_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (insert) an audit request
CREATE POLICY IF NOT EXISTS "Public insert audit_requests"
  ON audit_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY IF NOT EXISTS "Admin read audit_requests"
  ON audit_requests FOR SELECT TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );

-- Only admins can update status
CREATE POLICY IF NOT EXISTS "Admin update audit_requests"
  ON audit_requests FOR UPDATE TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'admin'
    OR auth.jwt() -> 'app_metadata' ->> 'role' = 'admin'
  );
