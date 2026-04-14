import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — AIgenciaLab: IA, Ventas y Automatización para Empresas',
  description: 'Artículos sobre agentes IA, automatización de ventas y casos de uso reales para empresas chilenas.',
}

const POSTS = [
  {
    slug: 'triplicar-ventas-con-ia',
    title: 'Cómo un agente IA puede triplicar tus ventas online en 30 días',
    excerpt: 'Descubre las estrategias exactas que usan las empresas chilenas más avanzadas para convertir visitantes en clientes con IA conversacional.',
    category: 'Ventas',
    readTime: '5 min',
    date: 'Marzo 2026',
    emoji: '📈',
  },
  {
    slug: 'chatbot-vs-agente-ia',
    title: 'ChatBot vs Agente IA: ¿Cuál necesita realmente tu empresa?',
    excerpt: 'No son lo mismo. Te explicamos las diferencias clave entre un chatbot básico y un verdadero agente IA, y cuál se adapta mejor a tu modelo de negocio.',
    category: 'IA',
    readTime: '4 min',
    date: 'Febrero 2026',
    emoji: '🤖',
  },
  {
    slug: 'caso-maxfps-1200-consultas',
    title: 'Caso de uso: Cómo MaxFPS.cl automatizó 1.200 consultas al mes',
    excerpt: 'La tienda gamer chilena eliminó el 70% de consultas repetitivas con un agente IA. Te mostramos cómo lo hicieron y qué resultados obtuvieron.',
    category: 'Casos de Uso',
    readTime: '6 min',
    date: 'Enero 2026',
    emoji: '🎮',
  },
  {
    slug: 'implementar-ia-sin-codigo',
    title: 'Guía completa: Implementar IA conversacional sin código',
    excerpt: 'Paso a paso: cómo instalar y configurar tu agente IA en menos de 30 minutos, sin necesidad de conocimientos técnicos.',
    category: 'Tecnología',
    readTime: '8 min',
    date: 'Diciembre 2025',
    emoji: '⚙️',
  },
  {
    slug: 'metricas-agente-ia',
    title: '5 métricas que debes medir en tu agente IA para optimizar resultados',
    excerpt: 'Tasa de resolución, tiempo de conversación, leads capturados, CSAT y retención. Te explicamos cómo medir y mejorar cada una.',
    category: 'IA',
    readTime: '5 min',
    date: 'Noviembre 2025',
    emoji: '📊',
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Ventas': 'bg-green-500/10 text-green-400 border-green-500/20',
  'IA': 'bg-[#7C3AED]/10 text-[#C084FC] border-[#7C3AED]/20',
  'Casos de Uso': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Tecnología': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

export default function BlogPage() {
  return (
    <MainLayout>
      <div className="bg-[#0A0A0F] min-h-screen text-[#F1F0F5]">

        {/* HERO */}
        <section className="pt-24 pb-16 px-6 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#C084FC] to-[#7C3AED]">
              AIgenciaLab
            </span>
          </h1>
          <p className="text-[#A09CB0] text-lg max-w-2xl mx-auto">
            Guías, casos de uso y estrategias de IA aplicadas al contexto empresarial chileno.
          </p>
        </section>

        {/* POSTS */}
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="space-y-8">
            {POSTS.map((post, i) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
                <article className="bg-[#16161E] border border-white/8 rounded-2xl p-8 hover:border-[#7C3AED]/40 transition-all flex gap-6 items-start">
                  <div className="text-4xl hidden sm:block flex-shrink-0">{post.emoji}</div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${CATEGORY_COLORS[post.category] ?? 'bg-white/5 text-[#6B6480] border-white/10'}`}>
                        {post.category}
                      </span>
                      <span className="text-[#6B6480] text-xs">{post.date}</span>
                      <span className="text-[#6B6480] text-xs">· {post.readTime} lectura</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#F1F0F5] mb-2 group-hover:text-[#C084FC] transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-[#A09CB0] text-sm leading-relaxed">{post.excerpt}</p>
                    <div className="mt-4 text-[#7C3AED] text-sm font-semibold group-hover:text-[#C084FC] transition-colors">
                      Leer artículo →
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#111118] border-t border-white/5 py-16 px-6 text-center">
          <h2 className="text-2xl font-bold mb-4">¿Listo para implementar IA en tu empresa?</h2>
          <p className="text-[#A09CB0] mb-6">Auditoría gratuita sin compromiso. Resultados visibles desde el primer mes.</p>
          <Link href="/audit" className="inline-block bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-4 rounded-xl font-bold transition">
            Solicitar Auditoría Gratis →
          </Link>
        </section>
      </div>
    </MainLayout>
  )
}
