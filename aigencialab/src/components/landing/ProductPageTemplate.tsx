/**
 * ProductPageTemplate — Reusable dark template for productos & soluciones pages.
 * Usage: import and pass config props.
 */
import Link from 'next/link'

interface Step {
  number: string
  title: string
  body: string
}

interface UseCase {
  title: string
  body: string
  icon: string
}

interface Metric {
  value: string
  label: string
}

interface FAQ {
  q: string
  a: string
}

interface ProductPageTemplateProps {
  badge: string
  title: string
  subtitle: string
  emoji: string
  metrics: Metric[]
  benefits: string[]
  steps: Step[]
  useCases: UseCase[]
  faqs: FAQ[]
}

export function ProductPageTemplate({
  badge, title, subtitle, emoji, metrics, benefits, steps, useCases, faqs,
}: ProductPageTemplateProps) {
  return (
    <div className="bg-[#0A0A0F] min-h-screen text-[#F1F0F5]">

      {/* HERO */}
      <header className="pt-24 pb-20 px-6 max-w-5xl mx-auto text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(124,58,237,0.12),transparent)] pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#C084FC] text-xs font-semibold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            {badge}
          </div>
          <div className="text-6xl mb-5">{emoji}</div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            {title.split('**').map((part, i) =>
              i % 2 === 1
                ? <span key={i} className="bg-clip-text text-transparent bg-gradient-to-r from-[#C084FC] to-[#7C3AED]">{part}</span>
                : <span key={i}>{part}</span>
            )}
          </h1>
          <p className="text-[#A09CB0] text-lg md:text-xl max-w-2xl mx-auto mb-10">{subtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-4 rounded-xl font-bold transition hover:shadow-[0_8px_30px_rgba(124,58,237,0.4)]">
              Probar gratis 14 días →
            </Link>
            <Link href="/audit" className="border border-[#7C3AED]/40 text-[#C084FC] hover:bg-[#7C3AED]/10 px-8 py-4 rounded-xl font-semibold transition">
              Auditoría Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* METRICS */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-3 gap-4">
          {metrics.map(m => (
            <div key={m.label} className="bg-[#16161E] border border-white/8 rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold text-[#C084FC] mb-1">{m.value}</div>
              <div className="text-[#6B6480] text-sm">{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-[#111118] border-y border-white/5 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-[#F1F0F5]">Beneficios clave</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map(b => (
              <div key={b} className="flex items-start gap-3 bg-[#16161E] border border-white/8 rounded-xl px-5 py-4 hover:border-[#7C3AED]/30 transition">
                <span className="text-[#7C3AED] font-bold mt-0.5 flex-shrink-0">✓</span>
                <span className="text-[#A09CB0] text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-12 text-[#F1F0F5]">Cómo funciona</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#C084FC] text-xl font-bold flex items-center justify-center mx-auto mb-5">
                {step.number}
              </div>
              {i < steps.length - 1 && (
                <div className="absolute top-7 left-[calc(50%+28px)] right-[calc(-50%+28px)] h-px bg-gradient-to-r from-[#7C3AED]/40 to-transparent hidden md:block" />
              )}
              <h3 className="font-bold text-[#F1F0F5] mb-2">{step.title}</h3>
              <p className="text-[#A09CB0] text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* USE CASES */}
      <section className="bg-[#111118] border-y border-white/5 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12 text-[#F1F0F5]">Casos de uso</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map(uc => (
              <div key={uc.title} className="bg-[#16161E] border border-white/8 rounded-2xl p-6 hover:border-[#7C3AED]/30 transition hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(124,58,237,0.1)]">
                <div className="text-3xl mb-4">{uc.icon}</div>
                <h3 className="font-bold text-[#F1F0F5] mb-2">{uc.title}</h3>
                <p className="text-[#A09CB0] text-sm leading-relaxed">{uc.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10 text-[#F1F0F5]">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {faqs.map(faq => (
            <details key={faq.q} className="bg-[#16161E] border border-white/8 rounded-xl group">
              <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-[#F1F0F5] font-semibold list-none">
                {faq.q}
                <span className="text-[#7C3AED] ml-4 flex-shrink-0 group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-6 pb-4 text-[#A09CB0] text-sm">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* DOUBLE CTA */}
      <section className="bg-[#111118] border-t border-white/5 py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4 text-[#F1F0F5]">¿Listo para implementar?</h2>
        <p className="text-[#A09CB0] mb-8 max-w-xl mx-auto">Prueba 14 días gratis o solicita una auditoría personalizada sin costo</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/precios" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-4 rounded-xl font-bold transition">
            Ver Planes y Precios →
          </Link>
          <Link href="/audit" className="border border-[#7C3AED]/40 text-[#C084FC] hover:bg-[#7C3AED]/10 px-8 py-4 rounded-xl font-semibold transition">
            Auditoría Gratis
          </Link>
        </div>
      </section>

    </div>
  )
}
