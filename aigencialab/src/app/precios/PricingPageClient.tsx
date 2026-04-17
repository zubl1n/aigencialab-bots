'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, ChevronDown, ChevronUp, Zap, Shield, Globe, MessageSquare, BarChart, RefreshCw } from 'lucide-react';
import type { PlanConfig } from '@/config/plans';
import { formatCLP, formatUSDRef } from '@/config/plans';

// ── Types ─────────────────────────────────────────────────────────────────────
type BillingCycle = 'monthly' | 'annual';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtCLP(n: number): string {
  return `$${n.toLocaleString('es-CL')}`;
}

function ChannelPill({ channel }: { channel: string }) {
  const isBeta = channel.includes('BETA');
  const label = channel.replace('_BETA', '').replace('_', ' ');
  if (isBeta) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        {label} <span className="text-[10px] font-bold">BETA</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
      {label}
    </span>
  );
}

// ── Comparison Table data ─────────────────────────────────────────────────────
const TABLE_ROWS: { feature: string; values: (string | boolean | null)[] }[] = [
  { feature: 'Agentes IA',              values: ['1',     '3',     '∞',        '∞'] },
  { feature: 'Conversaciones/mes',      values: ['500',   '2.000', '∞',        '∞'] },
  { feature: 'Usuarios del workspace',  values: ['2',     '5',     '∞',        '∞'] },
  { feature: 'Webchat',                 values: [true,    true,    true,       true] },
  { feature: 'WhatsApp Business',       values: [false,   true,    true,       true] },
  { feature: 'Instagram',               values: [false,   'BETA',  true,       true] },
  { feature: 'Facebook Messenger',      values: [false,   false,   true,       true] },
  { feature: 'Canal personalizado',     values: [false,   false,   false,      true] },
  { feature: 'AIgenciaLab Connect',     values: [false,   'Básico','Completo', 'Custom'] },
  { feature: 'Dashboard de métricas',   values: ['Básico','Avanz.','Full',     'Custom'] },
  { feature: 'Calificación de leads',   values: [false,   true,    true,       true] },
  { feature: 'Múltiples embudos',       values: [false,   false,   true,       true] },
  { feature: 'Consultoría mensual',     values: [false,   false,   true,       true] },
  { feature: 'App móvil iOS/Android',   values: [true,    true,    true,       true] },
  { feature: 'Soporte WhatsApp',        values: [true,    'Prio.', 'Gold',     '24/7 SLA'] },
  { feature: 'Garantía',               values: ['15 días','30 días','ROI',    'SLA'] },
];

const FAQS = [
  { q: '¿Qué es una conversación y cómo se cuenta?', a: 'Una conversación es un intercambio completo de mensajes entre tu agente IA y un usuario en cualquier canal. Se conta una por sesión, independiente del número de mensajes. Si un usuario escribe por WhatsApp y web en el mismo día, son 2 conversaciones.' },
  { q: '¿Cuándo empieza mi suscripción mensual?', a: 'Tu suscripción recurrente comienza el día 61, es decir, 2 meses después de tu pago de implementación. El mes 1 es de implementación y entrenamiento (pago único). El mes 2 es el período de activación y ajuste, sin cobro mensual.' },
  { q: '¿Qué pasa si supero mi límite de conversaciones?', a: 'Los planes Basic y Starter cobran un pequeño monto por conversación adicional (Basic: $60 CLP/conv, Starter: $50 CLP/conv). El plan Pro es ilimitado según contrato. Siempre te notificaremos antes de que llegues al límite.' },
  { q: '¿Puedo cambiar de plan en cualquier momento?', a: 'Sí. Puedes hacer upgrade en cualquier momento desde tu panel de facturación. El downgrade se aplica al siguiente período de facturación. No hay penalidades por cambio de plan.' },
  { q: '¿Con qué canales es compatible cada plan?', a: 'Basic: Webchat. Starter: Webchat + WhatsApp Business + Instagram (beta). Pro: todos los canales incluyendo Facebook Messenger. Enterprise: todos los canales + integraciones personalizadas.' },
  { q: '¿Hay contrato mínimo de permanencia?', a: 'No. Los planes mensual y anual son sin contrato de permanencia. Puedes cancelar cuando quieras. El plan Enterprise tiene contrato anual con condiciones pactadas.' },
  { q: '¿Cómo funciona el mes de implementación?', a: 'El mes 1 es un pago único que cubre: configuración del agente IA, entrenamiento con el conocimiento de tu negocio, instalación en los canales contratados, y sesiones de onboarding con un ingeniero asignado.' },
  { q: '¿Cómo se instala el agente en mi sitio web?', a: 'Es muy sencillo: copias un snippet de JavaScript que te generamos y lo pegas antes del </body> de tu sitio. Compatible con HTML, WordPress, Shopify, Wix, Webflow y Next.js. El dashboard te confirma cuando lo detecta instalado.' },
  { q: '¿Cuánto tiempo tarda en estar listo mi agente?', a: 'En promedio 7–14 días hábiles desde el pago de implementación. El proceso incluye: configuración técnica (2–3 días), entrenamiento del agente (3–5 días), revisión y ajustes con el cliente (2–3 días), y verificación final.' },
  { q: '¿Qué información necesitan para entrenar al agente?', a: 'Necesitamos: descripción de tu negocio y servicios, preguntas frecuentes de tus clientes, políticas de precios/devoluciones, horarios y ubicación, y cualquier documento relevante (catálogos, PDFs). Nuestro equipo te guía en el proceso.' },
  { q: '¿Cómo funcionan los pagos desde el exterior?', a: 'MercadoPago Chile gestiona los pagos en CLP. Si pagas con tarjeta extranjera, tu banco hace la conversión automáticamente. El precio oficial siempre es en CLP; el equivalente en USD mostrado es solo referencial.' },
  { q: '¿Puedo integrar AIgenciaLab con mi CRM actual?', a: 'Sí, desde el plan Starter con AIgenciaLab Connect (integración con HubSpot, Zoho, Pipedrive). El plan Pro incluye todas las integraciones: Salesforce, Google Sheets, Shopify, Stripe y más. Enterprise incluye desarrollos a medida para cualquier sistema.' },
];

// ── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  usdRate,
  billing,
  delay,
}: {
  plan: PlanConfig;
  usdRate: number;
  billing: BillingCycle;
  delay: number;
}) {
  const isEnterprise = plan.isEnterprise;
  const isFeatured   = plan.isFeatured;

  const monthlyPrice = billing === 'annual' && plan.annualPriceCLP
    ? plan.annualPriceCLP
    : plan.monthlyPriceCLP;

  const usdRef = monthlyPrice ? formatUSDRef(monthlyPrice, usdRate) : '';

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
        isEnterprise
          ? 'bg-[#0a0f1e] border-[#1e3a5f] text-white'
          : isFeatured
          ? 'bg-white border-blue-600 border-2 shadow-[0_20px_60px_rgba(29,78,216,0.15)]'
          : 'bg-white border-[#e2e8f0] shadow-sm hover:shadow-md'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Badge */}
      {plan.badgeLabel && (
        <div
          className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
            isEnterprise
              ? 'bg-[#1e3a5f] text-white border border-[#2d5f9e]'
              : isFeatured
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-white'
          }`}
        >
          {plan.badgeLabel}
        </div>
      )}

      <div className={`flex flex-col flex-1 p-7 ${plan.badgeLabel ? 'pt-9' : ''}`}>
        {/* Header */}
        <div className="mb-5">
          <h2 className={`text-xl font-bold mb-1 ${isEnterprise ? 'text-white' : 'text-slate-900'}`}>
            {plan.name}
          </h2>
          <p className={`text-sm ${isEnterprise ? 'text-slate-400' : 'text-slate-500'}`}>
            {plan.tagline}
          </p>
        </div>

        {/* Price block */}
        <div className="mb-6 space-y-2">
          {isEnterprise ? (
            <div className="text-3xl font-bold text-white">A consultar</div>
          ) : (
            <>
              {/* Implementation */}
              <div className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isEnterprise ? 'text-slate-400' : 'text-slate-400'}`}>
                Mes 1 — Implementación
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${isEnterprise ? 'text-white' : 'text-slate-900'}`}>
                  {fmtCLP(plan.implPriceCLP!)}
                </span>
                <span className="text-xs text-slate-400">pago único</span>
              </div>
              {plan.implPriceCLP && (
                <div className="text-xs text-slate-400">
                  {formatUSDRef(plan.implPriceCLP, usdRate)} <span className="text-slate-300">(referencial)</span>
                </div>
              )}

              {/* Month 2 free */}
              <div className="flex items-center gap-1.5 text-sm">
                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span className={isEnterprise ? 'text-slate-300' : 'text-slate-600'}>
                  Mes 2: <strong className="text-emerald-600">Sin cobro</strong>
                </span>
              </div>

              {/* Monthly recurring */}
              <div className={`mt-2 pt-2 border-t ${isEnterprise ? 'border-[#1e3a5f]' : 'border-slate-100'}`}>
                <div className="text-xs text-slate-400 mb-0.5">Mes 3 en adelante</div>
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-bold ${isFeatured ? 'text-blue-600' : isEnterprise ? 'text-white' : 'text-slate-900'}`}>
                    {fmtCLP(monthlyPrice!)}
                  </span>
                  <span className="text-sm text-slate-400">/mes</span>
                </div>
                {usdRef && (
                  <div className="text-xs text-slate-400">
                    {usdRef}/mes <span className="text-slate-300">(referencial)</span>
                  </div>
                )}
                {billing === 'annual' && plan.annualPriceCLP && (
                  <div className="text-xs text-emerald-600 font-medium mt-1">
                    ✓ Precio anual — Ahorra 20%
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Conversations included */}
        {!isEnterprise && (
          <div className={`text-center py-2 px-3 rounded-lg mb-5 ${isFeatured ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'}`}>
            <span className="text-lg font-bold">
              {plan.conversations === null ? '∞' : plan.conversations.toLocaleString('es-CL')}
            </span>
            <span className="text-xs ml-1">conversaciones/mes</span>
          </div>
        )}

        {isEnterprise && (
          <div className="text-sm text-slate-300 mb-5 leading-relaxed">
            Soluciones a medida para equipos de +20 personas con infraestructura dedicada,
            integraciones custom y SLA contractual garantizado.
          </div>
        )}

        {/* CTA */}
        <Link
          href={plan.ctaPath}
          className={`block text-center py-3 px-4 rounded-xl font-semibold transition-all duration-200 mb-6 ${
            isEnterprise
              ? 'bg-white text-slate-900 hover:bg-slate-100'
              : isFeatured
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {plan.ctaLabel}
        </Link>

        {/* Channels */}
        {!isEnterprise && (
          <div className="mb-5">
            <div className="text-xs text-slate-400 mb-2 font-medium">Canales:</div>
            <div className="flex flex-wrap gap-1.5">
              {plan.channels.map((ch) => (
                <ChannelPill key={ch} channel={ch} />
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div className="flex-1 space-y-2">
          {plan.features.map((f) => (
            <div key={f} className="flex items-start gap-2 text-sm">
              <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isEnterprise ? 'text-emerald-400' : 'text-emerald-500'}`} />
              <span className={isEnterprise ? 'text-slate-300' : 'text-slate-700'}>{f}</span>
            </div>
          ))}
          {(plan.notIncluded as readonly string[]).map((f) => (
            <div key={f} className="flex items-start gap-2 text-sm opacity-40">
              <X className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isEnterprise ? 'text-slate-500' : 'text-slate-400'}`} />
              <span className={`line-through ${isEnterprise ? 'text-slate-500' : 'text-slate-400'}`}>{f}</span>
            </div>
          ))}
        </div>

        {/* Guarantee pill */}
        {plan.guarantee && (
          <div className={`mt-5 pt-4 border-t text-xs text-center font-medium ${
            isEnterprise
              ? 'border-[#1e3a5f] text-emerald-400'
              : 'border-slate-100 text-emerald-600'
          }`}>
            <Shield className="w-3.5 h-3.5 inline mr-1" />
            {plan.guarantee}
          </div>
        )}
      </div>
    </div>
  );
}

// ── FAQ Item ──────────────────────────────────────────────────────────────────
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-slate-900 pr-4">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-4 bg-white text-slate-600 text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

// ── ComparisonTable ───────────────────────────────────────────────────────────
function CellValue({ v }: { v: string | boolean | null }) {
  if (v === true)  return <span className="text-emerald-600 font-bold text-base">✓</span>;
  if (v === false) return <span className="text-slate-300">—</span>;
  if (v === null)  return <span className="text-slate-300">—</span>;
  return <span className="text-slate-700 text-sm font-medium">{v}</span>;
}

// ── Main Client Component ─────────────────────────────────────────────────────
export default function PricingPageClient({
  plans,
  usdRate,
}: {
  plans: PlanConfig[];
  usdRate: number;
}) {
  const [billing, setBilling] = useState<BillingCycle>('monthly');

  return (
    <div className="bg-[#f8fafc] min-h-screen">

      {/* HERO */}
      <section className="pt-24 pb-16 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100 mb-6">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
          Más de 120 empresas en Chile confían en AIgenciaLab
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
          Planes simples,{' '}
          <span className="text-blue-600">resultados reales</span>
        </h1>
        <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
          Implementación guiada el mes 1. Mes 2 sin cobro para ajustes y optimización.
          Suscripción mensual recién a partir del mes 3.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billing === 'monthly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              billing === 'annual'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anual
            <span className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded-full font-bold">
              −20%
            </span>
          </button>
        </div>

        {/* FX Banner */}
        <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <RefreshCw className="w-3 h-3" />
          <span>
            Tipo de cambio referencial: 1 USD ≈ {usdRate.toLocaleString('es-CL')} CLP ·
            Los precios oficiales son siempre en CLP
          </span>
        </div>
      </section>

      {/* PLAN CARDS GRID */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <PlanCard
              key={plan.slug}
              plan={plan}
              usdRate={usdRate}
              billing={billing}
              delay={i * 80}
            />
          ))}
        </div>
      </section>

      {/* BILLING TIMELINE INFO */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
            ¿Cómo funciona el modelo de cobro?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">1</span>
              </div>
              <div className="font-semibold text-slate-900 mb-1">Mes 1 — Implementación</div>
              <div className="text-sm text-slate-500">
                Pago único de implementación. Tu ingeniero asignado configura y entrena el agente IA.
              </div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">2</span>
              </div>
              <div className="font-semibold text-slate-900 mb-1">Mes 2 — Sin cobro</div>
              <div className="text-sm text-slate-500">
                Período de activación y ajuste. El agente opera y se optimiza sin costo mensual.
              </div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold">3+</span>
              </div>
              <div className="font-semibold text-slate-900 mb-1">Mes 3+ — Suscripción</div>
              <div className="text-sm text-slate-500">
                Tu agente opera de forma autónoma. Se activa la suscripción mensual recurrente.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Comparación detallada
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-4 text-slate-500 font-semibold w-1/3">Funcionalidad</th>
                  {plans.map((p) => (
                    <th
                      key={p.slug}
                      className={`px-4 py-4 font-bold text-center ${
                        p.isFeatured ? 'text-blue-600' : p.isEnterprise ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-slate-100 ${i % 2 !== 0 ? 'bg-slate-50/50' : ''}`}
                  >
                    <td className="px-6 py-3.5 text-slate-600 font-medium">{row.feature}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="px-4 py-3.5 text-center">
                        <CellValue v={v} />
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Price row */}
                <tr className="bg-slate-50 font-semibold">
                  <td className="px-6 py-4 text-slate-900">Precio mensual (mes 3+)</td>
                  {plans.map((p) => (
                    <td key={p.slug} className="px-4 py-4 text-center">
                      <span className={p.isFeatured ? 'text-blue-600 font-bold' : 'text-slate-900 font-bold'}>
                        {p.monthlyPriceCLP ? fmtCLP(p.monthlyPriceCLP) : 'A consultar'}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className="font-semibold">
                  <td className="px-6 py-4 text-slate-900">Implementación (mes 1)</td>
                  {plans.map((p) => (
                    <td key={p.slug} className="px-4 py-4 text-center text-slate-600">
                      {p.implPriceCLP ? fmtCLP(p.implPriceCLP) : 'A consultar'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* AIGENCIALAB CONNECT HIGHLIGHT */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-[#0a0f1e] to-[#1e3a5f] rounded-3xl p-10 md:p-14 text-white">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/30 mb-4">
                <Zap className="w-3.5 h-3.5" /> Módulo exclusivo
              </div>
              <h2 className="text-3xl font-bold mb-3">AIgenciaLab Connect</h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                Conecta tu agente IA con CRMs, calendarios, pasarelas de pago y sistemas propios.
                Sin código. Tu agente no solo responde preguntas — ejecuta acciones reales para tu negocio.
              </p>
              <div className="space-y-2">
                {['Actualiza el CRM cuando llega un lead', 'Agenda en Google Calendar de forma autónoma', 'Consulta stock en Shopify en tiempo real', 'Registra y gestiona pagos vía MercadoPago'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['HubSpot', 'Salesforce', 'Google Calendar', 'Calendly', 'Shopify', 'MercadoPago', 'Slack', 'Google Sheets'].map((int) => (
                <div key={int} className="bg-white/8 backdrop-blur border border-white/10 rounded-xl p-3 text-sm font-medium text-slate-200 text-center">
                  {int}
                </div>
              ))}
              <div className="col-span-2 bg-blue-600/20 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-300 text-center font-medium">
                +150 integraciones disponibles →
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Lo que dicen nuestros clientes
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'María José González', company: 'Clínica Dental Norte', plan: 'Starter', text: 'El agente responde las consultas de horarios y precios de forma impecable. Nuestro equipo ahora se concentra en atención presencial.' },
            { name: 'Rodrigo Sanhueza', company: 'Importadora Del Pacífico', plan: 'Pro', text: 'Con AIgenciaLab Connect conectamos el agente a nuestro inventario en tiempo real. Los clientes consultan stock por WhatsApp y reciben respuesta al instante.' },
            { name: 'Andrea Muñoz', company: 'Instituto de Idiomas Berlín', plan: 'Starter', text: 'La implementación fue en menos de 2 semanas. El equipo de AIgenciaLab nos acompañó en todo el proceso de entrenamiento del agente.' },
          ].map((t) => (
            <div key={t.name} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-amber-400">★</span>
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div>
                <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                <div className="text-xs text-slate-500">{t.company} · Plan {t.plan}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Preguntas frecuentes
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[#0a0f1e] py-20 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-3">
          ¿Listo para automatizar tu negocio?
        </h2>
        <p className="text-slate-400 mb-8 max-w-xl mx-auto">
          Empieza con el plan que mejor se adapte a tu operación.
          Tu ingeniero asignado te acompaña desde el primer día.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/checkout/starter"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-200"
          >
            Empezar ahora →
          </Link>
          <Link
            href="/agendar"
            className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-8 py-4 rounded-xl font-bold transition-all duration-200"
          >
            Hablar con un experto
          </Link>
        </div>
      </section>
    </div>
  );
}
