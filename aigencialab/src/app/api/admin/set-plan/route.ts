/**
 * POST /api/admin/set-plan
 * Changes a client's plan. Admin only.
 */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const client_id = formData.get('client_id') as string;
    const plan      = formData.get('plan')      as string;

    const validPlans = ['Starter', 'Pro', 'Business', 'Enterprise'];
    if (!client_id || !validPlans.includes(plan)) {
      return NextResponse.json({ error: 'client_id y plan válido requeridos' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Update client plan
    const { error: clientErr } = await supabase
      .from('clients')
      .update({ plan, updated_at: new Date().toISOString() })
      .eq('id', client_id);

    if (clientErr) throw clientErr;

    // Update subscription plan
    await supabase
      .from('subscriptions')
      .update({ plan })
      .eq('client_id', client_id);

    // Audit log
    await supabase.from('audit_logs').insert({
      event:    'admin_change_plan',
      module:   'admin',
      metadata: { client_id, plan },
    }).then(() => {}).catch(() => {});

    // Redirect back to clients list
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/clientes' },
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
