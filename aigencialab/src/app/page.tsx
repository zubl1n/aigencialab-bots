import type { Metadata } from 'next'
import Link from 'next/link'
import { MainLayout } from '@/components/landing/MainLayout'
import { LandingPricing } from '@/components/landing/LandingPricing'

export const metadata: Metadata = {
  title: 'AigenciaLab.cl — Automatización IA para Empresas que Escalan',
  description: 'Agentes de IA autónomos para ventas, soporte y backoffice. Automatiza WhatsApp, e-commerce y logística con cumplimiento Ley N°21.663 Chile. Auditoría gratuita en 30 segundos.',
  alternates: { canonical: 'https://aigencialab.cl' },
}

const FEATURES = [
  {
    icon: '🤖',
    title: 'Agente de Ventas IA',
    desc: 'Califica leads, cotiza y cierra ventas en WhatsApp e Instagram — mientras tú duermes.',
    color: '#7C3AED',
  },
  {
    icon: '💬',
    title: 'Soporte Omnicanal 24/7',
    desc: 'Resuelve el 90% de consultas con RAG. Escala a humano cuando es necesario.',
    color: '#4F46E5',
  },
  {
    icon: '🎯',
    title: 'Captura de Leads',
    desc: 'Formularios conversacionales y calificación automática. Tu CRM siempre actualizado.',
    color: '#0EA5E9',
  },
  {
    icon: '🔗',
    title: 'AIgenciaLab Connect',
    desc: '150+ integraciones nativas: Shopify, HubSpot, MercadoPago, Google Calendar y más.',
    color: '#10B981',
  },
  {
    icon: '📊',
    title: 'Business Intelligence',
    desc: 'Dashboard en tiempo real con atribución de ingresos, churn, conversiones y SLA.',
    color: '#F59E0B',
  },
  {
    icon: '🚚',
    title: 'Logística y Trazabilidad',
    desc: 'Tracking de última milla con Starken y Chilexpress. Alertas automáticas de estado.',
    color: '#EF4444',
  },
]

const STEPS = [
  {
    n: '01',
    icon: '🔍',
    title: 'Auditoría gratuita',
    desc: 'Analizamos tu sitio y operación en 30 segundos. Te mostramos qué estás perdiendo sin IA.',
  },
  {
    n: '02',
    icon: '⚙️',
    title: 'Configuramos y entrenamos',
    desc: 'Tu ingeniero asignado entrena al agente con el conocimiento de tu negocio en 7 a 14 días.',
  },
  {
    n: '03',
    icon: '🚀',
    title: 'Go Live y escala',
    desc: 'Tu agente opera 24/7. Métricas en tiempo real, SLA garantizado y soporte continuo.',
  },
]

const TESTIMONIALS = [
  {
    text: 'El agente responde consultas de horarios y precios de forma impecable. Nuestro equipo ahora se concentra en atención presencial.',
    name: 'María José González',
    role: 'Clínica Dental Norte · Plan Starter',
    initials: 'MG',
    color: '#7C3AED',
  },
  {
    text: 'Con AIgenciaLab Connect conectamos el agente a nuestro inventario. Los clientes consultan stock por WhatsApp al instante.',
    name: 'Rodrigo Sanhueza',
    role: 'Importadora Del Pacífico · Plan Pro',
    initials: 'RS',
    color: '#4F46E5',
  },
  {
    text: 'La implementación fue en menos de 2 semanas. El equipo nos acompañó en todo el proceso de entrenamiento del agente.',
    name: 'Andrea Muñoz',
    role: 'Instituto de Idiomas Berlín · Plan Starter',
    initials: 'AM',
    color: '#0EA5E9',
  },
]

export default function LandingPage() {
  const waNumber = process.env.NEXT_PUBLIC_WA_SALES_NUMBER ?? '56912345678'

  return (
    <MainLayout>
      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(124,58,237,0.18) 0%, #0A0A0F 70%)' }}
        >
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          <div className="max-w-5xl mx-auto px-6 py-32 text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/25 text-[#C084FC] text-xs font-semibold px-4 py-2 rounded-full mb-8">
              <span className="w-1.5 h-1.5 bg-[#C084FC] rounded-full animate-pulse" />
              🇨🇱 Automatización IA para empresas chilenas · Ley N°21.663
            </div>

            {/* H1 */}
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6 tracking-tight text-white" id="hero-title">
              La IA que trabaja
              <br />
              <span
                style={{
                  backgroundImage: 'linear-gradient(135deg, #C084FC 0%, #7C3AED 40%, #4F46E5 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                mientras tú duermes.
              </span>
            </h1>

            <p className="text-[#A09CB0] text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Agentes autónomos que atienden clientes, capturan leads y automatizan operaciones —
              24/7, en tus canales actuales, en <strong className="text-white">14 días</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/audit"
                id="hero-cta-audit"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}
              >
                🔍 Auditar mi negocio — Gratis
              </Link>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                id="hero-cta-whatsapp"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white text-base border border-white/10 hover:bg-white/[0.06] transition-all"
              >
                💬 Hablar con un experto
              </a>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#4B4860]">
              <span>✦ +120 empresas activas</span>
              <span>✦ 84% menos tiempo operativo</span>
              <span>✦ Implementación en 14 días</span>
              <span>✦ Sin tarjeta requerida</span>
            </div>
          </div>
        </section>

        {/* ── STATS ────────────────────────────────────────────────────────── */}
        <section className="border-t border-white/[0.05]" style={{ background: '#07070F' }}>
          <div className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { value: '120+', label: 'Empresas chilenas activas', sub: 'e-commerce, clínicas, logística' },
              { value: '84%', label: 'Reducción en tiempo operativo', sub: 'vs. gestión manual' },
              { value: '14', label: 'Días de implementación', sub: 'promedio desde el inicio' },
            ].map(s => (
              <div key={s.value} className="flex flex-col items-center">
                <span
                  className="text-5xl font-extrabold mb-2"
                  style={{
                    backgroundImage: 'linear-gradient(135deg,#C084FC,#7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {s.value}
                </span>
                <span className="text-white font-semibold text-sm mb-1">{s.label}</span>
                <span className="text-[#6B6480] text-xs">{s.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── PROBLEM ──────────────────────────────────────────────────────── */}
        <section className="py-20 border-t border-white/[0.05]" style={{ background: '#0A0A0F' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#EF4444]/80 bg-[#EF4444]/10 border border-[#EF4444]/20 px-4 py-1.5 rounded-full">
                El costo oculto de no automatizar
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-5 mb-3">
                ¿Cuánto pierdes cada día?
              </h2>
              <p className="text-[#A09CB0] max-w-xl mx-auto">
                Cada hora que tus procesos corren en manual es dinero que se va.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '🌙', title: 'Consultas sin respuesta', desc: 'Fuera de horario, nadie atiende. El lead se va a la competencia.' },
                { icon: '📋', title: 'Leads sin calificar', desc: 'Tu equipo pierde horas separando contactos buenos de malos.' },
                { icon: '🔁', title: 'Procesos sin automatizar', desc: 'Facturación, seguimiento y reportes se hacen a mano.' },
                { icon: '📉', title: 'Métricas ciegas', desc: 'Sin datos en tiempo real, no sabes qué está fallando ni cuándo.' },
              ].map(p => (
                <div
                  key={p.title}
                  className="rounded-2xl p-5 border"
                  style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.12)' }}
                >
                  <div className="text-3xl mb-3">{p.icon}</div>
                  <h3 className="text-white font-semibold text-sm mb-2">{p.title}</h3>
                  <p className="text-[#6B6480] text-xs leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white border border-[#7C3AED]/40 hover:bg-[#7C3AED]/10 transition-all"
              >
                🔍 Descubrir mi diagnóstico gratis →
              </Link>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="py-20 border-t border-white/[0.05]" style={{ background: '#07070F' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C084FC] bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-4 py-1.5 rounded-full">
                Cómo funciona
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-5">
                De cero a automatizado en 3 pasos
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <div key={s.n} className="relative flex flex-col items-start">
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-full w-full h-px" style={{ background: 'linear-gradient(90deg,rgba(124,58,237,0.4),transparent)' }} />
                  )}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl flex-shrink-0"
                    style={{
                      background: 'linear-gradient(135deg,rgba(124,58,237,0.25),rgba(79,70,229,0.15))',
                      border: '1px solid rgba(124,58,237,0.35)',
                    }}
                  >
                    {s.icon}
                  </div>
                  <div className="text-[#7C3AED] text-xs font-bold tracking-widest mb-2">PASO {s.n}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-[#6B6480] text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section id="servicios" className="py-20 border-t border-white/[0.05]" style={{ background: '#0A0A0F' }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C084FC] bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-4 py-1.5 rounded-full">
                Productos
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-5">
                Un ecosistema completo de agentes IA
              </h2>
              <p className="text-[#A09CB0] mt-3 max-w-xl mx-auto">
                Despliégalos por separado o como suite integrada. Cada uno con API REST, webhooks y métricas en tiempo real.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(f => (
                <div
                  key={f.title}
                  className="group rounded-2xl p-6 border hover:border-opacity-60 transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.07)',
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 flex-shrink-0"
                    style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-white font-bold text-base mb-2 group-hover:text-[#C084FC] transition-colors">{f.title}</h3>
                  <p className="text-[#6B6480] text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────────── */}
        <LandingPricing />

        {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
        <section className="py-20 border-t border-white/[0.05]" style={{ background: '#07070F' }}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C084FC] bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-4 py-1.5 rounded-full">
                Casos de éxito
              </span>
              <h2 className="text-3xl font-bold text-white mt-5">
                Lo que dicen nuestros clientes
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {TESTIMONIALS.map(t => (
                <div
                  key={t.name}
                  className="flex flex-col rounded-2xl p-6 border"
                  style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
                  </div>
                  <p className="text-[#A09CB0] text-sm leading-relaxed flex-1 mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: t.color }}
                    >
                      {t.initials}
                    </div>
                    <div>
                      <div className="text-white font-semibold text-xs">{t.name}</div>
                      <div className="text-[#6B6480] text-[10px]">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPLIANCE ───────────────────────────────────────────────────── */}
        <section id="seguridad" className="py-16 border-t border-white/[0.05]" style={{ background: '#0A0A0F' }}>
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { law: 'Ley N°21.663', title: 'Marco Nacional de Ciberseguridad', desc: 'Logs de auditoría, respuesta a incidentes y gestión de vulnerabilidades certificada.' },
                { law: 'Ley N°19.628', title: 'Protección de Datos Personales', desc: 'Consentimiento explícito, derechos ARCO garantizados y cifrado AES-256 GCM en reposo.' },
              ].map(item => (
                <div key={item.law} className="rounded-2xl p-6 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="text-[#7C3AED] font-mono text-xs mb-2">{item.law}</div>
                  <h3 className="text-white font-bold mb-2">{item.title}</h3>
                  <p className="text-[#6B6480] text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
        <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #120820 0%, #0A0A0F 50%, #07070F 100%)' }}>
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #7C3AED 0%, transparent 70%)' }} />
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C084FC] bg-[#7C3AED]/10 border border-[#7C3AED]/20 px-4 py-1.5 rounded-full">
              🎁 100% Gratuito · Sin tarjeta
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-6 mb-4 leading-tight">
              Descubre en 30 segundos<br />
              <span style={{ backgroundImage: 'linear-gradient(135deg,#C084FC,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                dónde pierde dinero tu negocio
              </span>
            </h2>
            <p className="text-[#A09CB0] text-lg mb-10">
              Análisis real con Google PageSpeed + IA generativa. Score, problemas y oportunidades al instante.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/audit"
                id="final-cta-audit"
                className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', boxShadow: '0 12px 40px rgba(124,58,237,0.45)' }}
              >
                🔍 Iniciar auditoría gratuita →
              </Link>
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-5 rounded-2xl font-bold text-white text-lg border border-white/10 hover:bg-white/[0.05] transition-all"
              >
                💬 Hablar por WhatsApp
              </a>
            </div>
            <p className="mt-6 text-xs text-[#4B4860]">🔒 Datos protegidos bajo Ley N°19.628 · Sin spam · Sin tarjeta requerida</p>
          </div>
        </section>
      </main>

      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'AIgenciaLab',
              url: 'https://aigencialab.cl',
              logo: 'https://aigencialab.cl/og-image.png',
              description: 'Plataforma SaaS de agentes IA autónomos para empresas chilenas.',
              address: { '@type': 'PostalAddress', addressCountry: 'CL' },
              contactPoint: { '@type': 'ContactPoint', contactType: 'sales', availableLanguage: 'Spanish' },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'AIgenciaLab',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              url: 'https://aigencialab.cl',
              description: 'Agentes IA conversacionales para automatizar ventas, soporte y captación de leads en empresas chilenas.',
              offers: { '@type': 'Offer', price: '45000', priceCurrency: 'CLP', priceValidUntil: '2027-12-31' },
              aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '127' },
            },
          ]),
        }}
      />
    </MainLayout>
  )
}