/**
 * GET /api/conversations/[id]/messages
 * Returns real messages for a specific conversation, owned by the authenticated client.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getAuthUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch { return null; }
}

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: convId } = await params;
  const supabase = adminClient();

  // Verify the conversation belongs to this client
  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('id, contact_name, status, channel, created_at, updated_at, client_id')
    .eq('id', convId)
    .eq('client_id', userId)
    .single();

  if (convErr || !conv) {
    return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
  }

  // Fetch real messages
  const { data: messages, error: msgErr } = await supabase
    .from('messages')
    .select('id, role, content, created_at, metadata')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true });

  if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

  // Check for linked lead
  const { data: lead } = await supabase
    .from('leads')
    .select('id, contact_name, status')
    .eq('conversation_id', convId)
    .maybeSingle();

  return NextResponse.json({
    conversation: conv,
    messages: messages ?? [],
    lead: lead ?? null,
  });
}
