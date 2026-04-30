'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'

const INDUSTRIES = ['E-commerce', 'Inmobiliaria', 'Salud y Clínicas', 'Educación', 'Gaming / Entretenimiento', 'Hosting / Tecnología', 'Automotriz', 'Finanzas', 'Otro']
const EMPLOYEES  = ['1-5', '6-20', '21-50', '51-200', '+200']
const QUERIES    = ['Menos de 100/mes', '100-500/mes', '500-2.000/mes', 'Más de 2.000/mes']

export default function AuditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    nombre: '', empresa: '', email: '', telefono: '',
    sitioWeb: '', industria: '', empleados: '', desafio: '', consultasMensuales: '',
  })

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/audit/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    router.push('/audit/gracias')
  }

  const stats = [
    { n: '1.200+', label: 'Empresas auditadas' },
    { n: '87%', label: 'Implementan en menos de 7 días' },
    { n: '3x', label: 'Más leads en promedio' },
  ]

  return (
    <MainLayout>
      <div className="bg-[#0A0A0F] min-h-screen text-[#F1F0F5]">

        {/* HERO */}
        <section className="pt-24 pb-16 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#C084FC] text-sm px-4 py-2 rounded-full mb-6">
            🎁 Completamente gratuita · Sin compromiso
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Descubre cuánto dinero estás<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F1F0F5] via-[#C084FC] to-[#7C3AED]">
              dejando ir por no tener IA
            </span>
          </h1>
          <p className="text-[#A09CB0] text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Completa el formulario y recibe un análisis personalizado de tu negocio en menos de <strong className="text-[#C084FC]">24 horas</strong>. Gratis, sin compromiso.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {stats.map(s => (
              <div key={s.n} className="text-center">
                <div className="text-3xl font-bold text-[#C084FC]">{s.n}</div>
                <div className="text-sm text-[#6B6480] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FORM + BENEFITS */}
        <section className="max-w-6xl mx-auto px-6 pb-20 grid md:grid-cols-2 gap-12 items-start">

          {/* FORM */}
          <div className="bg-[#16161E] border border-white/8 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Solicitar mi auditoría gratis</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Tu nombre *" value={form.nombre} onChange={e => set('nombre', e.target.value)}
                  className="col-span-2 sm:col-span-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] transition" />
                <input required placeholder="Empresa *" value={form.empresa} onChange={e => set('empresa', e.target.value)}
                  className="col-span-2 sm:col-span-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] transition" />
              </div>
              <input required type="email" placeholder="Email empresarial *" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] transition" />
              <input placeholder="WhatsApp / Teléfono" value={form.telefono} onChange={e => set('telefono', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] transition" />
              <input placeholder="URL de tu sitio web" value={form.sitioWeb} onChange={e => set('sitioWeb', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] transition" />
              <div className="grid grid-cols-2 gap-4">
                <select required value={form.industria} onChange={e => set('industria', e.target.value)}
                  className="col-span-2 sm:col-span-1 bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] focus:outline-none focus:border-[#7C3AED] transition">
                  <option value="">Industria *</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
                <select required value={form.empleados} onChange={e => set('empleados', e.target.value)}
                  className="col-span-2 sm:col-span-1 bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] focus:outline-none focus:border-[#7C3AED] transition">
                  <option value="">N° empleados *</option>
                  {EMPLOYEES.map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <select required value={form.consultasMensuales} onChange={e => set('consultasMensuales', e.target.value)}
                className="w-full bg-[#0A0A0F] border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] focus:outline-none focus:border-[#7C3AED] transition">
                <option value="">¿Cuántas consultas recibes al mes? *</option>
                {QUERIES.map(q => <option key={q}>{q}</option>)}
              </select>
              <textarea rows={4} required placeholder="¿Cuál es tu mayor desafío de ventas o atención al cliente? *"
                value={form.desafio} onChange={e => set('desafio', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[#F1F0F5] placeholder-[#6B6480] focus:outline-none focus:border-[#7C3AED] transition resize-none" />
              <button type="submit" disabled={loading}
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white py-4 rounded-xl font-bold text-lg transition disabled:opacity-50">
                {loading ? 'Enviando...' : 'Quiero mi auditoría gratis →'}
              </button>
              <p className="text-center text-xs text-[#6B6480]">Sin costo · Sin compromiso · Respuesta en 24 horas</p>
            </form>
          </div>

          {/* BENEFITS */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-[#F1F0F5]">¿Qué incluye la auditoría?</h2>
              <ul className="space-y-4">
                {[
                  'Análisis de tu sitio web y puntos de contacto actuales',
                  'Identificación de conversaciones automatizables',
                  'Estimación de leads perdidos por mes',
                  'Recomendación de agentes IA para tu industria',
                  'Propuesta de implementación en 7 días',
                  'ROI proyectado a 90 días',
                ].map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="text-green-400 font-bold text-lg mt-0.5">✓</span>
                    <span className="text-[#A09CB0]">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Testimonials */}
            <div className="space-y-4">
              {[
                { q: '"Recibimos 23 leads calificados el primer mes gracias a la auditoría"', a: '— Rodrigo M., MaxFPS.cl' },
                { q: '"En 24 horas tuvimos un plan de acción claro. Implementamos en una semana."', a: '— Carolina V., MobimoChile.cl' },
              ].map(t => (
                <div key={t.a} className="bg-[#16161E] border border-white/8 rounded-xl p-5">
                  <p className="text-[#F1F0F5] italic mb-2">{t.q}</p>
                  <p className="text-[#6B6480] text-sm">{t.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}
