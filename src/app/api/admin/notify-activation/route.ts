import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase/server';
import { sendBotActivationEmail } from '@/lib/resend';

export async function POST(req: NextRequest) {
  try {
    const { clientId } = await req.json();

    if (!clientId) {
      return NextResponse.json({ error: 'Falta el id del cliente' }, { status: 400 });
    }

    const supabase = createAdminSupabase();

    // Fetch client and bot info
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        *,
        bot_configs (
          bot_name
        )
      `)
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('Error fetching client for notification:', clientError);
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const botConfig = Array.isArray(client.bot_configs) ? client.bot_configs[0] : client.bot_configs;
    const botName = botConfig?.bot_name || 'Agente IA';
    const companyName = client.company_name || client.company || 'Empresa';
    const contactName = client.contact_name || companyName;

    // Send the email
    await sendBotActivationEmail({
      contactName,
      companyName,
      email: client.email,
      botName: botName,
    });

    // Audit log
    await supabase.from('audit_logs').insert({
      event: 'bot_activation_email_sent',
      module: 'admin',
      metadata: { 
        client_id: clientId, 
        email: client.email,
        bot_name: botName
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Activation email notification error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
