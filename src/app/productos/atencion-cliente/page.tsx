import { MainLayout } from '@/components/landing/MainLayout'
import { ProductPageTemplate } from '@/components/landing/ProductPageTemplate'
export const metadata = { title: 'Atención al Cliente 24/7 IA — AIgenciaLab', description: 'Resuelve el 80% de tickets sin intervención humana con IA conversacional.' }
export default function Page() {
  return (
    <MainLayout>
      <ProductPageTemplate
        badge="Producto · Soporte IA"
        emoji="💬"
        title="Atención al Cliente **Automatizada** 24/7"
        subtitle="Tu equipo de soporte nunca duerme. Resuelve el 80% de consultas sin intervención humana y escala los casos complejos con contexto completo."
        metrics={[
          { value: '80%', label: 'Tickets resueltos automáticamente' },
          { value: '60%', label: 'Reducción en costos de soporte' },
          { value: '4.8', label: 'CSAT promedio (sobre 5)' },
        ]}
        benefits={[
          'Resuelve consultas frecuentes en segundos, sin cola de espera',
          'Aprende de tu base de conocimiento y documentación',
          'Escala a humano con contexto completo de la conversación',
          'Compatible con WhatsApp, web widget y email',
          'FAQ dinámica que se actualiza automáticamente',
          'Métricas de satisfacción y tiempos de resolución en tiempo real',
          'Historial completo de interacciones por cliente',
          'Multiidioma: español, inglés y portugués',
        ]}
        steps={[
          { number: '01', title: 'Carga tu base de conocimiento', body: 'Sube tus FAQs, manuales, políticas y preguntas frecuentes. El agente aprende en minutos.' },
          { number: '02', title: 'El agente aprende tu negocio', body: 'Usando IA, el agente puede responder variaciones de preguntas con lenguaje natural, sin scripts rígidos.' },
          { number: '03', title: 'Resuelve el 80% de tickets', body: 'Sin intervención humana. Los casos complejos se escalan con todo el historial al agente correcto.' },
        ]}
        useCases={[
          { icon: '🛒', title: 'Tienda Online', body: 'Estado de pedido, política de devoluciones, compatibilidad de productos — resuelto instantáneamente.' },
          { icon: '💻', title: 'SaaS / Tech', body: 'Soporte técnico básico, reseteo de contraseñas, estado de servicios y onboarding de usuarios nuevos.' },
          { icon: '🏥', title: 'Salud y Clínicas', body: 'Preguntas de pacientes sobre preparación de exámenes, cobertura, horarios y reagendamiento.' },
        ]}
        faqs={[
          { q: '¿Qué pasa con preguntas que el agente no sabe responder?', a: 'El agente detecta cuando no tiene respuesta y escala al equipo humano con el contexto completo, sin que el cliente lo note.' },
          { q: '¿Puede escalar a un humano en tiempo real?', a: 'Sí. Con un click puede transferir la conversación a un operador humano con todo el historial visible.' },
          { q: '¿Cuántos idiomas soporta?', a: 'Actualmente español, inglés y portugués con planes de expandir a más idiomas en la hoja de ruta 2026.' },
          { q: '¿Con qué frecuencia se actualiza la base de conocimiento?', a: 'Puedes actualizar tu base de conocimiento cuando quieras desde el panel. Los cambios se aplican en tiempo real.' },
          { q: '¿Se integra con mi sistema de tickets actual?', a: 'Compatible con Zendesk, Freshdesk, Intercom y cualquier plataforma con API REST.' },
        ]}
      />
    </MainLayout>
  )
}