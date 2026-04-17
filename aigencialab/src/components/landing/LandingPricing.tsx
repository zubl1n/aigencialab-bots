'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PLANS, type PlanConfig } from '@/config/plans'
import { Check, X, Shield } from 'lucide-react'

function fmtCLP(n: number): string {
  return `$${n.toLocaleString('es-CL')}`
}

export function LandingPricing() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const plans = Object.values(PLANS)

  return (
    <section id="pricing" className="py-20 border-t border-white/5 bg-[#0A0A0F]">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block text-xs font-semibold uppercase tracking-widest text-[#C084FC] bg-[#7C3AED]/10 px-3 py-1 rounded-full mb-4">
            Planes
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#F1F0F5]">
            Precio claro, <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C084FC] to-[#7C3AED]">valor real</span>
          </h2>
          <p className="text-[#A09CB0] mt-3 text-lg">
            Implementación guiada el mes 1. Mes 2 sin cobro. Suscripción mensual desde el mes 3.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center bg-[#16161E] border border-white/[0.08] rounded-full p-1 gap-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${billing === 'monthly' ? 'bg-[#7C3AED] text-white' : 'text-[#A09CB0] hover:text-[#F1F0F5]'}`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${billing === 'annual' ? 'bg-[#7C3AED] text-white' : 'text-[#A09CB0] hover:text-[#F1F0F5]'}`}
            >
              Anual
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full font-bold">−20%</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan: PlanConfig) => {
            const monthlyPrice = (billing === 'annual' && plan.annualPriceCLP)
              ? plan.annualPriceCLP
              : plan.monthlyPriceCLP

            return (
              <div
                key={plan.slug}
                className={`relative flex flex-col rounded-2xl p-7 border transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(124,58,237,0.15)] ${
                  plan.isFeatured
                    ? 'bg-[#16161E] border-[#7C3AED] shadow-[0_0_40px_rgba(124,58,237,0.12)]'
                    : plan.isEnterprise
                    ? 'bg-[#0a0f1e] border-[#1e3a5f]'
                    : 'bg-[#16161E] border-white/[0.08]'
                }`}
              >
                {plan.badgeLabel && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    {plan.badgeLabel}
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-xl font-bold text-[#F1F0F5]">{plan.name}</h3>
                  <p className="text-[#6B6480] text-sm mt-1">{plan.tagline}</p>
                </div>

                {/* Price block */}
                <div className="mb-6">
                  {plan.isEnterprise ? (
                    <div className="text-3xl font-bold text-[#F1F0F5]">A consultar</div>
                  ) : (
                    <>
                      <div className="text-xs text-[#6B6480] mb-1 uppercase font-semibold tracking-wide">Mes 1 — Implementación</div>
                      <div className="text-2xl font-bold text-[#F1F0F5] mb-1">{fmtCLP(plan.implPriceCLP!)}</div>
                      <div className="text-xs text-[#6B6480] mb-3">pago único</div>
                      <div className="text-xs text-[#6B6480] mb-1 uppercase font-semibold tracking-wide">Mes 3+ — Suscripción</div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold ${plan.isFeatured ? 'text-[#C084FC]' : 'text-[#F1F0F5]'}`}>
                          {fmtCLP(monthlyPrice!)}
                        </span>
                        <span className="text-[#6B6480] text-sm">/mes</span>
                      </div>
                      {billing === 'annual' && plan.annualPriceCLP && (
                        <p className="text-xs text-green-400 mt-1">Precio anual · Ahorra 20%</p>
                      )}
                    </>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href={plan.isEnterprise ? '/agendar' : `/checkout/${plan.slug}`}
                  className={`block text-center py-3 rounded-xl font-semibold transition mb-6 ${
                    plan.isFeatured
                      ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
                      : plan.isEnterprise
                      ? 'border border-[#7C3AED]/40 text-[#C084FC] hover:bg-[#7C3AED]/10'
                      : 'bg-white/[0.08] hover:bg-white/[0.12] text-[#F1F0F5]'
                  }`}
                >
                  {plan.isEnterprise ? 'Hablar con un ejecutivo' : 'Contratar ahora'}
                </Link>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {(plan.features as readonly string[]).map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#A09CB0]">
                      <Check className="w-4 h-4 text-[#7C3AED] mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {(plan.notIncluded as readonly string[]).map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-[#3D3952] line-through">
                      <X className="w-4 h-4 text-[#3D3952] mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Guarantee */}
                {plan.guarantee && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] text-xs text-center text-emerald-400 font-medium">
                    <Shield className="w-3.5 h-3.5 inline mr-1" />
                    {plan.guarantee}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Billing model explainer */}
        <div className="mt-16 bg-[#16161E] border border-white/[0.08] rounded-2xl p-8">
          <h3 className="text-lg font-bold text-[#F1F0F5] text-center mb-6">¿Cómo funciona el modelo de cobro?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '1', color: 'bg-[#7C3AED]', title: 'Mes 1 — Implementación', desc: 'Pago único. Tu ingeniero asignado configura y entrena el agente IA en tu negocio.' },
              { num: '2', color: 'bg-emerald-500', title: 'Mes 2 — Sin cobro', desc: 'Período de activación y optimización. El bot opera sin costo mensual.' },
              { num: '3+', color: 'bg-[#1e3a5f]', title: 'Mes 3+ — Suscripción', desc: 'Se activa la suscripción mensual recurrente. Cancelable cuando quieras.' },
            ].map(s => (
              <div key={s.num} className="text-center">
                <div className={`w-12 h-12 ${s.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <span className="text-white font-bold">{s.num}</span>
                </div>
                <div className="font-semibold text-[#F1F0F5] mb-1 text-sm">{s.title}</div>
                <div className="text-xs text-[#6B6480]">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <Link href="/precios" className="text-[#C084FC] hover:text-white text-sm font-semibold transition">
            Ver comparación detallada de todos los planes →
          </Link>
        </div>
      </div>
    </section>
  )
}
