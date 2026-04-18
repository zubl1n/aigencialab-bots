'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PLANS, type PlanConfig } from '@/config/plans'
import { Check, Zap, Rocket, Gem, Building2, Shield } from 'lucide-react'

const PLAN_ICONS: Record<string, React.ReactNode> = {
  basic:      <Zap className="w-5 h-5" />,
  starter:    <Rocket className="w-5 h-5" />,
  pro:        <Gem className="w-5 h-5" />,
  enterprise: <Building2 className="w-5 h-5" />,
}

const PLAN_TOP_FEATURES: Record<string, string[]> = {
  basic:      ['1 Agente IA entrenado', 'Webchat en tu sitio', '500 conv/mes', 'App móvil iOS/Android'],
  starter:    ['3 Agentes IA entrenados', 'WhatsApp Business', '2.000 conv/mes', 'Dashboard de conversiones', 'Calificación automática de leads'],
  pro:        ['Agentes IA ilimitados', 'Todos los canales', 'Conversaciones ∞', 'Connect completo (150+ integraciones)', 'Consultoría mensual'],
  enterprise: ['Todo lo del plan Pro', 'Infraestructura dedicada', 'SLA 99.95%', 'Equipo de ingeniería dedicado', 'Multi-tenant / Multi-marca'],
}

function fmtCLP(n: number) { return `$${n.toLocaleString('es-CL')}` }

export function LandingPricing() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const plans = Object.values(PLANS)

  return (
    <section id="pricing" className="py-24 relative overflow-hidden" style={{ background: '#07070F' }}>
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-[0.07] blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full opacity-[0.05] blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, #4F46E5, transparent)' }} />

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-bold uppercase tracking-widest text-[#A855F7] bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-4 py-1.5 rounded-full mb-5">
            Planes
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Precio claro, <span style={{ backgroundImage: 'linear-gradient(135deg,#C084FC,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>valor real</span>
          </h2>
          <p className="text-[#A09CB0] text-base max-w-lg mx-auto">
            Implementación guiada el mes 1 · Mes 2 sin cobro · Suscripción desde el mes 3
          </p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-full p-1 gap-1">
            {(['monthly', 'annual'] as const).map(b => (
              <button
                key={b}
                onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${billing === b ? 'bg-[#7C3AED] text-white shadow-lg' : 'text-[#A09CB0] hover:text-white'}`}
              >
                {b === 'monthly' ? 'Mensual' : 'Anual'}
                {b === 'annual' && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold">−20%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          {plans.map((plan: PlanConfig) => {
            const monthlyPrice = (billing === 'annual' && plan.annualPriceCLP) ? plan.annualPriceCLP : plan.monthlyPriceCLP
            const topFeatures  = PLAN_TOP_FEATURES[plan.slug] ?? (plan.features as unknown as string[]).slice(0, 4)

            return (
              <div
                key={plan.slug}
                className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: plan.isFeatured
                    ? 'linear-gradient(160deg, rgba(124,58,237,0.18) 0%, rgba(10,10,20,1) 60%)'
                    : 'rgba(255,255,255,0.03)',
                  border: plan.isFeatured
                    ? '1px solid rgba(124,58,237,0.5)'
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: plan.isFeatured ? '0 0 40px rgba(124,58,237,0.12)' : 'none',
                }}
              >
                {plan.badgeLabel && (
                  <div className="absolute -top-px left-0 right-0 h-0.5" style={{ background: plan.isFeatured ? 'linear-gradient(90deg,transparent,#7C3AED,transparent)' : 'transparent' }} />
                )}
                {plan.badgeLabel && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: '#7C3AED', color: '#fff' }}>
                      {plan.badgeLabel}
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Plan header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: plan.isFeatured ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)', color: plan.isFeatured ? '#C084FC' : '#A09CB0' }}>
                      {PLAN_ICONS[plan.slug]}
                    </div>
                    <div>
                      <div className="font-bold text-white text-base">{plan.name}</div>
                      <div className="text-[#6B6480] text-xs leading-snug">{plan.tagline}</div>
                    </div>
                  </div>

                  {/* Price */}
                  {plan.isEnterprise ? (
                    <div className="mb-5">
                      <div className="text-2xl font-bold text-white">A consultar</div>
                      <div className="text-xs text-[#6B6480] mt-1">Precios según proyecto</div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="text-xs text-[#6B6480] uppercase tracking-wide mb-1 font-medium">Impl. mes 1 — pago único</div>
                      <div className="text-base font-bold text-[#A09CB0]">{fmtCLP(plan.implPriceCLP!)}</div>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-extrabold" style={{ color: plan.isFeatured ? '#C084FC' : '#F1F0F5' }}>
                          {fmtCLP(monthlyPrice!)}
                        </span>
                        <span className="text-[#6B6480] text-sm">/mes</span>
                      </div>
                      {billing === 'annual' && plan.annualPriceCLP && (
                        <p className="text-emerald-400 text-xs mt-1 font-medium">✓ Precio anual · ahorra 20%</p>
                      )}
                      <p className="text-[11px] text-[#6B6480] mt-1">desde el mes 3</p>
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={plan.isEnterprise ? '/agendar' : `/checkout/${plan.slug}`}
                    className="block text-center py-2.5 rounded-xl font-bold text-sm transition-all mb-5"
                    style={plan.isFeatured
                      ? { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }
                      : plan.isEnterprise
                      ? { border: '1px solid rgba(124,58,237,0.4)', color: '#C084FC', background: 'transparent' }
                      : { background: 'rgba(255,255,255,0.08)', color: '#F1F0F5' }}
                  >
                    {plan.isEnterprise ? 'Hablar con un ejecutivo' : 'Contratar ahora →'}
                  </Link>

                  {/* Features */}
                  <ul className="space-y-2 flex-1">
                    {topFeatures.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-[#7C3AED]" />
                        <span className="text-[#A09CB0]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Guarantee */}
                  {plan.guarantee && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06] text-center text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3" />{plan.guarantee}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Model explainer */}
        <div className="mt-12 grid grid-cols-3 gap-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          {[
            { n: '1', c: '#7C3AED', t: 'Mes 1 — Implementación', d: 'Pago único. Ingeniero asignado configura y entrena tu agente IA.' },
            { n: '2', c: '#10B981', t: 'Mes 2 — Sin cobro', d: 'Período de activación y optimización. El bot opera sin costo.' },
            { n: '3+', c: '#4F46E5', t: 'Mes 3+ — Suscripción', d: 'Suscripción mensual recurrente. Cancelable cuando quieras.' },
          ].map(s => (
            <div key={s.n} className="text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-sm" style={{ background: s.c }}>
                {s.n}
              </div>
              <div className="text-white font-semibold text-sm mb-1">{s.t}</div>
              <div className="text-[#6B6480] text-xs leading-relaxed">{s.d}</div>
            </div>
          ))}
        </div>

        {/* Link to full pricing */}
        <p className="text-center mt-8">
          <Link href="/precios" className="text-[#C084FC] hover:text-white text-sm font-semibold transition-colors">
            Ver comparación detallada y FAQ →
          </Link>
        </p>
      </div>
    </section>
  )
}
