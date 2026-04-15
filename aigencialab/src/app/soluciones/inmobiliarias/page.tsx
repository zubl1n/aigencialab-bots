import { MainLayout } from '@/components/landing/MainLayout'
import { ProductPageTemplate } from '@/components/landing/ProductPageTemplate'
export const metadata = { title: 'IA para Inmobiliarias — AIgenciaLab', description: 'Califica compradores y agenda visitas automáticamente con IA.' }
export default function Page() {
  return (
    <MainLayout>
      <ProductPageTemplate
        badge="Solución · Inmobiliaria"
        emoji="🏢"
        title="IA Inmobiliaria: Leads calificados, **Visitas agendadas**"
        subtitle="Tu equipo pierde tiempo con leads que nunca van a comprar. Un agente IA califica automáticamente por presupuesto, tipo de propiedad y urgencia — antes de que tus corredores intervengan."
        metrics={[
          { value: '3x',   label: 'Más leads calificados/semana' },
          { value: '90%',  label: 'Consultas resueltas automáticas' },
          { value: '40%',  label: 'Reducción en tiempo de cierre' },
        ]}
        benefits={[
          'Cualificación por presupuesto, zona, tipo de propiedad y timeline de compra',
          'Agendamiento de visitas directamente desde la conversación',
          'Responde preguntas sobre superficie, orientación, vecindario y precios',
          'Integración con tu CRM inmobiliario (Properati, Inmofans, o propio)',
          'Envía ficha de propiedad y fotos por WhatsApp automáticamente',
          'Recordatorio automático 24h antes de cada visita agendada',
          'Panel de leads filtrable por presupuesto, zona y etapa del funnel',
          'Seguimiento post-visita automatizado con encuesta de satisfacción',
        ]}
        steps={[
          { number: '01', title: 'Subes tu inventario de propiedades', body: 'Conectas tu CRM inmobiliario o subes un CSV con las propiedades disponibles. El agente aprende el catálogo completo.' },
          { number: '02', title: 'El agente cualifica en tiempo real', body: 'Pregunta por presupuesto, zona preferida, tipo (casa/depto/comercial), urgencia y financiamiento. Solo pasa los serios.' },
          { number: '03', title: 'La visita queda agendada', body: 'El agente coordina con el calendario del corredor disponible y confirma la cita por WhatsApp automáticamente.' },
        ]}
        useCases={[
          { icon: '🏡', title: 'Corredoras de Propiedades', body: 'Atiende todos los portales (Portal Inmobiliario, Mercado Libre) desde un solo agente sin contratar más personal.' },
          { icon: '🏗️', title: 'Constructoras y Proyectos', body: 'Califica compradores de departamentos en verde. Muestra amenities, etapas y condiciones de promesa automáticamente.' },
          { icon: '🏢', title: 'Arriendos Comerciales', body: 'Filtra por m², uso de suelo, zona y precio. Solo negocia con empresas que cumplen los requisitos desde el inicio.' },
        ]}
        faqs={[
          { q: '¿Con qué CRMs inmobiliarios se integra?', a: 'Nativo con Properati y Icasas. Para otros CRMs usamos webhooks o integración manual vía CSV/Google Sheets.' },
          { q: '¿Puede el agente mostrar fotos de propiedades?', a: 'Sí por WhatsApp. Por web muestra links y fichas. Si tienes CMS propio, también puede embeber galerías.' },
          { q: '¿Cómo maneja objeciones de precio?', a: 'El agente está entrenado para manejar objeciones comunes: "está caro", "lo voy a pensar", "vi algo más barato" con argumentación personalizada.' },
          { q: '¿Funciona en portales externos como Portal Inmobiliario?', a: 'El agente opera en tu sitio web y WhatsApp. Para portales externos, capturamos los leads entrantes via formulario.' },
          { q: '¿Cuántos corredores pueden usar el sistema simultáneamente?', a: 'Ilimitados. El sistema gestiona la asignación de leads automáticamente según disponibilidad y zona de cada corredor.' },
        ]}
      />
    </MainLayout>
  )
}