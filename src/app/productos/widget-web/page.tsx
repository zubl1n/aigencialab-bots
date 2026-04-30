import { MainLayout } from '@/components/landing/MainLayout'
import { ProductPageTemplate } from '@/components/landing/ProductPageTemplate'
export const metadata = { title: 'Widget IA para Web — AIgenciaLab', description: 'Instala tu agente IA en tu sitio web en 2 minutos.' }
export default function Page() {
  return (
    <MainLayout>
      <ProductPageTemplate
        badge="Producto · Widget Web"
        emoji="⚡"
        title="Widget IA para tu sitio web en **2 minutos**"
        subtitle="Sin código. Sin complicaciones. Copia 2 líneas de código y tu agente IA aparece en tu sitio respondiendo consultas al instante. Compatible con cualquier plataforma."
        metrics={[
          { value: '2min', label: 'Tiempo de instalación' },
          { value: '100%', label: 'Compatible con cualquier CMS' },
          { value: '99.9%',label: 'Uptime garantizado' },
        ]}
        benefits={[
          'Instalación con un snippet de 2 líneas (copy & paste)',
          'Compatible con WordPress, Shopify, Wix, Squarespace, HTML puro',
          'Aparece en mobile y desktop con diseño responsive automático',
          'Personaliza colores, posición, avatar y mensaje de bienvenida',
          'Carga asíncrona — no afecta la velocidad de tu sitio (PageSpeed)',
          'Modo oscuro y claro según sistema operativo del visitante',
          'Múltiples idiomas con detección automática del navegador',
          'Analytics integrado: sesiones, conversiones, leads capturados',
        ]}
        steps={[
          { number: '01', title: 'Crea tu agente en el panel', body: 'Define nombre, tono, instrucciones y conecta tu base de conocimiento. Solo toma minutos.' },
          { number: '02', title: 'Copia el snippet', body: 'Te entregamos 2 líneas de JavaScript. Pegalas antes del cierre de </body> en tu sitio.' },
          { number: '03', title: 'Tu agente está activo', body: 'En segundos el widget aparece en tu web y comienza a atender visitantes automáticamente.' },
        ]}
        useCases={[
          { icon: '🛍️', title: 'Tienda Online', body: 'Aparece en páginas de producto con preguntas específicas. Aumenta el tiempo en sitio y la tasa de conversión.' },
          { icon: '💼', title: 'Sitio Corporativo B2B', body: 'Califica prospectos que visitan la web corporativa y agenda demos con el equipo comercial automáticamente.' },
          { icon: '🎓', title: 'Landing Pages de Cursos', body: 'Resuelve dudas sobre el contenido, el precio y la metodología. Convierte tráfico pagado en matrículas.' },
        ]}
        faqs={[
          { q: '¿Afecta el widget la velocidad de mi sitio?', a: 'No. El widget carga de forma asíncrona y diferida. El impacto en PageSpeed Insights es menor a 1 punto.' },
          { q: '¿Puedo personalizar los colores del widget?', a: 'Sí. Paleta completa de colores, logo, avatar del agente, posición (esquina derecha/izquierda) y mensaje de bienvenida.' },
          { q: '¿Funciona en dispositivos móviles?', a: 'Sí. El widget tiene diseño responsive y está optimizado para la experiencia en móvil (80% del tráfico web hoy).' },
          { q: '¿Puedo instalarlo en múltiples sitios?', a: 'Cada plan incluye un snippet por dominio. Para múltiples dominios puedes crear agentes separados o contactar a nuestro equipo.' },
          { q: '¿Se puede ocultar en páginas específicas?', a: 'Sí. Puedes configurar reglas de visibilidad por URL exact match, prefijo o patrón regex desde el panel.' },
        ]}
      />
    </MainLayout>
  )
}