/**
 * PATCH /api/v2/tickets/[id] — Update ticket status/response (admin)
 */
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { sendTicketReplyEmail, sendTicketStatusEmail } from '@/lib/emails';

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
    const update: Record<string, any> = { updated_at: new Date().toISOString(), unread_client: true };
    if (status)         update.status        = status;
    if (admin_response) update.admin_response = admin_response;
    if (status === 'resolved') update.resolved_at = new Date().toISOString();

    const { error } = await supabase.from('tickets').update(update).eq('id', id);
    if (error) throw error;

    // ── Fetch ticket + client for professional email notification ─────────────
    const { data: ticket } = await supabase
      .from('tickets')
      .select('client_id, subject')
      .eq('id', id)
      .maybeSingle();

    if (ticket) {
      const { data: client } = await supabase
        .from('clients')
        .select('email, contact_name, company_name, company')
        .eq('id', ticket.client_id)
        .maybeSingle();

      const email = client?.email ?? '';
      const name  = client?.contact_name || client?.company_name || client?.company || 'Cliente';

      if (email) {
        if (admin_response) {
          // Full reply with professional template (BCC admin via sendEmail helper)
          sendTicketReplyEmail({
            email,
            name,
            ticketId:  id,
            subject:   ticket.subject,
            agentName: 'Equipo AIgenciaLab',
            replyBody: admin_response,
            newStatus: update.status,
          }).catch(console.error);
        } else if (status) {
          // Status-only change notification
          sendTicketStatusEmail({
            email,
            name,
            ticketId:  id,
            subject:   ticket.subject,
            newStatus: status,
          }).catch(console.error);
        }
      }
    }

    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
