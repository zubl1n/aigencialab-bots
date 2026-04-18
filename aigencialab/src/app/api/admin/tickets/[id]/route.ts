/**
 * PATCH /api/admin/tickets/[id] — Update ticket status/response (admin)
 * Uses service role key + email-based admin verification
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminSB } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { sendTicketReplyEmail, sendTicketStatusEmail } from '@/lib/emails';

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const admin = await verifyAdmin();
  if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { status, admin_response } = body as { status?: string; admin_response?: string };

  const supabase = sb();
  const update: Record<string, any> = { updated_at: new Date().toISOString(), unread_client: true };
  if (status)         update.status         = status;
  if (admin_response) update.admin_response = admin_response;
  if (status === 'resolved') update.resolved_at = new Date().toISOString();

  const { error } = await supabase.from('tickets').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // BUG FIX B1: Insert admin reply into ticket_messages so client chat view shows it
  if (admin_response) {
    const { error: msgErr } = await supabase.from('ticket_messages').insert({
      ticket_id:  id,
      author_id:  admin.id,      // real admin UUID for auditability
      role:       'agent',
      body:       admin_response,
      created_at: new Date().toISOString(),
    });
    if (msgErr) console.error('[B1] ticket_messages insert failed:', msgErr.message);
  }

  // Email notification to client
  const { data: ticket } = await supabase
    .from('tickets').select('client_id, subject').eq('id', id).maybeSingle();

  if (ticket) {
    const { data: client } = await supabase
      .from('clients').select('email, contact_name, company_name, company')
      .eq('id', ticket.client_id).maybeSingle();

    const email = client?.email ?? '';
    const name  = client?.contact_name || client?.company_name || client?.company || 'Cliente';

    if (email) {
      if (admin_response) {
        sendTicketReplyEmail({ email, name, ticketId: id, subject: ticket.subject,
          agentName: 'Equipo AIgenciaLab', replyBody: admin_response, newStatus: update.status })
          .catch(console.error);
      } else if (status) {
        sendTicketStatusEmail({ email, name, ticketId: id, subject: ticket.subject, newStatus: status })
          .catch(console.error);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
