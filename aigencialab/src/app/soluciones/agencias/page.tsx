import { MainLayout } from '@/components/landing/MainLayout'
import { ProductPageTemplate } from '@/components/landing/ProductPageTemplate'
export const metadata = { title: 'IA para Agencias Digitales — AIgenciaLab', description: 'Escala las operaciones de tu agencia con agentes IA.' }
export default function Page() {
  return (
    <MainLayout>
      <ProductPageTemplate
        badge="Solución · Agencias"
        emoji="🚀"
        title="IA para Agencias Digitales: **Escala sin contratar**"
        subtitle="Ofrece agentes IA como servicio a tus clientes. Sin infraestructura propia, sin contratos de mantenimiento. Aumenta tus ingresos recurrentes simplemente haciendo whitelabel."
        metrics={[
          { value: '5x', label: 'Más clientes con el mismo equipo' },
          { value: '70%', label: 'Margen de resale típico' },
          { value: '48h', label: 'Deploy de un agente listo' },
        ]}
        benefits={[
          'Whitelabel completo: tu marca, tu dominio, tus colores',
          'Panel multi-cliente para gestionar todos tus cuentas desde un solo lugar',
          'Configura y despliega agentes para clientes en menos de 48 horas',
          'Pricing flexible de resale: tú defines el margen sobre el precio base',
          'Reportes white-label que puedes compartir directamente con tus clientes',
          'Soporte prioritario dedicado para agencias (canal directo de Slack)',
          'Capacitación de tu equipo incluida en el onboarding',
          'API acceso completo para integraciones con tus sistemas propios',
        ]}
        steps={[
          { number: '01', title: 'Te registras como agencia partner', body: 'Accedes al panel multi-cliente con precios de resale y herramientas de gestión avanzadas.' },
          { number: '02', title: 'Configuras el agente para tu cliente', body: 'En 48 horas tienes el agente con marca, tono e instrucciones del cliente listo para producción.' },
          { number: '03', title: 'Cobras a tu cliente mensualmente', body: 'Tú defines el precio. Nosotros te cobramos el precio base. El margen es tuyo.' },
        ]}
        useCases={[
          { icon: '💼', title: 'Agencias de Marketing Digital', body: 'Agrega IA conversacional a tus servicios de performance marketing. Convierte el tráfico que ya generas en leads calificados.' },
          { icon: '🖥️', title: 'Agencias de Desarrollo Web', body: 'Ofrece widget IA como addon de alto margen a todos los proyectos web que entregues.' },
          { icon: '📊', title: 'Consultoras de CX', body: 'Implementa agentes IA como solución de automatización de customer experience para tus clientes enterprise.' },
        ]}
        faqs={[
          { q: '¿Qué incluye el plan de agencias?', a: 'Acceso multi-cliente, panel de gestión, precios de resale, whitelabel, soporte prioritario y capacitación del equipo.' },
          { q: '¿Puedo poner mi propia marca en el widget y panel?', a: 'Sí. Whitelabel completo: logo, colores, dominio y nombre. Tus clientes nunca ven la marca AIgenciaLab.' },
          { q: '¿Cómo funciona el pricing de resale?', a: 'Tienes precios de agencia (descuentos de 25-40% sobre precio público). Tú cobras lo que defines a tus clientes.' },
          { q: '¿Hay límite de clientes que puedo gestionar?', a: 'No. Puedes tener clientes ilimitados. El costo escala según el volumen de conversaciones total.' },
          { q: '¿Cuánto tiempo toma onboardear a un cliente nuevo?', a: 'Con los templates de nuestra librería, un agente básico puede estar activo en 24-48 horas. Los complejos en 1-2 semanas.' },
        ]}
      />
    </MainLayout>
  )
}