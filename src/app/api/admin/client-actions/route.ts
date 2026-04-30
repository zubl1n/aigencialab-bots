import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const formData = await request.formData();
    const clientId = formData.get('client_id') as string;
    const action = formData.get('action') as string;

    if (!clientId || !action) {
      return NextResponse.json({ error: 'Missing client_id or action' }, { status: 400 });
    }

    let result: any = { success: true };

    switch (action) {
      case 'change_plan': {
        const newPlan = formData.get('new_plan') as string;
        if (!newPlan) {
          return NextResponse.json({ error: 'Missing new_plan' }, { status: 400 });
        }
        await supabase.from('clients').update({ plan: newPlan }).eq('id', clientId);
        await supabase.from('subscriptions').update({ plan: newPlan }).eq('client_id', clientId);
        result.message = `Plan cambiado a ${newPlan}`;
        break;
      }

      case 'extend_trial': {
        const days = parseInt(formData.get('days') as string, 10) || 14;
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('trial_ends_at, current_period_end')
          .eq('client_id', clientId)
          .single();

        const baseDate = sub?.trial_ends_at ? new Date(sub.trial_ends_at) : new Date();
        const newEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

        await supabase.from('subscriptions').update({
          trial_ends_at: newEnd.toISOString(),
          current_period_end: newEnd.toISOString(),
          status: 'trialing',
        }).eq('client_id', clientId);

        await supabase.from('clients').update({
          trial_ends_at: newEnd.toISOString(),
        }).eq('id', clientId);

        result.message = `Trial extendido ${days} días hasta ${newEnd.toLocaleDateString('es-CL')}`;
        break;
      }

      case 'reset_api_key': {
        // Delete old keys and create new one
        await supabase.from('api_keys').delete().eq('client_id', clientId);
        await supabase.from('api_keys').insert({ client_id: clientId });
        result.message = 'API Key reseteada';
        break;
      }

      case 'suspend': {
        await supabase.from('clients').update({ status: 'suspended' }).eq('id', clientId);
        await supabase.from('bot_configs').update({ active: false }).eq('client_id', clientId);
        await supabase.from('subscriptions').update({ status: 'canceled' }).eq('client_id', clientId);
        result.message = 'Cuenta suspendida';
        break;
      }

      case 'reactivate': {
        await supabase.from('clients').update({ status: 'active' }).eq('id', clientId);
        await supabase.from('subscriptions').update({ status: 'active' }).eq('client_id', clientId);
        result.message = 'Cuenta reactivada';
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    // Log admin action
    await supabase.from('audit_logs').insert({
      event: `admin_action_${action}`,
      module: 'admin',
      metadata: {
        client_id: clientId,
        action,
        details: result.message,
        timestamp: new Date().toISOString(),
      },
    });

    // Redirect back to client detail page
    const referer = request.headers.get('referer') ?? `/admin/clientes/${clientId}`;
    return NextResponse.redirect(referer, { status: 303 });
  } catch (err) {
    console.error('[client-actions]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
