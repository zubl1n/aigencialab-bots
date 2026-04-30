/**
 * GET /api/conversations
 * Returns real conversations for the authenticated client with real message counts.
 * Query params:
 *   status: 'open' | 'resolved' | 'needs_human' | 'all' (default: 'all')
 *   q: search term (searches contact_name)
 *   limit: number (default 50)
 *   offset: number (default 0)
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

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status  = searchParams.get('status') ?? 'all';
  const q       = searchParams.get('q') ?? '';
  const limit   = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
  const offset  = parseInt(searchParams.get('offset') ?? '0');

  const supabase = adminClient();

  // Build conversation query
  let query = supabase
    .from('conversations')
    .select(`
      id,
      contact_name,
      contact_email,
      contact_phone,
      status,
      channel,
      created_at,
      updated_at
    `)
    .eq('client_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (q) {
    query = query.ilike('contact_name', `%${q}%`);
  }

  const { data: convs, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!convs || convs.length === 0) {
    return NextResponse.json({ conversations: [] });
  }

  // Fetch real message counts per conversation using a single aggregation query
  const convIds = convs.map(c => c.id);

  const { data: msgCounts } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', convIds);

  // Count messages per conversation
  const countMap: Record<string, number> = {};
  for (const m of (msgCounts ?? [])) {
    countMap[m.conversation_id] = (countMap[m.conversation_id] ?? 0) + 1;
  }

  // Check which conversations have a linked lead
  const { data: linkedLeads } = await supabase
    .from('leads')
    .select('conversation_id, id')
    .in('conversation_id', convIds);

  const leadMap: Record<string, string> = {};
  for (const l of (linkedLeads ?? [])) {
    if (l.conversation_id) leadMap[l.conversation_id] = l.id;
  }

  // Enrich conversations with real counts
  const enriched = convs.map(c => {
    const messages_count = countMap[c.id] ?? 0;
    const is_lead = !!leadMap[c.id];
    const lead_id = leadMap[c.id] ?? null;

    // Estimate duration from created_at → updated_at (in minutes)
    const start = new Date(c.created_at).getTime();
    const end   = new Date(c.updated_at ?? c.created_at).getTime();
    const duration_min = Math.max(1, Math.round((end - start) / 60000));

    return {
      ...c,
      messages_count,
      duration_min,
      is_lead,
      lead_id,
    };
  });

  return NextResponse.json({ conversations: enriched });
}
