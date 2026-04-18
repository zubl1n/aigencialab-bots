'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check, X, ChevronDown, ChevronUp,
  Zap, Rocket, Gem, Building2, Shield, RefreshCw
} from 'lucide-react';
import type { PlanConfig } from '@/config/plans';

type BillingCycle = 'monthly' | 'annual';

function fmt(n: number) { return `$${n.toLocaleString('es-CL')}`; }

const ICONS: Record<string, React.ReactNode> = {
  basic:      <Zap className="w-5 h-5" />,
  starter:    <Rocket className="w-5 h-5" />,
  pro:        <Gem className="w-5 h-5" />,
  enterprise: <Building2 className="w-5 h-5" />,
};

const TABLE_ROWS = [
  { label: 'Agentes IA',              values: ['1', '3', '∞', '∞'] },
  { label: 'Conversaciones/mes',      values: ['500', '2.000', '∞', '∞'] },
  { label: 'Usuarios',                values: ['2', '5', '∞', '∞'] },
  { label: 'Webchat',                 values: [true, true, true, true] },
  { label: 'WhatsApp Business',       values: [false, true, true, true] },
  { label: 'Instagram',               values: [false, 'BETA', true, true] },
  { label: 'Facebook Messenger',      values: [false, false, true, true] },
  { label: 'Canal personalizado',     values: [false, false, false, true] },
  { label: 'AIgenciaLab Connect',     values: [false, 'Básico', 'Completo', 'Custom'] },
  { label: 'Dashboard métricas',      values: ['Básico', 'Avanzado', 'Full', 'Custom'] },
  { label: 'Calificación de leads',   values: [false, true, true, true] },
  { label: 'Consultoría mensual',     values: [false, false, true, true] },
  { label: 'App móvil iOS/Android',   values: [true, true, true, true] },
  { label: 'Garantía',                values: ['15 días', '30 días', 'ROI', 'SLA'] },
];

const FAQS = [
  { q: '¿Qué es una conversación?', a: 'Un intercambio completo entre tu agente IA y un usuario, independiente del número de mensajes. Si el mismo usuario escribe por WhatsApp y web en el mismo día, son 2 conversaciones.' },
  { q: '¿Cuándo empieza la suscripción?', a: 'El mes 1 es implementación (pago único). El mes 2 es activación sin cobro. La suscripción mensual comienza el día 61.' },
  { q: '¿Puedo cambiar de plan?', a: 'Sí. Upgrade inmediato desde tu panel. Downgrade al siguiente período. Sin penalidades.' },
  { q: '¿Hay contrato mínimo?', a: 'No. Mensual y anual son sin permanencia. Enterprise tiene contrato anual con condiciones negociadas.' },
  { q: '¿Cuánto tarda la implementación?', a: '7–14 días hábiles: configuración (2–3 d), entrenamiento (3–5 d), revisión y ajustes (2–3 d) y verificación final.' },
  { q: '¿Qué pasa si supero el límite de conversaciones?', a: 'Basic cobra $60 CLP/conv adicional. Starter $50 CLP/conv. Pro y Enterprise son ilimitados. Te avisamos antes de llegar al límite.' },
];

function CellVal({ v }: { v: string | boolean | null }) {
  if (v === true)  return <span className="text-emerald-400 text-base">✓</span>;
  if (v === false || v === null) return <span className="text-white/20">—</span>;
  if (v === 'BETA') return <span className="text-amber-400 text-xs font-bold">BETA</span>;
  return <span className="text-[#A09CB0] text-xs font-medium">{v}</span>;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
      >
        <span className="font-semibold text-white text-sm pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-[#7C3AED] flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-[#6B6480] flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white/[0.01] text-[#A09CB0] text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

export default function PricingPageClient({ plans, usdRate }: { plans: PlanConfig[]; usdRate: number }) {
  const [billing, setBilling] = useState<BillingCycle>('monthly');

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', color: '#F1F0F5' }}>

      {/* HERO */}
      <section className="pt-24 pb-16 px-6 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/25 text-[#C084FC] text-xs font-semibold px-4 py-2 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-[#C084FC] rounded-full animate-pulse" />
          +120 empresas en Chile confían en AIgenciaLab
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
          Planes simples,{' '}
          <span style={{ backgroundImage: 'linear-gradient(135deg,#C084FC,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            resultados reales
          </span>
        </h1>
        <p className="text-[#A09CB0] text-lg mb-8">
          Implementación guiada el mes 1 · Mes 2 sin cobro · Suscripción desde el mes 3
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex bg-white/[0.04] border border-white/[0.08] rounded-full p-1 gap-1">
            {(['monthly', 'annual'] as BillingCycle[]).map(b => (
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

        <div className="flex items-center justify-center gap-1.5 text-xs text-[#4B4860]">
          <RefreshCw className="w-3 h-3" />
          <span>TC referencial: 1 USD ≈ {usdRate.toLocaleString('es-CL')} CLP · Precios oficiales en CLP</span>
        </div>
      </section>

      {/* CARDS */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map(plan => {
            const monthlyPrice = billing === 'annual' && plan.annualPriceCLP
              ? plan.annualPriceCLP
              : plan.monthlyPriceCLP;

            return (
              <div
                key={plan.slug}
                className="relative flex flex-col rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                style={{
                  background: plan.isFeatured
                    ? 'linear-gradient(160deg,rgba(124,58,237,0.2) 0%,rgba(10,10,20,1) 60%)'
                    : 'rgba(255,255,255,0.03)',
                  border: plan.isFeatured ? '1px solid rgba(124,58,237,0.5)' : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: plan.isFeatured ? '0 0 50px rgba(124,58,237,0.15)' : 'none',
                }}
              >
                {plan.isFeatured && (
                  <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg,transparent,#7C3AED,transparent)' }} />
                )}
                {plan.badgeLabel && (
                  <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#7C3AED] text-white">
                      {plan.badgeLabel}
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-2.5 mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: plan.isFeatured ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.06)',
                        color: plan.isFeatured ? '#C084FC' : '#A09CB0',
                        border: plan.isFeatured ? '1px solid rgba(124,58,237,0.35)' : '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      {ICONS[plan.slug]}
                    </div>
                    <div>
                      <div className="font-bold text-white">{plan.name}</div>
                      <div className="text-[#6B6480] text-xs leading-snug">{plan.tagline}</div>
                    </div>
                  </div>

                  {/* Pricing */}
                  {plan.isEnterprise ? (
                    <div className="mb-5">
                      <div className="text-2xl font-extrabold text-white">A consultar</div>
                      <div className="text-xs text-[#6B6480] mt-1">Solución a medida</div>
                    </div>
                  ) : (
                    <div className="mb-4 space-y-1">
                      <div className="text-[11px] text-[#6B6480] uppercase tracking-wide font-medium">Impl. mes 1</div>
                      <div className="text-sm font-bold text-[#A09CB0]">{fmt(plan.implPriceCLP!)} <span className="text-[#6B6480] font-normal">pago único</span></div>

                      <div className="pt-3">
                        <div className="text-[11px] text-[#6B6480] uppercase tracking-wide font-medium mb-1">Mes 3+ suscripción</div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold" style={{ color: plan.isFeatured ? '#C084FC' : '#F1F0F5' }}>
                            {fmt(monthlyPrice!)}
                          </span>
                          <span className="text-[#6B6480] text-sm">/mes</span>
                        </div>
                        {billing === 'annual' && plan.annualPriceCLP && (
                          <p className="text-emerald-400 text-xs mt-1 font-medium">✓ Ahorra 20% pagando anual</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs pt-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-[#A09CB0]">Mes 2: <strong className="text-emerald-400">sin cobro</strong></span>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <Link
                    href={plan.isEnterprise ? '/agendar' : `/checkout/${plan.slug}`}
                    className="block text-center py-2.5 rounded-xl font-bold text-sm transition-all mb-5"
                    style={
                      plan.isFeatured
                        ? { background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }
                        : plan.isEnterprise
                        ? { border: '1px solid rgba(124,58,237,0.4)', color: '#C084FC' }
                        : { background: 'rgba(255,255,255,0.08)', color: '#F1F0F5' }
                    }
                  >
                    {plan.isEnterprise ? 'Hablar con un ejecutivo' : 'Contratar ahora →'}
                  </Link>

                  {/* Features */}
                  <ul className="space-y-2 flex-1">
                    {(plan.features as readonly string[]).map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 mt-0.5 text-[#7C3AED] flex-shrink-0" />
                        <span className="text-[#A09CB0]">{f}</span>
                      </li>
                    ))}
                    {(plan.notIncluded as readonly string[]).map(f => (
                      <li key={f} className="flex items-start gap-2 text-xs opacity-30">
                        <X className="w-3.5 h-3.5 mt-0.5 text-[#6B6480] flex-shrink-0" />
                        <span className="text-[#6B6480] line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.guarantee && (
                    <div className="mt-4 pt-4 border-t border-white/[0.06] text-center text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3" />{plan.guarantee}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BILLING MODEL */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8">
          <h2 className="text-lg font-bold text-white text-center mb-8">¿Cómo funciona el modelo de cobro?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n: '1', c: '#7C3AED', t: 'Mes 1 — Implementación', d: 'Pago único. Tu ingeniero asignado configura y entrena el agente IA en tu negocio.' },
              { n: '2', c: '#10B981', t: 'Mes 2 — Sin cobro', d: 'Período de activación. El bot opera y se optimiza sin costo mensual.' },
              { n: '3+', c: '#4F46E5', t: 'Mes 3+ — Suscripción', d: 'Se activa la suscripción mensual recurrente. Cancelable cuando quieras.' },
            ].map(s => (
              <div key={s.n} className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold" style={{ background: s.c }}>
                  {s.n}
                </div>
                <div className="font-semibold text-white mb-1 text-sm">{s.t}</div>
                <div className="text-xs text-[#6B6480] leading-relaxed">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Comparación detallada</h2>
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.07]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th className="text-left px-6 py-4 text-[#6B6480] font-semibold w-1/3">Funcionalidad</th>
                  {plans.map(p => (
                    <th key={p.slug} className={`px-4 py-4 font-bold text-center text-sm ${p.isFeatured ? 'text-[#C084FC]' : 'text-white'}`}>
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr key={row.label} className={`border-b border-white/[0.04] ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                    <td className="px-6 py-3 text-[#A09CB0] font-medium text-xs">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="px-4 py-3 text-center"><CellVal v={v as string | boolean | null} /></td>
                    ))}
                  </tr>
                ))}
                <tr className="border-t border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <td className="px-6 py-4 text-white font-semibold text-xs">Precio mensual (mes 3+)</td>
                  {plans.map(p => (
                    <td key={p.slug} className="px-4 py-4 text-center">
                      <span className={`font-bold text-sm ${p.isFeatured ? 'text-[#C084FC]' : 'text-white'}`}>
                        {p.monthlyPriceCLP ? fmt(p.monthlyPriceCLP) : 'A consultar'}
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Lo que dicen nuestros clientes</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { name: 'María José González', company: 'Clínica Dental Norte · Starter', text: 'El agente responde las consultas de horarios de forma impecable. Nuestro equipo se concentra en atención presencial.' },
            { name: 'Rodrigo Sanhueza', company: 'Importadora Del Pacífico · Pro', text: 'Con Connect integramos el agente a nuestro inventario. Los clientes consultan stock por WhatsApp al instante.' },
            { name: 'Andrea Muñoz', company: 'Instituto de Idiomas · Starter', text: 'La implementación fue en menos de 2 semanas. El equipo de AIgenciaLab nos acompañó en todo el proceso.' },
          ].map(t => (
            <div key={t.name} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}</div>
              <p className="text-[#A09CB0] text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div>
                <div className="text-white font-semibold text-sm">{t.name}</div>
                <div className="text-[#6B6480] text-xs">{t.company}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQS.map(faq => <FAQItem key={faq.q} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 text-center" style={{ background: 'linear-gradient(135deg,#120820,#0A0A0F)' }}>
        <h2 className="text-3xl font-bold text-white mb-3">¿Listo para automatizar tu negocio?</h2>
        <p className="text-[#A09CB0] mb-8 max-w-lg mx-auto">Tu ingeniero asignado te acompaña desde el primer día.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/checkout/starter"
            className="px-8 py-4 rounded-2xl font-bold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 8px 30px rgba(124,58,237,0.35)' }}
          >
            Empezar ahora →
          </Link>
          <Link
            href="/agendar"
            className="px-8 py-4 rounded-2xl font-bold text-white border border-white/10 hover:bg-white/[0.05] transition-all"
          >
            Hablar con un experto
          </Link>
        </div>
      </section>
    </div>
  );
}
