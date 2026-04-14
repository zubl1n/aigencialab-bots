import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const formData = await request.formData();
    const botId = formData.get('bot_id') as string | null;
    const clientId = formData.get('client_id') as string | null;
    const active = formData.get('active') === 'true';

    if (botId) {
      await supabase.from('bot_configs').update({ active }).eq('id', botId);
    } else if (clientId) {
      await supabase.from('bot_configs').update({ active }).eq('client_id', clientId);
    } else {
      return NextResponse.json({ error: 'Missing bot_id or client_id' }, { status: 400 });
    }

    // Redirect back to referring page
    const referer = request.headers.get('referer') ?? '/admin';
    return NextResponse.redirect(referer, { status: 303 });
  } catch (err) {
    console.error('[toggle-bot]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
