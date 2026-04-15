'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/landing/MainLayout'
import { PLANS_LIST, formatPrice, type Currency, type Billing } from '@/lib/plans'

// Comparison table data
const TABLE_ROWS: { feature: string; values: (string | boolean)[] }[] = [
  { feature: 'Widget chat web',          values: [true,   true,    true,     true] },
  { feature: 'Agentes IA',               values: ['1',    '3',     '5',      '∞'] },
  { feature: 'Chatbots programables',    values: ['3',    '10',    '20',     '∞'] },
  { feature: 'Conversaciones/mes',       values: ['500',  '2.000', '4.000',  '∞'] },
  { feature: 'Captura de leads',         values: [true,   true,    true,     true] },
  { feature: 'CRM de leads integrado',   values: [false,  true,    true,     true] },
  { feature: 'IA Copilot',               values: [false,  true,    true,     true] },
  { feature: 'WhatsApp Business',        values: [false,  true,    true,     true] },
  { feature: 'Mensajes salientes (HSM)', values: [false,  false,   true,     true] },
  { feature: 'WhatsApp API oficial',     values: [false,  false,   true,     true] },
  { feature: 'Multi-idioma',             values: [false,  false,   true,     true] },
  { feature: 'SLA garantizado',          values: [false,  false,   false,    true] },
  { feature: 'Integraciones a medida',   values: [false,  false,   false,    true] },
  { feature: 'Soporte',                  values: ['Email','Prio.', 'Dedicado','24/7'] },
]

function Cell({ v }: { v: string | boolean }) {
  if (typeof v === 'boolean') {
    return v
      ? <span className="text-[#7C3AED] text-lg font-bold">✓</span>
      : <span className="text-[#3D3952]">—</span>
  }
  return <span className="text-[#C084FC] font-semibold text-sm">{v}</span>
}

const FAQS = [
  { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí. No hay contratos de largo plazo. Puedes cancelar desde tu panel cuando quieras.' },
  { q: '¿Qué pasa cuando termina el trial de 14 días?', a: 'Te pediremos que elijas un plan. Si no lo haces, tu cuenta entra en modo lectura (sin nuevas conversaciones).' },
  { q: '¿Los precios incluyen IVA?', a: 'Los precios en USD son netos. En CLP el IVA se aplica según la legislación tributaria chilena vigente.' },
  { q: '¿Puedo cambiar de plan cuando quiera?', a: 'Sí. Puedes hacer upgrade o downgrade en cualquier momento desde tu panel de facturación.' },
  { q: '¿Enterprise tiene precio fijo?', a: 'Enterprise se cotiza según el volumen, integraciones y nivel de soporte requerido. Agenda una llamada con nuestro equipo.' },
]

export default function PreciosPage() {
  const [billing, setBilling]   = useState<Billing>('monthly')
  const [currency, setCurrency] = useState<Currency>('USD')

  const currencySuffix = currency === 'USD' ? 'USD/mes' : 'CLP/mes'

  return (
    <MainLayout>
      <div className="bg-[#0A0A0F] min-h-screen text-[#F1F0F5]">

        {/* HERO */}
        <section className="pt-24 pb-12 px-6 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Planes simples,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C084FC] to-[#7C3AED]">
              resultados reales
            </span>
          </h1>
          <p className="text-[#A09CB0] text-lg mb-10">Empieza gratis 14 días. Sin tarjeta de crédito.</p>

          {/* SWITCHES */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">

            {/* Billing toggle */}
            <div className="flex items-center bg-[#16161E] border border-white/8 rounded-full p-1 gap-1">
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
            <div className="flex items-center bg-[#16161E] border border-white/8 rounded-full p-1 gap-1">
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
        </section>

        {/* PLAN CARDS */}
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {PLANS_LIST.map(plan => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-7 border transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(124,58,237,0.15)] ${
                  plan.highlight
                    ? 'bg-[#16161E] border-[#7C3AED] shadow-[0_0_40px_rgba(124,58,237,0.12)]'
                    : 'bg-[#16161E] border-white/8'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-xl font-bold text-[#F1F0F5]">{plan.name}</h2>
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
                  href={plan.ctaHref}
                  className={`block text-center py-3 rounded-xl font-semibold transition mb-6 ${
                    plan.highlight
                      ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
                      : plan.isContact
                      ? 'border border-[#7C3AED]/40 text-[#C084FC] hover:bg-[#7C3AED]/10'
                      : 'bg-white/8 hover:bg-white/12 text-[#F1F0F5]'
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
              </div>
            ))}
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold text-center mb-8 text-[#F1F0F5]">Comparación detallada</h2>
          <div className="bg-[#111118] border border-white/8 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  <th className="text-left px-6 py-4 text-[#6B6480] font-semibold">Funcionalidad</th>
                  {PLANS_LIST.map(p => (
                    <th key={p.id} className={`px-4 py-4 font-bold text-center ${p.highlight ? 'text-[#C084FC]' : 'text-[#F1F0F5]'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr key={row.feature} className={`border-b border-white/4 ${i % 2 === 0 ? '' : 'bg-[#16161E]/50'}`}>
                    <td className="px-6 py-3.5 text-[#A09CB0]">{row.feature}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="px-4 py-3.5 text-center">
                        <Cell v={v} />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Price row */}
                <tr className="bg-[#16161E]">
                  <td className="px-6 py-4 font-semibold text-[#F1F0F5]">Precio mensual (USD)</td>
                  {PLANS_LIST.map(p => (
                    <td key={p.id} className="px-4 py-4 text-center">
                      <span className={`font-bold ${p.highlight ? 'text-[#C084FC]' : 'text-[#F1F0F5]'}`}>
                        {p.isContact ? 'Consultar' : `$${p.monthlyUSD}`}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold text-center mb-8 text-[#F1F0F5]">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {FAQS.map(faq => (
              <details key={faq.q} className="bg-[#16161E] border border-white/8 rounded-xl group">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-[#F1F0F5] font-semibold list-none marker:hidden">
                  {faq.q}
                  <span className="text-[#7C3AED] ml-4 flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-4 text-[#A09CB0] text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="bg-[#111118] border-t border-white/5 py-16 px-6 text-center">
          <h2 className="text-2xl font-bold mb-3 text-[#F1F0F5]">¿No sabes qué plan es el tuyo?</h2>
          <p className="text-[#A09CB0] mb-6">Recibe una recomendación personalizada y un análisis de ROI gratuito</p>
          <Link href="/audit" className="inline-block bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-4 rounded-xl font-bold transition">
            Solicitar Auditoría Gratis →
          </Link>
        </section>

      </div>
    </MainLayout>
  )
}
