import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'

const CASES = [
  {
    company: 'MaxFPS.cl',
    industry: 'E-commerce Gaming',
    tag: 'gaming',
    emoji: '🎮',
    result: 'Reducción del 70% en consultas repetitivas sobre stock y specs',
    quote: '"El agente IA responde las mismas 50 preguntas que nos hacían a diario. Ahora nuestro equipo solo atiende lo que realmente importa."',
    author: 'Rodrigo M. — MaxFPS.cl',
    metrics: [
      { n: '1.200', label: 'conversaciones/mes' },
      { n: '35%', label: 'leads convertidos por chat' },
      { n: '<2s', label: 'tiempo de respuesta 24/7' },
    ],
  },
  {
    company: 'GameHost.cl',
    industry: 'Hosting de Servidores',
    tag: 'hosting',
    emoji: '🖥️',
    result: 'Soporte técnico automatizado en horarios nocturnos',
    quote: '"Antes perdíamos clientes a las 3am cuando nadie estaba disponible. Ahora el bot resuelve el 80% de los tickets de soporte."',
    author: 'Felipe A. — GameHost.cl',
    metrics: [
      { n: '400+', label: 'tickets automatizados/mes' },
      { n: '80%', label: 'reducción en tiempo de resolución' },
      { n: '8.7', label: 'NPS (antes: 6.2)' },
    ],
  },
  {
    company: 'GremlinSeries.com',
    industry: 'Streaming / Contenido',
    tag: 'entretenimiento',
    emoji: '🎬',
    result: 'Onboarding automatizado de nuevos suscriptores',
    quote: '"El agente guía a los usuarios nuevos, responde dudas de la plataforma y convierte visitantes curiosos en suscriptores pagos."',
    author: 'Javiera L. — GremlinSeries.com',
    metrics: [
      { n: '60%', label: 'reducción en consultas manuales' },
      { n: '22%', label: 'aumento conversión trial → pago' },
      { n: '900+', label: 'interacciones/mes' },
    ],
  },
  {
    company: 'MobimoChile.cl',
    industry: 'Inmobiliaria / Proptech',
    tag: 'inmobiliaria',
    emoji: '🏢',
    result: 'Calificación automática de leads inmobiliarios 24/7',
    quote: '"Los corredores solo hablan con personas que ya tienen intención real de compra. El bot hace el trabajo de filtro que antes tomaba horas."',
    author: 'Carolina V. — MobimoChile.cl',
    metrics: [
      { n: '3x', label: 'más leads calificados/semana' },
      { n: '90%', label: 'consultas resueltas automáticamente' },
      { n: '1 mes', label: 'ROI positivo inicial' },
    ],
  },
  {
    company: 'Clínica Dental Sonrisa',
    industry: 'Salud / Odontología',
    tag: 'salud',
    emoji: '🦷',
    result: 'Agendamiento de horas automatizado sin intervención',
    quote: '"500 horas agendadas al mes sin que nuestra recepcionista toque el teléfono. El bot incluso maneja confirmaciones y recordatorios."',
    author: 'Dra. Mónica R. — Clínica Dental Sonrisa',
    metrics: [
      { n: '500', label: 'horas agendadas/mes automáticamente' },
      { n: '0%', label: 'horas de recepción para agendamiento' },
      { n: '4.9/5', label: 'satisfacción de pacientes' },
    ],
  },
  {
    company: 'AutoCenter Las Américas',
    industry: 'Automotriz',
    tag: 'otro',
    emoji: '🚗',
    result: '40% de aumento en leads de pruebas de manejo',
    quote: '"Los clientes pueden consultar stock, comparar modelos y agendar test drive a cualquier hora. Nuestras ventas mejoraron desde el primer mes."',
    author: 'Gerardo P. — AutoCenter Las Américas',
    metrics: [
      { n: '40%', label: 'más leads de test drives' },
      { n: '250+', label: 'consultas de stock automatizadas/mes' },
      { n: '15%', label: 'aumento en cotizaciones recibidas' },
    ],
  },
  {
    company: 'Telas&Co',
    industry: 'E-commerce / Retail',
    tag: 'ecommerce',
    emoji: '🧵',
    result: 'Atención postventa y seguimiento de pedidos automatizado',
    quote: '"Antes tardábamos 2-3 horas en responder consultas de envíos. Ahora el bot responde al instante con información en tiempo real."',
    author: 'Pamela C. — Telas&Co',
    metrics: [
      { n: '4.8/5', label: 'CSAT en atención automatizada' },
      { n: '300+', label: 'seguimientos de pedido/mes' },
      { n: '85%', label: 'reducción en tiempos de respuesta' },
    ],
  },
]

const TAG_LABELS: Record<string, string> = {
  'gaming': 'Gaming', 'hosting': 'Hosting', 'entretenimiento': 'Entretenimiento',
  'inmobiliaria': 'Inmobiliaria', 'salud': 'Salud', 'ecommerce': 'E-commerce', 'otro': 'Otro'
}

export default function CasosExitoPage() {
  return (
    <MainLayout>
      <div className="bg-[#0A0A0F] min-h-screen text-[#F1F0F5]">

        {/* HERO */}
        <section className="pt-24 pb-16 px-6 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/10 border border-[#7C3AED]/30 text-[#C084FC] text-sm px-4 py-2 rounded-full mb-6">
            ✨ Casos reales de empresas chilenas
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Empresas que ya confían en{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C084FC] to-[#7C3AED]">
              sus agentes IA
            </span>
          </h1>
          <p className="text-[#A09CB0] text-lg max-w-2xl mx-auto">
            Resultados reales de negocios chilenos que automatizaron su atención y multiplicaron sus leads con AIgenciaLab.
          </p>
        </section>

        {/* CASES GRID */}
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {CASES.map(c => (
              <div key={c.company} className="bg-[#16161E] border border-white/8 rounded-2xl p-7 flex flex-col hover:border-[#7C3AED]/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-3xl mb-2 block">{c.emoji}</span>
                    <h3 className="font-bold text-lg text-[#F1F0F5]">{c.company}</h3>
                    <span className="text-[#6B6480] text-sm">{c.industry}</span>
                  </div>
                  <span className="bg-[#7C3AED]/10 text-[#C084FC] text-xs px-2.5 py-1 rounded-full border border-[#7C3AED]/30">
                    {TAG_LABELS[c.tag] ?? c.tag}
                  </span>
                </div>

                <p className="text-[#A09CB0] text-sm mb-4 flex-1">{c.result}</p>

                <blockquote className="border-l-2 border-[#7C3AED] pl-4 mb-5">
                  <p className="text-[#F1F0F5] text-sm italic">{c.quote}</p>
                  <footer className="text-[#6B6480] text-xs mt-2">{c.author}</footer>
                </blockquote>

                <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                  {c.metrics.map(m => (
                    <div key={m.label} className="text-center">
                      <div className="text-[#C084FC] font-bold text-lg">{m.n}</div>
                      <div className="text-[#6B6480] text-xs leading-tight">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#111118] border-t border-white/5 py-20 px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-[#F1F0F5]">¿Quieres ser el próximo caso de éxito?</h2>
          <p className="text-[#A09CB0] mb-8 max-w-xl mx-auto">
            Agenda una auditoría gratuita y nuestro equipo te mostrará exactamente cómo la IA puede transformar tu empresa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/audit" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-4 rounded-xl font-bold transition">
              Solicitar Auditoría Gratis →
            </Link>
            <Link href="/precios" className="border border-[#7C3AED]/40 text-[#C084FC] hover:bg-[#7C3AED]/10 px-8 py-4 rounded-xl font-semibold transition">
              Ver planes y precios
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}