import { MainLayout } from '@/components/landing/MainLayout'
import { ProductPageTemplate } from '@/components/landing/ProductPageTemplate'
export const metadata = { title: 'Integraciones IA — AIgenciaLab', description: 'Conecta tu agente IA con WhatsApp, CRM, Transbank y más.' }
export default function Page() {
  return (
    <MainLayout>
      <ProductPageTemplate
        badge="Producto · Integraciones"
        emoji="🔗"
        title="**Integraciones** que conectan tu IA con todo tu stack"
        subtitle="Tu agente IA no es una isla. Se conecta nativamente con WhatsApp, tu CRM, sistemas de pago, ERP y cualquier herramienta que ya usas en tu empresa."
        metrics={[
          { value: '20+',  label: 'Integraciones nativas' },
          { value: '5min', label: 'Tiempo de conexión promedio' },
          { value: 'API', label: 'Acceso completo para devs' },
        ]}
        benefits={[
          'WhatsApp Business API oficial — mensajes entrantes y salientes (HSM)',
          'Integración con HubSpot, Salesforce, Pipedrive y Zoho CRM',
          '≠nlink con Defontana, Buk, Transbank y MercadoPago',
          'Webhooks y API REST para cualquier sistema propio',
          'Zapier / Make / n8n para automatizaciones sin código',
          'Google Calendar y Calendly para agendamiento',
          'Métricas exportables a Google Sheets o Looker Studio',
          'Shopify y WooCommerce: stock, precios y tracking de pedidos',
        ]}
        steps={[
          { number: '01', title: 'Elige tu integración', body: 'Desde el panel de integraciones seleccionas el servicio que quieres conectar. Interfaz guiada paso a paso.' },
          { number: '02', title: 'Autoriza con OAuth o API Key', body: 'La mayoría de integraciones se conectan en un click via OAuth. Sin tocar código ni servidores.' },
          { number: '03', title: 'El agente opera con datos reales', body: 'Ahora tu agente puede consultar stock, crear tickets, registrar leads y enviar mensajes directamente.' },
        ]}
        useCases={[
          { icon: '📱', title: 'WhatsApp Business', body: 'Tu agente atiende por WhatsApp 24/7. Envía mensajes de seguimiento, promos y confirmaciones directamente desde la plataforma.' },
          { icon: '💳', title: 'E-commerce + Transbank', body: 'Consulta estado de pagos y pedidos en tiempo real. El agente responde "¿Cuándo llega mi pedido?" conectado a tu plataforma.' },
          { icon: '📊', title: 'CRM + Automatizaciones', body: 'Cada lead capturado se registra automáticamente en tu CRM y activa la secuencia de seguimiento correspondiente.' },
        ]}
        faqs={[
          { q: '¿Soportan algún sistema de ERP chileno?', a: 'Sí. Tenemos integración nativa con Defontana, y conectores para SAP B1, Buk y SII via API.' },
          { q: '¿Puedo crear integraciones personalizadas?', a: 'Sí. La API de AIgenciaLab es REST y documentada. También puedes usar webhooks para conectar cualquier sistema.' },
          { q: '¿La integración con WhatsApp requiere aprobación de Meta?', a: 'La cuenta de WhatsApp Business API debe estar verificada por Meta. Nuestro equipo te ayuda en el proceso sin costo adicional.' },
          { q: '¿Cuántas integraciones puedo tener activas simultáneamente?', a: 'Unlimited en planes Pro y Business. Starter incluye widget web + 1 integración adicional.' },
          { q: '¿Qué pasa si la integración externa falla?', a: 'El agente opera normalmente. Recibís una alerta en el panel cuando alguna integración tiene problemas de conectividad.' },
        ]}
      />
    </MainLayout>
  )
}