import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMpSubscription, cancelMpSubscription } from '@/lib/mercadopago';

// Esta ruta recibe IPNs de MercadoPago
export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const action = request.method === 'POST' ? await request.json() : null;
    
    // IPN structure varies. Usually we look for type='subscription_preapproval' and action='created' / 'updated'
    const type = url.searchParams.get('type') || action?.type;
    const dataId = url.searchParams.get('data.id') || action?.data?.id;

    if (!dataId) {
       return NextResponse.json({ error: 'Missing data.id' }, { status: 400 });
    }

    // Supabase service client to bypass RLS for webhook updates
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseKey) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY is not set. Webhooks might fail RLS.');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (type === 'subscription_preapproval' || action?.type === 'subscription_preapproval') {
      let sub;
      try {
        sub = await getMpSubscription(dataId);
      } catch (e: any) {
        if (e.message && e.message.includes('404')) {
          console.log('[Webhook] Preapproval not found (likely a test ping), ignoring safely.');
          return NextResponse.json({ success: true, message: 'Test or not found' });
        }
        throw e;
      }
      
      const clientId = sub.external_reference; // We passed client_id here during creation
      if (!clientId) {
        console.error('Subscription has no external_reference (client_id)', sub);
        return NextResponse.json({ ok: true });
      }

      const status = sub.status; // 'authorized', 'paused', 'cancelled'
      let planName = 'Starter';
      const planId = sub.preapproval_plan_id;
      
      if (planId === process.env.MP_PLAN_PRO_ID) planName = 'Pro';
      if (planId === process.env.MP_PLAN_ENTERPRISE_ID) planName = 'Enterprise';

      if (status === 'authorized') {
        // Update subscriptions table (column is 'plan' not 'plan_name')
        await supabase
          .from('subscriptions')
          .update({
             status: 'active',
             plan: planName,
             mp_subscription_id: sub.id,
             current_period_end: sub.next_payment_date
          })
          .eq('client_id', clientId);

        await supabase
          .from('clients')
          .update({ plan: planName, payment_status: 'active' })
          .eq('id', clientId);

        await supabase
          .from('billing_profiles')
          .upsert({ client_id: clientId, mp_customer_id: sub.payer_id });

      } else if (status === 'cancelled' || status === 'paused') {
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled', plan: 'Starter' })
          .eq('client_id', clientId);

        await supabase
          .from('clients')
          .update({ plan: 'Starter' })
          .eq('id', clientId);
      }
    } else if (type === 'payment' || action?.type === 'payment') {
      // Payment logic 
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[MP Webhook Error]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
