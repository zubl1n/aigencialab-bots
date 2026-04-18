/**
 * GET /api/admin/tickets — List ALL tickets (admin only, service role)
 * Protected by checking that user is authenticated + exists in admin whitelist
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminSB } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    // Allow if role in metadata OR if email is admin email
    const isAdmin =
      user.app_metadata?.role === 'admin' ||
      user.user_metadata?.role === 'admin' ||
      user.email === process.env.ADMIN_EMAIL ||
      user.email === (process.env.ADMIN_NOTIFICATION_EMAIL ?? 'admin@aigencialab.cl');
    return isAdmin ? user : null;
  } catch { return null; }
}

function sb() {
  return createAdminSB(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(_req: NextRequest) {
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const supabase = sb();

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, subject, message, status, priority, created_at, updated_at, admin_response, client_id')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with client info
  const ids = [...new Set((tickets ?? []).map(t => t.client_id).filter(Boolean))];
  const { data: clients } = ids.length > 0
    ? await supabase.from('clients').select('id, email, company_name, company').in('id', ids)
    : { data: [] };

  const clientMap = Object.fromEntries((clients ?? []).map(c => [c.id, c]));
  const enriched = (tickets ?? []).map(t => ({ ...t, client: clientMap[t.client_id] ?? null }));

  return NextResponse.json({ tickets: enriched });
}
