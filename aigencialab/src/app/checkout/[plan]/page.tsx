'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Check, Shield, ChevronRight, Loader2, Lock, Calendar, CreditCard, MessageSquare,
  X,
} from 'lucide-react';
import { PLANS, getPlanBySlug, formatCLP, type PlanConfig } from '@/config/plans';

// ── Supabase client (browser) ────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Auth Gate Modal ───────────────────────────────────────────────────────────
function AuthGateModal({ onClose, onAuth }: { onClose: () => void; onAuth: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
      }
      onAuth();
    } catch (err: any) {
      setError(err.message ?? 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'login' ? 'Inicia sesión para continuar' : 'Crea tu cuenta'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Email</label>
            <input
              type="email"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@empresa.cl"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 mb-1 block">Contraseña</label>
            <input
              type="password"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-bold transition-all"
          >
            {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>
        <button
          onClick={() => setMode(m => m === 'login' ? 'register' : 'login')}
          className="mt-4 w-full text-center text-sm text-slate-500 hover:text-blue-600 transition-colors"
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate gratis' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  );
}

// ── Checkout Page ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params.plan === 'string' ? params.plan : '';

  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const plan = getPlanBySlug(slug) as PlanConfig | null;

  // Redirect enterprise to /agendar
  useEffect(() => {
    if (slug === 'enterprise') router.replace('/agendar');
  }, [slug, router]);

  // Get session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (!plan || plan.isEnterprise) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Plan no encontrado</h1>
          <Link href="/precios" className="text-blue-600 font-semibold hover:underline">
            Ver todos los planes →
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date();
  const month3Date = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);

  async function handleCheckout() {
    if (!session) {
      setShowAuth(true);
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const res = await fetch('/api/v2/checkout/create-impl-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planSlug: plan!.slug,
          userEmail: session.user.email,
          userId: session.user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al crear preferencia');
      // Redirect to MercadoPago checkout (ALWAYS init_point, never sandbox)
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setCheckoutError(err.message);
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {showAuth && (
        <AuthGateModal
          onClose={() => setShowAuth(false)}
          onAuth={() => setShowAuth(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/precios" className="text-slate-600 hover:text-slate-900 text-sm flex items-center gap-1">
            ← Volver a planes
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            Pago seguro con MercadoPago
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* Checkout summary — left (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <div className="text-sm text-slate-500 mb-1">Plan seleccionado</div>
              <h1 className="text-3xl font-bold text-slate-900">
                AIgenciaLab {plan.name}
              </h1>
              <p className="text-slate-500 mt-1">{plan.tagline}</p>
            </div>

            {/* Timeline of charges */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-900">Resumen de cobros</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {/* Month 1 */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">Hoy — Implementación</div>
                        <div className="text-sm text-slate-500">Pago único · Se cobra hoy al confirmar</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{formatCLP(plan.implPriceCLP)}</div>
                        <div className="text-xs text-slate-400">pago único</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Month 2 */}
                <div className="flex items-start gap-4 px-6 py-4 bg-emerald-50/30">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">Días 1–60 — Período de activación</div>
                        <div className="text-sm text-slate-500">Tu agente se implementa y optimiza</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600">$0</div>
                        <div className="text-xs text-slate-400">sin cobro</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Month 3+ */}
                <div className="flex items-start gap-4 px-6 py-4">
                  <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">
                          Desde {month3Date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long' })} — Suscripción
                        </div>
                        <div className="text-sm text-slate-500">Tu agente opera autónomamente · Cancelable cuando quieras</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{formatCLP(plan.monthlyPriceCLP)}</div>
                        <div className="text-xs text-slate-400">/mes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan features summary */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="font-bold text-slate-900 mb-4">Incluido en tu plan</h3>
              <div className="grid grid-cols-2 gap-2">
                {plan.features.slice(0, 8).map(f => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600">{f}</span>
                  </div>
                ))}
              </div>
              {plan.guarantee && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <Shield className="w-4 h-4" />
                  {plan.guarantee}
                </div>
              )}
            </div>
          </div>

          {/* CTA panel — right (2/5) */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:sticky lg:top-6 shadow-sm">
              <div className="mb-5">
                <div className="text-xs text-slate-500 mb-1">Cargo hoy</div>
                <div className="text-4xl font-bold text-slate-900">{formatCLP(plan.implPriceCLP)}</div>
                <div className="text-sm text-slate-500">Implementación · Pago único</div>
              </div>

              {checkoutError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">
                  {checkoutError}
                </div>
              )}

              {!session && !sessionLoading && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-3 rounded-xl mb-4">
                  Debes iniciar sesión para continuar con el pago.
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || sessionLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 mb-4"
              >
                {checkoutLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Redirigiendo a MercadoPago...</>
                ) : !session ? (
                  <>Iniciar sesión para pagar</>
                ) : (
                  <>Ir a pagar con MercadoPago <ChevronRight className="w-4 h-4" /></>
                )}
              </button>

              <div className="text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  Pago procesado por MercadoPago · SSL
                </div>
                <div className="text-xs text-slate-400">Cancelable cuando quieras</div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <a
                    href="https://wa.me/56912345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    ¿Tienes dudas? Escríbenos por WhatsApp
                  </a>
                </div>
              </div>

              <Link href="/precios" className="block mt-3 text-center text-xs text-slate-400 hover:text-slate-600 transition-colors">
                ← Ver todos los planes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
