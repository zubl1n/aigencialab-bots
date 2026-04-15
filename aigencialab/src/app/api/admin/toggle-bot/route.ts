import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Support both FormData (HTML form) and JSON (fetch)
    const contentType = request.headers.get('content-type') ?? '';
    let clientId: string | null = null;
    let botId: string | null = null;
    let active = false;

    if (contentType.includes('application/json')) {
      const body = await request.json();
      clientId = body.client_id ?? null;
      botId = body.bot_id ?? null;
      active = body.active === true || body.active === 'true';
    } else {
      const formData = await request.formData();
      botId = formData.get('bot_id') as string | null;
      clientId = formData.get('client_id') as string | null;
      active = formData.get('active') === 'true';
    }

    if (!botId && !clientId) {
      return NextResponse.json({ error: 'Missing bot_id or client_id' }, { status: 400 });
    }

    // Update bot_configs
    let updateResult;
    if (botId) {
      updateResult = await supabase.from('bot_configs').update({ active }).eq('id', botId);
    } else if (clientId) {
      updateResult = await supabase.from('bot_configs').update({ active }).eq('client_id', clientId);
    }

    if (updateResult?.error) {
      console.error('[toggle-bot] Update error:', updateResult.error);
      return NextResponse.json({ error: 'Failed to update bot' }, { status: 500 });
    }

    // Log action in audit_logs
    await supabase.from('audit_logs').insert({
      event: active ? 'bot_activated' : 'bot_deactivated',
      module: 'admin',
      metadata: {
        client_id: clientId,
        bot_id: botId,
        new_state: active,
        timestamp: new Date().toISOString(),
      },
    });

    // If this was a form submission, redirect back
    if (contentType.includes('form')) {
      const referer = request.headers.get('referer') ?? '/admin/clientes';
      return NextResponse.redirect(referer, { status: 303 });
    }

    return NextResponse.json({ success: true, active });
  } catch (err) {
    console.error('[toggle-bot]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
