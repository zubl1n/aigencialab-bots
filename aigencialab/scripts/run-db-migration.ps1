#!/usr/bin/env pwsh
# run-db-migration.ps1
# Executes all DDL via the /api/internal/run-sql production endpoint.
# Run ONCE after Vercel deploys the latest build.

$SITE   = "https://aigencialab.cl"
$SECRET = "aigencialab-migrations-2026"
$headers = @{
  "x-internal-secret" = $SECRET
  "Content-Type"      = "application/json"
}

$statements = @(
  @{
    name = "Create client_integrations table"
    sql  = @"
CREATE TABLE IF NOT EXISTS public.client_integrations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  integration_key  text NOT NULL,
  enabled          boolean NOT NULL DEFAULT false,
  config           jsonb DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_client_integration UNIQUE (client_id, integration_key)
)
"@
  },
  @{
    name = "Create index on client_integrations"
    sql  = "CREATE INDEX IF NOT EXISTS idx_client_integrations_client_id ON public.client_integrations (client_id)"
  },
  @{
    name = "Enable RLS on client_integrations"
    sql  = "ALTER TABLE public.client_integrations ENABLE ROW LEVEL SECURITY"
  },
  @{
    name = "Drop existing RLS policy"
    sql  = 'DROP POLICY IF EXISTS "clients_own_integrations" ON public.client_integrations'
  },
  @{
    name = "Create RLS policy clients_own_integrations"
    sql  = 'CREATE POLICY "clients_own_integrations" ON public.client_integrations FOR ALL USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid())'
  },
  @{
    name = "Create or replace set_updated_at function"
    sql  = @"
CREATE OR REPLACE FUNCTION public.set_updated_at()
  RETURNS TRIGGER LANGUAGE plpgsql AS
  $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
"@
  },
  @{
    name = "Drop old trigger if exists"
    sql  = "DROP TRIGGER IF EXISTS trg_client_integrations_updated_at ON public.client_integrations"
  },
  @{
    name = "Create updated_at trigger"
    sql  = @"
CREATE TRIGGER trg_client_integrations_updated_at
  BEFORE UPDATE ON public.client_integrations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()
"@
  },
  @{
    name = "Add billing_start_date to subscriptions"
    sql  = "ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS billing_start_date date"
  },
  @{
    name = "Add last_billing_at to subscriptions"  
    sql  = "ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS last_billing_at timestamptz"
  },
  @{
    name = "Add mp_preference_id to subscriptions"
    sql  = "ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS mp_preference_id text"
  }
)

Write-Host "`n🚀 Starting database migration via $SITE`n" -ForegroundColor Cyan
$pass = 0; $fail = 0

foreach ($stmt in $statements) {
  $body = @{ sql = $stmt.sql } | ConvertTo-Json -Compress -Depth 5
  try {
    $r = Invoke-RestMethod `
      -Uri "$SITE/api/internal/run-sql" `
      -Method POST `
      -Headers $headers `
      -Body $body `
      -TimeoutSec 30
    Write-Host "✅ $($stmt.name)" -ForegroundColor Green
    $pass++
  } catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $msg = $_.Exception.Message
    Write-Host "❌ $($stmt.name) (HTTP $statusCode)" -ForegroundColor Red
    Write-Host "   $msg" -ForegroundColor DarkRed
    $fail++
  }
}

Write-Host "`n📊 Migration result: $pass passed, $fail failed`n" -ForegroundColor $(if ($fail -eq 0) {'Green'} else {'Yellow'})

# Verify client_integrations table now exists
Write-Host "🔍 Verifying client_integrations table..." -ForegroundColor Cyan
$env_content = Get-Content "C:\Users\root\Downloads\tcg\aigencialab\.env.local" -Raw
$SRK = ($env_content | Select-String 'SUPABASE_SERVICE_ROLE_KEY="([^"]+)"').Matches.Groups[1].Value -replace "`r","" -replace "`n",""
$URL = ($env_content | Select-String 'NEXT_PUBLIC_SUPABASE_URL="([^"]+)"').Matches.Groups[1].Value.Trim() -replace "`r","" -replace "`n",""

$testHeaders = @{
  "apikey"        = $SRK
  "Authorization" = "Bearer $SRK"
}
try {
  $r = Invoke-RestMethod -Uri "$URL/rest/v1/client_integrations?limit=1" -Headers $testHeaders
  Write-Host "✅ client_integrations table VERIFIED — accessible via Supabase REST" -ForegroundColor Green
} catch {
  Write-Host "❌ client_integrations still not accessible: $($_.Exception.Message)" -ForegroundColor Red
}
