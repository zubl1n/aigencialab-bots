'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PLANS_LIST, formatPrice, type Currency, type Billing } from '@/lib/plans'

export function LandingPricing() {
  const [billing, setBilling] = useState<Billing>('monthly')
  const [currency, setCurrency] = useState<Currency>('USD')

  const currencySuffix = currency === 'USD' ? 'USD/mes' : 'CLP/mes'

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
          <p className="text-[#A09CB0] mt-3 text-lg">Empieza gratis 14 días. Sin tarjeta de crédito.</p>
        </div>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          {/* Billing toggle */}
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

          {/* Currency toggle */}
          <div className="flex items-center bg-[#16161E] border border-white/[0.08] rounded-full p-1 gap-1">
            <button
              onClick={() => setCurrency('USD')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${currency === 'USD' ? 'bg-[#16161E] ring-1 ring-[#7C3AED] text-[#F1F0F5]' : 'text-[#A09CB0] hover:text-[#F1F0F5]'}`}
            >
              🇺🇸 USD
            </button>
            <button
              onClick={() => setCurrency('CLP')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${currency === 'CLP' ? 'bg-[#16161E] ring-1 ring-[#7C3AED] text-[#F1F0F5]' : 'text-[#A09CB0] hover:text-[#F1F0F5]'}`}
            >
              🇨🇱 CLP
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {PLANS_LIST.map(plan => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl p-7 border transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(124,58,237,0.15)] ${
                plan.highlight
                  ? 'bg-[#16161E] border-[#7C3AED] shadow-[0_0_40px_rgba(124,58,237,0.12)]'
                  : 'bg-[#16161E] border-white/[0.08]'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#F1F0F5]">{plan.name}</h3>
                <p className="text-[#6B6480] text-sm mt-1">{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.isContact ? (
                  <div className="text-3xl font-bold text-[#F1F0F5]">A consultar</div>
                ) : (
                  <>
                    <div className="text-4xl font-bold text-[#F1F0F5]">
                      {formatPrice(plan, currency, billing)}
                      <span className="text-base font-normal text-[#6B6480] ml-1">{currencySuffix}</span>
                    </div>
                    {billing === 'annual' && (
                      <p className="text-xs text-green-400 mt-1">
                        Facturado anualmente · Ahorra 20%
                      </p>
                    )}
                  </>
                )}
              </div>

              <Link
                href={plan.isContact ? plan.ctaHref : `/register?planId=${plan.id}&billing=${billing}`}
                className={`block text-center py-3 rounded-xl font-semibold transition mb-6 ${
                  plan.highlight
                    ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
                    : plan.isContact
                    ? 'border border-[#7C3AED]/40 text-[#C084FC] hover:bg-[#7C3AED]/10'
                    : 'bg-white/[0.08] hover:bg-white/[0.12] text-[#F1F0F5]'
                }`}
              >
                {plan.ctaLabel}
              </Link>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map(f => (
                  <li key={f.text} className={`flex items-start gap-2.5 text-sm ${f.included ? 'text-[#A09CB0]' : 'text-[#3D3952] line-through'}`}>
                    <span className={f.included ? 'text-[#7C3AED] mt-0.5 flex-shrink-0' : 'text-[#3D3952] mt-0.5 flex-shrink-0'}>
                      {f.included ? '✓' : '✗'}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>

              {/* Limits footer */}
              <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-2">
                <div className="text-center">
                  <div className="text-[#C084FC] font-bold text-sm">{plan.limits.chatbots}</div>
                  <div className="text-[#6B6480] text-[10px] uppercase tracking-wide">Chatbots</div>
                </div>
                <div className="text-center">
                  <div className="text-[#C084FC] font-bold text-sm">{plan.limits.conversations}</div>
                  <div className="text-[#6B6480] text-[10px] uppercase tracking-wide">Conv/mes</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
      </div>
    </section>
  )
}
