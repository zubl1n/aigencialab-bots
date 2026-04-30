import { MainLayout } from '@/components/landing/MainLayout'
import { ProductPageTemplate } from '@/components/landing/ProductPageTemplate'

export const metadata = {
  title: 'Agente de Ventas IA — AIgenciaLab',
  description: 'Aumenta tus conversiones con un agente IA experto en ventas que cualifica leads y responde consultas 24/7.',
}

export default function Page() {
  return (
    <MainLayout>
      <ProductPageTemplate
        badge="Producto · Ventas IA"
        emoji="🤝"
        title="Agente de Ventas **IA** que trabaja 24/7"
        subtitle="Cualifica prospectos en tiempo real, responde objeciones y transfiere solo los leads listos para comprar. Como tu mejor vendedor — pero sin horario."
        metrics={[
          { value: '3x',   label: 'Más leads calificados' },
          { value: '40%',  label: 'Aumento en conversiones' },
          { value: '<2s',  label: 'Tiempo de respuesta' },
        ]}
        benefits={[
          'Cualifica leads con las 3 preguntas clave de tu proceso de ventas',
          'Responde objeciones de precio y comparativas automáticamente',
          'Integración nativa con WhatsApp Business, CRM y email',
          'Detecta intención de compra y activa proactivamente la conversación',
          'Transfiere leads calificados con historial completo a tu equipo',
          'Agenda reuniones directamente en tu calendario',
          'Dashboard con métricas de conversión en tiempo real',
          'Personalización total del tono y guión de ventas',
        ]}
        steps={[
          { number: '01', title: 'Defines el perfil de cliente ideal', body: 'Configuras las preguntas de cualificación, el tono y los productos o servicios que ofrece el agente.' },
          { number: '02', title: 'El agente cualifica en tiempo real', body: 'Cada visitante recibe atención inmediata. El agente identifica intención de compra y hace las preguntas correctas.' },
          { number: '03', title: 'El lead llega a tu CRM', body: 'Solo los prospectos calificados llegan a tu equipo, con el contexto completo de la conversación.' },
        ]}
        useCases={[
          { icon: '🛒', title: 'E-commerce', body: 'Recomienda productos según el perfil del visitante, responde dudas de stock y precio, y cierra ventas antes de que abandonen el carrito.' },
          { icon: '🏢', title: 'Inmobiliaria', body: 'Cualifica compradores preguntando por presupuesto, tipo de propiedad y urgencia. Solo agenda visitas con prospectos serios.' },
          { icon: '💻', title: 'SaaS / Tech', body: 'Guía al lead por el proceso de demo, responde preguntas técnicas frecuentes y agenda llamadas con el equipo de ventas.' },
        ]}
        faqs={[
          { q: '¿Puede el agente agendar reuniones directamente?', a: 'Sí. Se integra con Google Calendar y Calendly para agendar reuniones en tiempo real durante la conversación.' },
          { q: '¿Se integra con mi CRM actual?', a: 'Compatible con HubSpot, Salesforce, Pipedrive y cualquier CRM con API. También puedes exportar leads en CSV.' },
          { q: '¿Funciona en WhatsApp también?', a: 'Sí. El agente puede operar en widget web, WhatsApp Business API y próximamente en Instagram y Messenger.' },
          { q: '¿Cuánto tiempo toma configurarlo?', a: 'La configuración inicial toma menos de 30 minutos. Nuestro equipo te acompaña en el onboarding sin costo adicional.' },
          { q: '¿Puedo personalizar el guión de ventas?', a: 'Completamente. Defines el tono, las preguntas, las objeciones y los mensajes de cierre desde tu panel.' },
        ]}
      />
    </MainLayout>
  )
}