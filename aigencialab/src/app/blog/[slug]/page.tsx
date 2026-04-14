import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'


const POSTS: Record<string, {
  title: string; category: string; date: string; readTime: string;
  content: string[]; emoji: string;
}> = {
  'triplicar-ventas-con-ia': {
    emoji: '📈',
    title: 'Cómo un agente IA puede triplicar tus ventas online en 30 días',
    category: 'Ventas', date: 'Marzo 2026', readTime: '5 min',
    content: [
      'La pregunta ya no es si tu empresa necesita IA, sino cuándo vas a implementarla. Las empresas chilenas que adoptaron agentes IA conversacionales en 2025 reportaron en promedio un 3x en la conversión de visitantes a leads calificados.',
      '## El problema con el tráfico web actual',
      'El 97% de las personas que visitan tu sitio web salen sin dejar sus datos de contacto. El motivo principal: no encontraron respuesta rápida a su pregunta específica. Un agente IA resuelve esto en tiempo real, 24/7.',
      '## Estrategia 1: Interceptar en el momento de mayor intención',
      'Los visitantes que navegan más de 30 segundos en páginas de producto tienen alta intención de compra. Configura tu agente para activarse proactivamente en ese momento con un mensaje personalizado según la página.',
      '## Estrategia 2: Calificación automática de leads',
      'No todos los contactos tienen la misma prioridad. Entrena tu agente para hacer las 3 preguntas clave que determinan si el lead está listo para hablar con un vendedor. Solo transfiere los calificados.',
      '## Estrategia 3: Seguimiento automático post-conversación',
      'El 80% de las ventas requieren al menos 5 touchpoints. Un agente IA puede mantener el contacto de manera personalizada durante semanas, construyendo confianza hasta que el cliente esté listo.',
      '## Resultado esperado',
      'Empresas como MaxFPS.cl implementaron estas 3 estrategias y lograron 1.200 conversaciones automatizadas al mes con una tasa de conversión del 35%. El ROI fue positivo desde el primer mes.',
    ],
  },
  'chatbot-vs-agente-ia': {
    emoji: '🤖',
    title: 'ChatBot vs Agente IA: ¿Cuál necesita realmente tu empresa?',
    category: 'IA', date: 'Febrero 2026', readTime: '4 min',
    content: [
      'Esta es la confusión más común en el mercado tecnológico actual. Un chatbot y un agente IA son fundamentalmente diferentes, y elegir el correcto puede significar la diferencia entre una experiencia memorable y una frustrante.',
      '## ¿Qué es un chatbot tradicional?',
      'Un chatbot es un sistema de respuestas predefinidas. Funciona con árboles de decisión: si el usuario escribe "A", responde "X"; si escribe "B", responde "Y". Es rígido, requiere mantenimiento constante y falla ante preguntas inesperadas.',
      '## ¿Qué es un agente IA conversacional?',
      'Un agente IA usa modelos de lenguaje grandes (LLM) para comprender el contexto, la intención y el tono de cada mensaje. Puede manejar conversaciones complejas, adaptarse a cada usuario y aprender de las interacciones.',
      '## Cuándo usar cada uno',
      'Los chatbots son útiles para flujos 100% predecibles: confirmación de horarios, preguntas de FAQ simples, formularios conversacionales. Los agentes IA son la opción cuando necesitas conversaciones naturales, manejo de objeciones y calificación de leads.',
      '## La diferencia en números',
      'Empresas que migraron de chatbots a agentes IA reportan un 60% de aumento en satisfacción del cliente y un 40% más de leads calificados por conversación.',
    ],
  },
  'caso-maxfps-1200-consultas': {
    emoji: '🎮',
    title: 'Caso de uso: Cómo MaxFPS.cl automatizó 1.200 consultas al mes',
    category: 'Casos de Uso', date: 'Enero 2026', readTime: '6 min',
    content: [
      'MaxFPS.cl es una de las tiendas de hardware gaming más reconocidas en Chile. Con un catálogo de más de 2.000 productos y una comunidad activa, enfrentaban un desafío crítico: demasiadas consultas, demasiado pocos recursos humanos.',
      '## El problema',
      'El equipo recibía más de 1.200 mensajes al mes por WhatsApp, email e Instagram, 70% de los cuales eran preguntas repetitivas: ¿Tienen stock de la RTX 4090? ¿Cuánto tarda el envío a Concepción? ¿Me conviene más el i7 o el Ryzen 7 para gaming?',
      '## La solución implementada',
      'En 72 horas, AIgenciaLab instaló un agente conversacional entrenado con el catálogo completo de MaxFPS.cl, políticas de envío, garantías y las 50 preguntas más frecuentes documentadas por el equipo.',
      '## Resultados al primer mes',
      'El agente comenzó a responder automáticamente el 78% de las consultas. El 22% restante se escalaba al equipo humano con contexto completo de la conversación. Los tiempos de respuesta pasaron de horas a segundos.',
      '## Impacto en ventas',
      'El 35% de las conversaciones automatizadas culminó en una compra directa o una visita a la tienda. El agente también identificó patrones: los clientes que preguntaban por RTX tenían 3 veces más probabilidades de convertir si recibían respuesta en menos de 1 minuto.',
    ],
  },
  'implementar-ia-sin-codigo': {
    emoji: '⚙️',
    title: 'Guía completa: Implementar IA conversacional sin código',
    category: 'Tecnología', date: 'Diciembre 2025', readTime: '8 min',
    content: [
      'La barrera técnica para implementar IA en tu empresa es más baja de lo que crees. En esta guía, te mostramos cómo pasar de cero a tener un agente IA funcionando en menos de 30 minutos.',
      '## Paso 1: Define el objetivo principal',
      'Antes de configurar nada, responde: ¿Para qué quiero el agente? ¿Capturar leads? ¿Responder preguntas de soporte? ¿Calificar prospectos? Un objetivo claro te ahorrará horas de configuración.',
      '## Paso 2: Registra tu cuenta en AIgenciaLab',
      'El proceso de registro toma menos de 3 minutos. Solo necesitas tu email, nombre de empresa y elegir tu plan. El plan Starter es gratuito e incluye todo lo que necesitas para comenzar.',
      '## Paso 3: Configura tu agente',
      'En el dashboard, crea tu primer agente. Dale un nombre, un tono de voz y el contexto de tu empresa. El panel te guía paso a paso con preguntas simples.',
      '## Paso 4: Instala el widget en tu web',
      'Copia el snippet de código de 3 líneas que te genera la plataforma e insértalo antes del cierre del tag </body> en tu sitio. Compatible con cualquier plataforma: WordPress, Shopify, Wix, HTML puro.',
      '## Paso 5: Prueba y ajusta',
      'Usa la función de preview del dashboard para simular conversaciones. Ajusta las respuestas del agente basándote en las preguntas reales de tus clientes.',
    ],
  },
  'metricas-agente-ia': {
    emoji: '📊',
    title: '5 métricas que debes medir en tu agente IA para optimizar resultados',
    category: 'IA', date: 'Noviembre 2025', readTime: '5 min',
    content: [
      'Implementar un agente IA sin medir su performance es como manejar con los ojos cerrados. Estas son las 5 métricas esenciales que todo gerente debe monitorear.',
      '## 1. Tasa de resolución autónoma',
      'El porcentaje de conversaciones que el agente resuelve completamente sin intervención humana. Una tasa saludable está entre 65-85%. Menos del 50% indica que el agente necesita más entrenamiento.',
      '## 2. Tiempo promedio de conversación',
      'Conversaciones más cortas suelen indicar eficiencia. Pero cuidado: conversaciones muy cortas pueden significar que el agente no está construyendo la relación necesaria para convertir.',
      '## 3. Tasa de captura de leads',
      'Del total de conversaciones, ¿cuántas resultaron en un lead con datos de contacto? El benchmark del sector es 25-40%. Si estás por debajo del 15%, revisa cómo tu agente formula las preguntas.',
      '## 4. CSAT del agente',
      'Customer Satisfaction Score específico del agente. Se mide con una pregunta simple al final de la conversación: "¿Fue útil esta conversación? 🌟". Un score sobre 4.5/5 es excelente.',
      '## 5. Retención en conversación',
      'El porcentaje de usuarios que continúan la conversación después del segundo mensaje. Una retención sobre el 70% indica que el agente está generando engagement efectivo.',
    ],
  },
}

export async function generateStaticParams() {
  return Object.keys(POSTS).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = POSTS[params.slug]
  if (!post) return {}
  return { title: `${post.title} — Blog AIgenciaLab`, description: post.content[0]?.slice(0, 160) }
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug]
  if (!post) notFound()

  const CATEGORY_COLORS: Record<string, string> = {
    'Ventas': 'bg-green-500/10 text-green-400 border-green-500/20',
    'IA': 'bg-[#7C3AED]/10 text-[#C084FC] border-[#7C3AED]/20',
    'Casos de Uso': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    'Tecnología': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  }

  return (
    <MainLayout>
      <div className="bg-[#0A0A0F] min-h-screen text-[#F1F0F5]">
        <article className="max-w-3xl mx-auto px-6 pt-24 pb-20">

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${CATEGORY_COLORS[post.category] ?? ''}`}>
                {post.category}
              </span>
              <span className="text-[#6B6480] text-sm">{post.date}</span>
              <span className="text-[#6B6480] text-sm">· {post.readTime} de lectura</span>
            </div>
            <div className="text-5xl mb-4">{post.emoji}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#F1F0F5] mb-4">{post.title}</h1>
          </div>

          {/* Content */}
          <div className="prose prose-invert max-w-none space-y-6">
            {post.content.map((block, i) => {
              if (block.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-bold text-[#F1F0F5] mt-10 mb-4">{block.slice(3)}</h2>
              }
              return <p key={i} className="text-[#A09CB0] leading-relaxed">{block}</p>
            })}
          </div>

          {/* CTA */}
          <div className="mt-16 bg-[#16161E] border border-[#7C3AED]/30 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-3">¿Listo para implementar IA en tu empresa?</h3>
            <p className="text-[#A09CB0] mb-6">Auditoría gratuita. Resultados visibles desde el primer mes.</p>
            <Link href="/audit" className="inline-block bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-3 rounded-xl font-bold transition">
              Solicitar Auditoría Gratis →
            </Link>
          </div>

          <div className="mt-10">
            <Link href="/blog" className="text-[#7C3AED] hover:text-[#C084FC] transition">← Volver al blog</Link>
          </div>
        </article>
      </div>
    </MainLayout>
  )
}
