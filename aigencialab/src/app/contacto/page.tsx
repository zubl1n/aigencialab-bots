import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto — AIgenciaLab',
  description: 'Contáctanos para saber cómo AIgenciaLab puede transformar tu empresa con IA conversacional.',
}

export default function ContactoPage() {
  return (
    <MainLayout>
      <div className="bg-[#0A0A0F] min-h-screen text-[#F1F0F5]">

        {/* HERO */}
        <section className="pt-24 pb-16 px-6 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hablemos de{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C084FC] to-[#7C3AED]">
              tu próximo proyecto
            </span>
          </h1>
          <p className="text-[#A09CB0] text-lg max-w-xl mx-auto">
            Nuestro equipo responde en menos de 24 horas. Para proyectos urgentes, escríbenos directamente por WhatsApp.
          </p>
        </section>

        {/* CONTACT GRID */}
        <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-12 items-start">

          {/* FORM */}
          <div className="bg-[#16161E] border border-white/8 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6">Envíanos un mensaje</h2>
            <form className="space-y-4" onSubmit={e => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Tu nombre *" required
                  className="col-span-2 sm:col-span-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/40 transition" />
                <input placeholder="Empresa" 
                  className="col-span-2 sm:col-span-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/40 transition" />
              </div>
              <input type="email" placeholder="Email *" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/40 transition" />
              <input placeholder="Teléfono / WhatsApp"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/40 transition" />
              <select className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/40 transition">
                <option value="">¿Qué te interesa?</option>
                <option>Agente de Ventas</option>
                <option>Atención al Cliente</option>
                <option>WhatsApp Business</option>
                <option>Plan Enterprise</option>
                <option>Agencia / Resale</option>
                <option>Otro</option>
              </select>
              <textarea rows={4} placeholder="¿Cómo podemos ayudarte?" required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/40 transition resize-none" />
              <button type="submit"
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-3.5 rounded-xl font-bold transition hover:shadow-[0_8px_30px_rgba(124,58,237,0.4)]">
                Enviar mensaje →
              </button>
              <p className="text-center text-xs text-[#6B6480]">Respondemos en menos de 24 horas hábiles</p>
            </form>
          </div>

          {/* INFO */}
          <div className="space-y-6">
            <div className="bg-[#16161E] border border-white/8 rounded-2xl p-6">
              <h3 className="font-bold text-[#F1F0F5] mb-4">Contacto directo</h3>
              <div className="space-y-3 text-sm text-[#A09CB0]">
                <p>📧 <a href="mailto:hola@aigencialab.cl" className="text-[#C084FC] hover:underline">hola@aigencialab.cl</a></p>
                <p>📱 <a href="https://wa.me/56912345678" className="text-[#C084FC] hover:underline">+569 1234 5678 (WhatsApp)</a></p>
                <p>🕐 Lunes a viernes, 9:00 – 18:00 (CLT)</p>
              </div>
            </div>

            <div className="bg-[#16161E] border border-white/8 rounded-2xl p-6">
              <h3 className="font-bold text-[#F1F0F5] mb-4">¿Prefieres una auditoría gratuita?</h3>
              <p className="text-[#A09CB0] text-sm mb-4">
                Completa nuestro formulario de auditoría y recibe un análisis personalizado de cuánto puede mejorar tu empresa con IA — en menos de 24 horas.
              </p>
              <Link href="/audit" className="block text-center bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#C084FC] py-3 rounded-xl font-semibold hover:bg-[#7C3AED]/20 transition">
                Solicitar Auditoría Gratis →
              </Link>
            </div>

            <div className="bg-[#16161E] border border-white/8 rounded-2xl p-6">
              <h3 className="font-bold text-[#F1F0F5] mb-4">Oficina</h3>
              <p className="text-[#A09CB0] text-sm">
                AIgenciaLab SpA<br />
                Santiago, Chile<br />
                🇨🇱 Atención en América Latina
              </p>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}