import { MainLayout } from '@/components/landing/MainLayout'
import { ProductPageTemplate } from '@/components/landing/ProductPageTemplate'
export const metadata = { title: 'IA para Educación — AIgenciaLab', description: 'Automatiza matrículas y atención a estudiantes con IA.' }
export default function Page() {
  return (
    <MainLayout>
      <ProductPageTemplate
        badge="Solución · Educación"
        emoji="📚"
        title="IA Educativa: **Más matrículas**, menos fricción"
        subtitle="Cada consulta de un prospecto sin responder rápida es una matrícula perdida. Un agente IA convierte el interés en inscripción — 24/7, sin esperar a que tu equipo esté disponible."
        metrics={[
          { value: '22%', label: 'Aumento en conversión matrícula' },
          { value: '60%', label: 'Reducción en consultas manuales' },
          { value: '24/7',label: 'Disponibilidad para prospectos' },
        ]}
        benefits={[
          'Atiende consultas de programas, mallas, vacantes y requisitos de admisión',
          'Guía al prospecto por el proceso de postulación paso a paso',
          'Captura datos y los registra en tu CRM educativo',
          'Envía material (brochures, videos) por WhatsApp automáticamente',
          'Agenda visitas a campus o clases de prueba',
          'Follow-up automatizado a prospectos que no completaron el proceso',
          'Gestión de listas de espera y notificación de cupos disponibles',
          'Multiidioma para programas internacionales',
        ]}
        steps={[
          { number: '01', title: 'Configuras tu oferta académica', body: 'Subes información de programas, requisitos, precios, becas y modalidades. El agente lo aprende todo.' },
          { number: '02', title: 'El agente asesora a cada prospecto', body: 'Responde preguntas específicas, compara programas según perfil del interesado y lo guía en el proceso.' },
          { number: '03', title: 'La matrícula se completa', body: 'El agente lleva al prospecto hasta el link de pago o formulario de inscripción, con seguimiento post-registro.' },
        ]}
        useCases={[
          { icon: '🎓', title: 'Universidades e Institutos', body: 'Atiende cientos de consultas simultáneas durante el período de admisión sin saturar el call center.' },
          { icon: '💼', title: 'Escuelas de Negocios', body: 'Cualifica candidatos a MBA y posgrados por perfil profesional, experiencia y motivación de carrera.' },
          { icon: '🖥️', title: 'Cursos Online y Bootcamps', body: 'Convierte tráfico de redes y Google Ads en inscripciones. Responde objeciones de precio e integra pagos.' },
        ]}
        faqs={[
          { q: '¿Funciona durante el peak de admisiones?', a: 'Sí. La arquitectura de AIgenciaLab escala automáticamente. Sin límite de conversaciones simultáneas en planes Business+.' },
          { q: '¿Puede el agente hablar sobre becas y financiamiento?', a: 'Sí. Lo configuras con la información de becas, CAE, créditos internos y repactaciones disponibles.' },
          { q: '¿Se integra con nuestro sistema de gestión académica?', a: 'Integramos con Banner (Ellucian), SIGA y sistemas propios via API. Consulta con nuestro equipo tu caso específico.' },
          { q: '¿Puede gestionar listas de espera?', a: 'Sí. El agente puede registrar interesados en lista de espera y notificarlos automáticamente cuando se liberen cupos.' },
          { q: '¿Cómo se mide el impacto en matrículas?', a: 'El panel de analytics muestra el funnel completo desde primera interacción hasta matrícula confirmada.' },
        ]}
      />
    </MainLayout>
  )
}