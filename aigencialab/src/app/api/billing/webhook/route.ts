import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  sendPaymentApprovedEmail,
  sendPaymentFailedEmail,
  sendAdminPaymentFailedEmail,
  sendBotActivatedEmail,
  sendBotDeactivatedEmail,
  sendCancellationEmail,
} from '@/lib/emails'

export const dynamic = 'force-dynamic'

const MP_BASE = 'https://api.mercadopago.com'

async function mpFetch<T = any>(path: string): Promise<T> {
  const res = await fetch(`${MP_BASE}${path}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN!}` },
  })
  if (!res.ok) throw new Error(`[MP] ${res.status} ${path}`)
  return res.json()
}

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Plan ID → name map ──────────────────────────────────────
// Maps every MP preapproval_plan_id back to our internal plan name.
function resolvePlanName(preapprovalPlanId: string | null): string {
  if (!preapprovalPlanId) return 'Starter'
  const map: Record<string, string> = {}

  const starterId    = process.env.MP_PLAN_STARTER_ID
  const proId        = process.env.MP_PLAN_PRO_ID
  const businessId   = process.env.MP_PLAN_BUSINESS_ID
  const enterpriseId = process.env.MP_PLAN_ENTERPRISE_ID

  if (starterId)    map[starterId]    = 'Starter'
  if (proId)        map[proId]        = 'Pro'
  if (businessId)   map[businessId]   = 'Business'
  if (enterpriseId) map[enterpriseId] = 'Enterprise'

  return map[preapprovalPlanId] ?? 'Pro' // Default to Pro if unknown paid plan
}

async function logAudit(supabase: ReturnType<typeof getAdminSupabase>, event: string, meta: Record<string, unknown>) {
  await supabase.from('audit_logs').insert({ event, module: 'payment', metadata: meta })
}

// ── Main handler — DEPRECATED v1 ────────────────────────────
// This webhook handles legacy subscriptions created before the v2 checkout.
// New subscriptions use /api/v2/webhooks/mp instead.
// Keep active for compatibility with existing MP subscriptions.
export async function POST(request: NextRequest) {
  console.warn('[Webhook v1 DEPRECATED] Received event — consider migrating to /api/v2/webhooks/mp')
  // Always respond 200 — MP will retry on non-200
  try {
    const supabase = getAdminSupabase()

    // Parse body
    let body: any = {}
    try { body = await request.json() } catch { /* IPN via query only */ }

    const url = new URL(request.url)
    const type   = body?.type   ?? url.searchParams.get('type')
    const dataId = body?.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id')

    if (!dataId) {
      // Ping from MP (no data) — acknowledge
      return NextResponse.json({ ok: true, msg: 'ping' })
    }

    // ── subscription_preapproval ───────────────────────────
    if (type === 'subscription_preapproval') {
      let sub: any
      try { sub = await mpFetch(`/preapproval/${dataId}`) }
      catch { return NextResponse.json({ ok: true, msg: 'not found' }) }

      const clientId  = sub.external_reference as string | null
      const subStatus = sub.status as string // 'authorized' | 'paused' | 'cancelled'
      const planName  = resolvePlanName(sub.preapproval_plan_id)

      if (!clientId) {
        console.warn('[MP Webhook] No external_reference on subscription', dataId)
        return NextResponse.json({ ok: true })
      }

      // Fetch client info for emails
      const { data: clientRow } = await supabase
        .from('clients')
        .select('email, company_name, company, contact_name, full_name')
        .eq('id', clientId)
        .single()

      const email      = clientRow?.email ?? ''
      const company    = clientRow?.company_name || clientRow?.company || ''
      const personName = clientRow?.full_name || clientRow?.contact_name || company

      if (subStatus === 'authorized') {
        // Update subscription
        await supabase.from('subscriptions').upsert({
          client_id: clientId,
          status: 'active',
          plan: planName,
          mp_subscription_id: sub.id,
          current_period_end: sub.next_payment_date,
          payment_status: 'approved',
        }, { onConflict: 'client_id' })

        // Update client
        await supabase.from('clients')
          .update({ plan: planName, payment_status: 'active', status: 'active' })
          .eq('id', clientId)

        // Billing profile
        await supabase.from('billing_profiles').upsert({
          client_id: clientId,
          mp_customer_id: sub.payer_id,
          payment_status: 'approved',
        }, { onConflict: 'client_id' })

        // Auto-activate bot on first successful payment
        const { data: botRow } = await supabase
          .from('bot_configs').select('active').eq('client_id', clientId).single()
        if (botRow && !botRow.active) {
          await supabase.from('bot_configs').update({ active: true }).eq('client_id', clientId)
          await logAudit(supabase, 'bot_auto_activated', { client_id: clientId, trigger: 'payment_approved' })
          // Email: bot activated
          const { data: bc } = await supabase.from('bot_configs').select('name, bot_name').eq('client_id', clientId).single()
          const botName = bc?.bot_name || bc?.name || 'Asistente IA'
          sendBotActivatedEmail({ email, name: personName, company, botName }).catch(console.error)
        }

        // Email: payment approved
        sendPaymentApprovedEmail({
          email, name: personName, company, plan: planName,
          nextBillingDate: sub.next_payment_date
            ? new Date(sub.next_payment_date).toLocaleDateString('es-CL')
            : '—',
        }).catch(console.error)

        await logAudit(supabase, 'subscription_activated', { client_id: clientId, plan: planName, mp_id: sub.id })

      } else if (subStatus === 'cancelled' || subStatus === 'paused') {
        await supabase.from('subscriptions')
          .update({ status: 'canceled' }).eq('client_id', clientId)
        await supabase.from('clients')
          .update({ status: subStatus === 'cancelled' ? 'suspended' : 'paused' }).eq('id', clientId)
        await supabase.from('bot_configs')
          .update({ active: false }).eq('client_id', clientId)

        // Email: bot/subscription deactivated
        if (subStatus === 'cancelled') {
          sendCancellationEmail({
            email, name: personName, company, plan: planName,
            endsOn: new Date().toLocaleDateString('es-CL'),
          }).catch(console.error)
        }
        sendBotDeactivatedEmail({
          email, name: personName, company,
          reason: subStatus === 'cancelled' ? 'Suscripción cancelada' : 'Suscripción pausada',
        }).catch(console.error)

        await logAudit(supabase, `subscription_${subStatus}`, { client_id: clientId })
      }
    }

    // ── payment ────────────────────────────────────────────
    else if (type === 'payment') {
      let payment: any
      try { payment = await mpFetch(`/v1/payments/${dataId}`) }
      catch { return NextResponse.json({ ok: true, msg: 'payment not found' }) }

      const payStatus = payment.status as string // 'approved' | 'rejected' | 'refunded'
      const extRef    = payment.external_reference as string | null

      if (!extRef) return NextResponse.json({ ok: true })

      const { data: clientRow } = await supabase
        .from('clients').select('email, company_name, company, contact_name, full_name, plan').eq('id', extRef).single()
      if (!clientRow) return NextResponse.json({ ok: true })

      const email      = clientRow.email ?? ''
      const company    = clientRow.company_name || clientRow.company || ''
      const personName = clientRow.contact_name || clientRow.full_name || company
      const plan       = clientRow.plan ?? 'Starter'

      if (payStatus === 'approved') {
        await supabase.from('billing_profiles')
          .upsert({
            client_id: extRef,
            payment_status: 'approved',
            card_last4: payment.card?.last_four_digits,
            card_brand: payment.payment_method_id,
          }, { onConflict: 'client_id' })

        await logAudit(supabase, 'payment_approved', { client_id: extRef, payment_id: dataId, amount: payment.transaction_amount })

      } else if (payStatus === 'rejected') {
        await supabase.from('billing_profiles')
          .upsert({ client_id: extRef, payment_status: 'failed' }, { onConflict: 'client_id' })

        // Alert in alerts table
        await supabase.from('alerts').insert({
          client_id: extRef,
          type: 'critical',
          title: 'Pago rechazado',
          detail: `Pago MP ${dataId} rechazado para ${company}`,
        })

        sendPaymentFailedEmail({ email, name: personName, company, plan }).catch(console.error)
        sendAdminPaymentFailedEmail({ company, email, plan, clientId: extRef }).catch(console.error)
        await logAudit(supabase, 'payment_failed', { client_id: extRef, payment_id: dataId })
      }
    }

    return NextResponse.json({ ok: true })

  } catch (err: any) {
    console.error('[MP Webhook]', err)
    // Always 200 so MP doesn't retry
    return NextResponse.json({ ok: true, internal_error: err.message })
  }
}
