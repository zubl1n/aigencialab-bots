/**
 * GET /api/v2/tickets — List tickets (admin: all, client: own)
 * POST /api/v2/tickets — Create ticket (client)
 */
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user } } = await anonClient.auth.getUser();
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

    const supabase = getAdminClient();
    const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';

    let query = supabase
      .from('tickets')
      .select(`
        id, subject, message, status, priority, created_at, updated_at,
        resolved_at, admin_response, client_id
      `)
      .order('created_at', { ascending: false });

    if (!isAdmin) {
      query = query.eq('client_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    // For admin, enrich with client email
    if (isAdmin && data) {
      const clientIds = [...new Set(data.map(t => t.client_id).filter(Boolean))];
      const { data: clientRows } = await supabase
        .from('clients')
        .select('id, email, company_name, company')
        .in('id', clientIds);

      const clientMap = Object.fromEntries((clientRows ?? []).map(c => [c.id, c]));
      const enriched = data.map(t => ({
        ...t,
        client: clientMap[t.client_id] ?? null,
      }));
      return Response.json({ tickets: enriched });
    }

    return Response.json({ tickets: data ?? [] });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser(req);
    if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { subject, message, priority = 'medium' } = body as {
      subject?: string;
      message?: string;
      priority?: string;
    };

    if (!subject?.trim() || !message?.trim()) {
      return Response.json({ error: 'Asunto y mensaje son requeridos' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        client_id: user.id,
        subject: subject.trim(),
        message: message.trim(),
        priority,
        status: 'open',
      })
      .select('id')
      .single();

    if (error) throw error;

    // Notify admin
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey && !resendKey.includes('REPLACE')) {
      const { data: clientRow } = await supabase
        .from('clients')
        .select('email, company_name')
        .eq('id', user.id)
        .maybeSingle();

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL ?? 'noreply@aigencialab.cl',
          to: process.env.ADMIN_NOTIFICATION_EMAIL ?? 'admin@aigencialab.cl',
          subject: `[AIgenciaLab] Nuevo Ticket · ${subject} · ${clientRow?.company_name ?? user.email}`,
          html: `<p><strong>Cliente:</strong> ${clientRow?.company_name ?? ''} (${user.email})</p>
                 <p><strong>Asunto:</strong> ${subject}</p>
                 <p><strong>Mensaje:</strong> ${message}</p>
                 <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/tickets">Ver en admin →</a></p>`,
        }),
      }).catch(console.error);
    }

    return Response.json({ ok: true, id: data?.id });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
