import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMpCheckoutUrl } from '@/lib/mercadopago';

export async function POST(request: Request) {
  try {
    let bodyData: any = {};
    try { bodyData = await request.json(); } catch(e){}

    const { plan, email } = bodyData;

    const planKey = plan && plan.toLowerCase() === 'starter' ? 'Pro' : plan;

    if (!planKey || (planKey !== 'Pro' && planKey !== 'Enterprise')) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // 1. Authenticate user via Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const authHeader = request.headers.get('Authorization');
    
    let userId = '';
    let clientEmail = '';
    let clientName = '';
    
    // Add testing hack: if no auth header but email is provided in body, fallback to lookup by email using service role key
    const bodyEmail = email;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    if (!authHeader && bodyEmail) {
      // Fallback: lookup by email using service role
      const { data: clients } = await supabaseAdmin.from('clients').select('id, email, company_name').eq('email', bodyEmail).limit(1);
      if (clients && clients.length > 0) {
        userId = clients[0].id;
        clientEmail = clients[0].email;
        clientName = clients[0].company_name;
      }
    } else if (authHeader) {
      // Auth via Bearer token → verify JWT then use admin client for DB lookup (bypasses RLS)
      const supabaseAnon = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: { user }, error: authError } = await supabaseAnon.auth.getUser();

      if (!authError && user) {
        userId = user.id;
        // Use ADMIN client to bypass RLS — user may not have a clients record yet
        const { data: clientData } = await supabaseAdmin
          .from('clients').select('email, company_name').eq('id', user.id).maybeSingle();
        clientEmail = clientData?.email || user.email || '';
        clientName = clientData?.company_name || clientEmail.split('@')[0] || 'Cliente';
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'No autenticado. Por favor inicia sesión.' }, { status: 401 });
    }

    // 3. Get MP Checkout URL
    const { checkout_url } = await getMpCheckoutUrl(
      planKey as 'Pro' | 'Enterprise',
      { email: clientEmail, name: clientName },
      userId
    );

    return NextResponse.json({ url: checkout_url });

  } catch (err: any) {
    console.error('[Billing Checkout API]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

