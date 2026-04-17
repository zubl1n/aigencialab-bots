/**
 * PATCH /api/v2/tickets/[id] — Update ticket status/response (admin)
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await getUser(req);
    if (!user) return Response.json({ error: 'No autenticado' }, { status: 401 });

    const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin';
    if (!isAdmin) return Response.json({ error: 'No autorizado' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { status, admin_response } = body as { status?: string; admin_response?: string };

    const supabase = getAdminClient();
    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) update.status = status;
    if (admin_response) update.admin_response = admin_response;
    if (status === 'resolved') update.resolved_at = new Date().toISOString();

    const { error } = await supabase
      .from('tickets')
      .update(update)
      .eq('id', id);

    if (error) throw error;

    // Notify client if responded
    if (admin_response) {
      const { data: ticket } = await supabase
        .from('tickets')
        .select('client_id, subject')
        .eq('id', id)
        .single();

      if (ticket) {
        const { data: client } = await supabase
          .from('clients')
          .select('email')
          .eq('id', ticket.client_id)
          .single();

        if (client?.email) {
          const key = process.env.RESEND_API_KEY;
          if (key && !key.includes('REPLACE')) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
              body: JSON.stringify({
                from: process.env.RESEND_FROM_EMAIL ?? 'noreply@aigencialab.cl',
                to: client.email,
                subject: `[AIgenciaLab] Respuesta a tu ticket: ${ticket.subject}`,
                html: `<p>El equipo de AIgenciaLab respondió a tu ticket:</p>
                       <blockquote style="border-left: 3px solid #1d4ed8; padding-left: 12px; color: #475569;">${admin_response}</blockquote>
                       <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/support">Ver en tu panel →</a></p>`,
              }),
            }).catch(console.error);
          }
        }
      }
    }

    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
