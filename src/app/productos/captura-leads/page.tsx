import { MainLayout } from '@/components/landing/MainLayout'
import { ProductPageTemplate } from '@/components/landing/ProductPageTemplate'
export const metadata = { title: 'Captura de Leads Automática IA — AIgenciaLab', description: 'Convierte visitantes en leads calificados con IA conversacional.' }
export default function Page() {
  return (
    <MainLayout>
      <ProductPageTemplate
        badge="Producto · Lead Generation"
        emoji="🎯"
        title="**Captura Leads** de forma automática las 24hs"
        subtitle="El 97% de los visitantes de tu sitio se van sin dejar sus datos. Tu agente IA los intercepta, inicia conversación y captura sus datos en el momento de mayor intención."
        metrics={[
          { value: '97%', label: 'Visitantes que se van sin datos' },
          { value: '25-40%', label: 'Tasa de captura con IA' },
          { value: '3x', label: 'Más leads por el mismo tráfico' },
        ]}
        benefits={[
          'Activa la conversación proactivamente después de X segundos en página',
          'Hace las 3 preguntas clave para cualificar el lead automáticamente',
          'Guarda nombre, email, teléfono y contexto en tu CRM',
          'Envía notificación inmediata a tu equipo cuando llega un lead calificado',
          'Segmenta leads por industria, tamaño de empresa e intención de compra',
          'Activa secuencias de follow-up automático por email o WhatsApp',
          'A/B testing de mensajes de entrada para maximizar conversión',
          'Reportes diarios de leads capturados y tasa de conversión',
        ]}
        steps={[
          { number: '01', title: 'Defines cuándo activarse', body: 'Configuras triggers: tiempo en página, scroll, intento de salida, o páginas específicas de alto valor.' },
          { number: '02', title: 'El agente inicia conversación', body: 'De forma natural y personalizada según la página donde está el visitante. Sin formularios tradicionales.' },
          { number: '03', title: 'El lead entra a tu pipeline', body: 'Con nombre, datos de contacto y contexto de intención de compra. Listo para ser contactado por tu equipo.' },
        ]}
        useCases={[
          { icon: '📊', title: 'SaaS B2B', body: 'Captura demo requests cualificados. El agente pregunta por empresa, cargo, problema específico y presupuesto antes de agendar.' },
          { icon: '🏠', title: 'Inmobiliaria', body: 'Detecta visitantes en páginas de propiedades con alta intención. Captura datos y toman agenda de visita automáticamente.' },
          { icon: '📚', title: 'Educación Online', body: 'Convierte visitantes de landing pages en matrículas. El agente resuelve dudas académicas y guía el proceso de inscripción.' },
        ]}
        faqs={[
          { q: '¿Cómo sabe el agente cuándo activar la conversación?', a: 'Configuras los triggers desde el panel: tiempo mínimo en página, porcentaje de scroll, intentos de salida, o páginas específicas.' },
          { q: '¿Se pueden sincronizar los leads con mi CRM?', a: 'Sí. Integración nativa con HubSpot, Salesforce, Pipedrive, Zoho y cualquier CRM con webhook o API.' },
          { q: '¿Qué pasa si el visitante no quiere dar sus datos?', a: 'El agente continúa la conversación ofreciendo valor (respuestas, demos, recursos) sin presionar por datos de contacto.' },
          { q: '¿Puedo ver los leads capturados en tiempo real?', a: 'Sí. El panel de leads de AIgenciaLab muestra cada lead con su historial de conversación, datos y score de calificación.' },
          { q: '¿El agente puede hacer seguimiento después de la primera conversación?', a: 'Sí. Puedes configurar secuencias automáticas de seguimiento por WhatsApp o email para leads que no convirtieron.' },
        ]}
      />
    </MainLayout>
  )
}