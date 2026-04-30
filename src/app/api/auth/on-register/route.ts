/**
 * POST /api/auth/on-register
 * Called immediately after a new user successfully creates an account.
 * Ensures client row exists in DB and sends admin notification email.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { sendAdminNewClientEmail, sendWelcomeEmail } from '@/lib/emails'

export const dynamic = 'force-dynamic'

function getAdminSupabase() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, email, fullName, companyName, plan, website } = body

    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required' }, { status: 400 })
    }

    const supabase = getAdminSupabase()

    // 1. Verify user exists in auth.users
    const { data: authUser, error: authErr } = await supabase.auth.admin.getUserById(userId)
    if (authErr || !authUser?.user) {
      return NextResponse.json({ error: 'User not found in auth' }, { status: 404 })
    }

    const now = new Date()
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days

    // 2. Upsert client row (may already exist from register page direct insert)
    const { data: clientRow, error: upsertErr } = await supabase
      .from('clients')
      .upsert({
        id: userId,
        email,
        full_name: fullName ?? null,
        contact_name: fullName ?? null,
        company_name: companyName ?? null,
        company: companyName ?? null,
        url: website ?? null,
        plan: plan ?? 'Starter',
        status: 'pending',
        trial_ends_at: trialEnd.toISOString(),
      }, { onConflict: 'id' })
      .select('id, email, company_name, plan')
      .single()

    if (upsertErr) {
      console.error('[on-register] client upsert error:', upsertErr)
      // Don't fail — client row may already be there
    }

    // 3. Create subscriptions row with trial status
    const { error: subErr } = await supabase
      .from('subscriptions')
      .upsert({
        client_id: userId,
        plan: plan ?? 'Starter',
        status: 'trialing',
        trial_ends_at: trialEnd.toISOString(),
      }, { onConflict: 'client_id' })

    if (subErr) {
      console.warn('[on-register] subscription upsert error:', subErr.message)
    }

    // 4. Create default bot_configs row
    const { error: botErr } = await supabase
      .from('bot_configs')
      .upsert({
        client_id: userId,
        bot_name: 'Asistente IA',
        name: 'Asistente IA',
        active: false,
        widget_color: '#6366f1',
        welcome_message: '¡Hola! ¿En qué puedo ayudarte?',
        language: 'es',
      }, { onConflict: 'client_id' })

    if (botErr) {
      console.warn('[on-register] bot_configs upsert error:', botErr.message)
    }

    // 5. Audit log (non-blocking)
    Promise.resolve(
      supabase.from('audit_logs').insert({
        event: 'client_registered',
        module: 'auth',
        metadata: {
          client_id: userId,
          email,
          company: companyName,
          plan: plan ?? 'Starter',
          trial_ends_at: trialEnd.toISOString(),
        },
      })
    ).catch((err: unknown) => console.warn('[on-register] audit log error:', err))

    // 6. Send welcome email to client (non-blocking)
    sendWelcomeEmail({
      email,
      name: fullName || companyName || email.split('@')[0],
      company: companyName || email.split('@')[0],
      plan: plan ?? 'Starter',
    }).catch((err: unknown) => console.error('[on-register] welcome email error:', err))

    // 7. Send admin notification email (non-blocking)
    sendAdminNewClientEmail({
      company: companyName || email.split('@')[0],
      email,
      plan: plan ?? 'Starter',
      clientId: userId,
    }).catch((err: unknown) => console.error('[on-register] admin email error:', err))

    console.log(`[on-register] New client setup complete: ${email} (${userId})`)

    return NextResponse.json({
      ok: true,
      client: clientRow ?? { id: userId, email },
      trial_ends_at: trialEnd.toISOString(),
    })
  } catch (err: any) {
    console.error('[on-register] Unexpected error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
