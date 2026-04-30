'use client';

import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Download,
  CheckCircle2,
  Zap,
  Clock,
  ShieldCheck,
  Loader2,
  ChevronRight,
  X,
  Calendar,
  Star,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  XCircle,
  Trash2,
  Lock
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { PLANS, formatCLP } from '@/config/plans';
import CardEntryForm from '@/components/billing/CardEntryForm';

// Map plan name (from DB, any case) to config/plans.ts slug
function getPlanSlug(planName: string | null | undefined): keyof typeof PLANS {
  const s = (planName ?? '').toLowerCase();
  if (s in PLANS) return s as keyof typeof PLANS;
  // Legacy mappings
  if (s === 'business') return 'pro'; // closest match
  return 'basic';
}


export default function BillingPage() {
  const [client, setClient] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [billingProfile, setBillingProfile] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [cardFormLoading, setCardFormLoading] = useState(false);
  const [cardFormError, setCardFormError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        // Use maybeSingle() instead of single() to avoid 406 errors
        const [clientRes, subRes, billingRes] = await Promise.all([
          supabase.from('clients').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('subscriptions').select('*').eq('client_id', user.id).maybeSingle(),
          supabase.from('billing_profiles').select('*').eq('client_id', user.id).maybeSingle(),
        ]);

        if (clientRes.data) setClient(clientRes.data);

        if (subRes.data) {
          setSubscription(subRes.data);
          // FASE 1 Bug 7: trial from subscriptions.trial_ends_at with fallback
          const trialEndDate = subRes.data.trial_ends_at ?? clientRes.data?.trial_ends_at ?? null;
          if (trialEndDate) {
            const daysLeft = Math.max(0, Math.ceil((new Date(trialEndDate).getTime() - Date.now()) / 86400000));
            setTrialDaysLeft(daysLeft);
          }
        } else if (clientRes.data?.trial_ends_at) {
          const daysLeft = Math.max(0, Math.ceil((new Date(clientRes.data.trial_ends_at).getTime() - Date.now()) / 86400000));
          setTrialDaysLeft(daysLeft);
        }

        if (billingRes.data) setBillingProfile(billingRes.data);

        // Invoices table may not exist — handle gracefully
        try {
          const invRes = await supabase
            .from('invoices')
            .select('*')
            .eq('client_id', user.id)
            .order('issued_at', { ascending: false });
          if (invRes.data) setInvoices(invRes.data);
        } catch {
          // invoices table doesn't exist yet — ignore
        }
      } catch (err) {
        console.error('[billing] fetchData error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
  }

  // If no client record yet, show a setup state  
  if (!client) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
          <span className="text-2xl">💳</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Configurá tu perfil primero</h2>
        <p className="text-slate-400 max-w-sm">
          Antes de gestionar tu suscripción, completa tu perfil en Configuración.
        </p>
        <a href="/dashboard/settings" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all">
          Ir a Configuración →
        </a>
      </div>
    );
  }

  const plan      = client.plan || 'basic';
  const planSlug  = getPlanSlug(plan);
  const planCfg   = PLANS[planSlug];
  const planPrice = planCfg?.monthlyPriceCLP ?? 0;
  const planName  = planCfg?.name ?? plan;


  // FASE 1 Bug 7: isTrialing uses subscription.status
  const isTrialing = trialDaysLeft !== null && trialDaysLeft > 0 &&
    (subscription?.status === 'trialing' || plan === 'Starter');

  const totalTrialDays = 14;
  const trialProgress = trialDaysLeft !== null
    ? Math.min(100, ((totalTrialDays - trialDaysLeft) / totalTrialDays) * 100)
    : 100;

  const formatDate = (d: string | null | undefined) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatCLP = (n: number) => `$${n.toLocaleString('es-CL')} CLP`;

  const nextChargeDate = subscription?.current_period_end ? formatDate(subscription.current_period_end) : '—';
  const cardLast4 = billingProfile?.card_last4;
  const cardBrand = billingProfile?.card_brand;

  // PRIORITY 3 FIX: Use the user's CURRENT plan, not a hardcoded upgrade plan
  // handleSubscribe defaults to the current client plan, never forces Pro
  const handleSubscribe = async (selectedPlan?: string) => {
    // If no plan given, use the current client plan (the one they already have)
    const planToSubscribe = selectedPlan ?? planSlug;
    // Enterprise → contact sales
    if (planToSubscribe === 'enterprise') {
      window.location.href = '/agendar';
      return;
    }
    // Redirect to v2 checkout page
    setCheckoutLoading(true);
    window.location.href = `/checkout/${planToSubscribe}`;
    setCheckoutLoading(false);

  };

  // PRIORITY 4: Open card management modal (not the subscription checkout)
  const handleUpdateCard = () => {
    setAddCardOpen(true);
  };

  // PRIORITY 4: Remove saved card from billing_profiles
  const handleRemoveCard = async () => {
    if (!confirm('¿Eliminar tarjeta guardada? Deberás agregar una nueva para continuar tu suscripción.')) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('billing_profiles')
      .update({ card_last4: null, card_brand: null, card_expiry: null, mp_customer_id: null, mp_card_token: null })
      .eq('client_id', user.id);
    setBillingProfile((prev: any) => prev ? { ...prev, card_last4: null, card_brand: null, card_expiry: null } : null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">

      {/* ─── FASE 2: Trial Banner ────────────────────────────────────────── */}
      {isTrialing && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/25 rounded-2xl">
          <Clock className="w-6 h-6 text-amber-400 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <p className="font-bold text-white">Prueba gratuita — <span className="text-amber-300">te quedan {trialDaysLeft} días</span></p>

            {/* FASE 2: Progress bar */}
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${trialProgress}%` }}
              />
            </div>

            <p className="text-xs text-slate-400">
              Tu trial vence el {formatDate(subscription?.trial_ends_at ?? client.trial_ends_at)}.
              Suscríbete para mantener acceso.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            id="trial-subscribe-btn"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-all flex-shrink-0 flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4" /> Suscribirme →
          </button>
          {/* PRIORITY 3 FIX: Clear indicator of which plan they're subscribing to */}
        </div>
      )}

      {/* ─── Current Plan Card ──────────────────────────────────────────── */}
      <div className="glass rounded-[28px] p-7 border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Star className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-extrabold text-white tracking-tight">Plan {plan}</h2>
                {/* Status badge */}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-widest ${
                  subscription?.status === 'trialing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  subscription?.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  subscription?.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  'bg-white/5 text-slate-400 border-white/10'
                }`}>
                  {subscription?.status || 'trial'}
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                {planPrice > 0 ? `${formatCLP(planPrice)} / mes` : 'Gratis durante el trial'}
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap">
            <button
              id="change-plan-btn"
              onClick={() => setChangePlanOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/80 text-white text-sm font-bold transition-all flex items-center gap-2"
            >
              Cambiar plan <ChevronRight className="w-4 h-4" />
            </button>
            <button
              id="cancel-sub-btn"
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/20 text-sm font-bold transition-all"
            >
              Cancelar suscripción
            </button>
          </div>
        </div>
      </div>

      {/* ─── FASE 2: Billing Details row ────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Next charge */}
        <div className="glass rounded-2xl p-6 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Próximo cobro</span>
          </div>
          <p className="text-xl font-extrabold text-white">{nextChargeDate}</p>
          <p className="text-sm text-slate-400 mt-1">{planPrice > 0 ? formatCLP(planPrice) : 'Sin cobro durante trial'}</p>
        </div>

        {/* Card on file */}
        <div className="glass rounded-2xl p-6 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Método de pago</span>
          </div>
          {cardLast4 ? (
            <div>
              <p className="text-xl font-extrabold text-white">
                {cardBrand ? `${cardBrand.charAt(0).toUpperCase()}${cardBrand.slice(1)} ` : ''}•••• {cardLast4}
              </p>
              {billingProfile?.card_expiry && (
                <p className="text-xs text-slate-400 mt-0.5">Vence: {billingProfile.card_expiry}</p>
              )}
              <div className="flex gap-3 mt-2">
                <button
                  id="update-card-btn"
                  onClick={handleUpdateCard}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reemplazar →
                </button>
                <button
                  id="remove-card-btn"
                  onClick={handleRemoveCard}
                  className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Eliminar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500 italic mb-2">Sin tarjeta guardada</p>
              <button
                id="add-card-btn"
                onClick={() => setAddCardOpen(true)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <CreditCard className="w-3 h-3" /> Agregar método →
              </button>
            </div>
          )}
        </div>

        {/* Security */}
        <div className="glass rounded-2xl p-6 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Seguridad</span>
          </div>
          <p className="text-sm text-slate-300 font-medium mb-1">Pagos 100% seguros</p>
          <p className="text-xs text-slate-500">Procesado por MercadoPago. Sin guardar datos de tarjeta en nuestros servidores.</p>
        </div>
      </div>

      {/* ─── Invoices ───────────────────────────────────────────────────── */}
      <div className="glass rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest">Historial de Facturas</h3>
        </div>
        {invoices.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-500 text-sm">
            No hay facturas todavía. Aparecerán aquí tras tu primer pago.
          </div>
        ) : (
          <div>
            {invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] hover:bg-white/3 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{formatCLP(inv.amount || 0)}</p>
                    <p className="text-xs text-slate-500">{formatDate(inv.issued_at)}</p>
                  </div>
                </div>
                <button className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Subscribe Modal — uses CURRENT plan from config/plans.ts ── */}
      {modalOpen && (() => {
        const isAlreadyActive = subscription?.status === 'active';
        return (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Suscríbete al Plan {planName}</h2>
                    <p className="text-slate-400 text-sm">Sin comisión · Cancela cuando quieras</p>
                  </div>
                </div>

                {isAlreadyActive ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="font-bold text-white">Ya estás suscrito a este plan</p>
                    <p className="text-xs text-slate-400">
                      Tu suscripción al Plan {planName} está activa hasta el {formatDate(subscription?.current_period_end)}.
                    </p>
                    <button
                      onClick={() => setModalOpen(false)}
                      className="mt-2 px-6 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold text-sm transition-all"
                    >
                      Entendido
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-6">
                      <div className="text-4xl font-extrabold text-white mb-1 tracking-tight">
                        {planCfg?.monthlyPriceCLP ? formatCLP(planCfg.monthlyPriceCLP) + '/mes' : 'A consultar'}
                      </div>
                      <p className="text-xs text-slate-400">+ IVA si aplica · Pagado mensualmente vía MercadoPago</p>
                    </div>

                    <ul className="space-y-2.5">
                      {(planCfg?.features ?? []).slice(0, 5).map((f: string) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      id="mp-checkout-btn"
                      onClick={() => handleSubscribe()}
                      disabled={checkoutLoading}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-2xl font-bold text-base shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      {checkoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Zap className="w-5 h-5" /> Pagar con MercadoPago</>}
                    </button>
                    <p className="text-center text-xs text-slate-500">🔒 Datos cifrados. Ley N°19.628.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Change Plan Modal ───────────────────────────────────────────── */}
      {changePlanOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[32px] p-10 shadow-2xl">
            <button onClick={() => setChangePlanOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Cambiar plan</h2>
            <div className="space-y-3">
              {Object.entries(PLANS).map(([key, p]) => (
                <button
                  key={key}
                  id={`select-plan-${key}`}
                  onClick={() => handleSubscribe(key)}
                  disabled={checkoutLoading || key === planSlug}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    key === planSlug ? 'bg-primary/10 border-primary/30 cursor-default' : 'bg-white/5 border-white/10 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <div className="text-left">
                    <span className="font-bold text-white block">{p.name}</span>
                    <span className="text-xs text-slate-400">
                      {p.monthlyPriceCLP ? formatCLP(p.monthlyPriceCLP) + '/mes' : 'A consultar'}
                    </span>
                  </div>
                  {key === planSlug ? <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-lg">Plan actual</span> : <ArrowRight className="w-4 h-4 text-slate-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Cancel Confirmation Modal ───────────────────────────────────── */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-red-500/20 rounded-[32px] p-10 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">¿Cancelar suscripción?</h2>
              <p className="text-slate-400 text-sm">Perderás acceso a todas las funciones del plan al final del período actual.</p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="flex-1 py-3 rounded-2xl bg-white/5 text-white font-bold hover:bg-white/10 transition-all border border-white/10"
                >
                  Mantener plan
                </button>
                <button
                  id="confirm-cancel-btn"
                  onClick={async () => {
                    // Mark subscription as cancelled
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                      await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('client_id', user.id);
                    }
                    setCancelModalOpen(false);
                    window.location.reload();
                  }}
                  className="flex-1 py-3 rounded-2xl bg-red-500/20 text-red-400 font-bold hover:bg-red-500/30 transition-all border border-red-500/20"
                >
                  Confirmar cancelación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── PRIORITY 4: Add / Replace Card Modal — MercadoPago tokenization ── */}
      {addCardOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
            <button
              onClick={() => { setAddCardOpen(false); setCardFormError(null); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Agregar método de pago</h2>
                  <p className="text-slate-400 text-sm">Tus datos se cifran y nunca los almacenamos</p>
                </div>
              </div>

              {cardFormError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{cardFormError}</p>
                </div>
              )}

              {/* Card form — tokenized via MercadoPago SDK before sending to server */}
              <CardEntryForm
                onSubmit={async (tokenData) => {
                  setCardFormLoading(true);
                  setCardFormError(null);
                  try {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) throw new Error('No autenticado');

                    const res = await fetch('/api/billing/save-card', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                      },
                      body: JSON.stringify(tokenData),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error ?? 'Error guardando tarjeta');

                    // Update local state with new card info
                    setBillingProfile((prev: any) => ({
                      ...(prev ?? {}),
                      card_last4: tokenData.last4,
                      card_brand: tokenData.brand,
                      card_expiry: tokenData.expiry,
                    }));
                    setAddCardOpen(false);
                    setCardFormError(null);
                  } catch (err: any) {
                    setCardFormError(err.message ?? 'Error procesando la tarjeta. Intente nuevamente.');
                  } finally {
                    setCardFormLoading(false);
                  }
                }}
                loading={cardFormLoading}
              />

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3 h-3" />
                <span>Procesado por MercadoPago · Ley N°19.628 · PCI DSS</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
