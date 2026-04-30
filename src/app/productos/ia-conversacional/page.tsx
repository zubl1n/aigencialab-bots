import { MainLayout } from '@/components/landing/MainLayout'
import { ProductPageTemplate } from '@/components/landing/ProductPageTemplate'
export const metadata = { title: 'IA Conversacional — AIgenciaLab', description: 'Conversaciones naturales con IA avanzada para tu empresa.' }
export default function Page() {
  return (
    <MainLayout>
      <ProductPageTemplate
        badge="Producto · IA Avanzada"
        emoji="🧠"
        title="**IA Conversacional** para interacciones naturales"
        subtitle="Basada en los mismos modelos de lenguaje que usan las empresas Fortune 500. Conversaciones que parecen humanas — porque entienden el contexto, la intención y el tono."
        metrics={[
          { value: '95%',  label: 'Precisión en comprensión de intención' },
          { value: '99.9%',label: 'Uptime garantizado' },
          { value: '12+',  label: 'Idiomas soportados' },
        ]}
        benefits={[
          'Modelos LLM de última generación (Claude 3, GPT-4o) bajo el capó',
          'Comprensión de contexto en conversaciones largas y complejas',
          'Manejo natural de objeciones, humor y lenguaje informal',
          'Memoria de sesión: recuerda lo dicho anteriormente en la conversación',
          'Detección de sentimiento para ajustar el tono automáticamente',
          'Multimodal: puede interpretar imágenes enviadas por el usuario',
          'Entrenamiento fino con datos de tu empresa para respuestas específicas',
          'Pipeline de mejora continua con cada conversación',
        ]}
        steps={[
          { number: '01', title: 'Configura el contexto', body: 'Le explicas a tu agente quién es, qué hace tu empresa, cuáles son sus productos y cómo debe comunicarse.' },
          { number: '02', title: 'Entrenas con tus datos', body: 'Subes documentación, preguntas frecuentes, casos de uso y el agente los incorpora como conocimiento propio.' },
          { number: '03', title: 'El agente aprende y mejora', body: 'Cada conversación es analizada para identificar patrones y mejorar las respuestas automáticamente.' },
        ]}
        useCases={[
          { icon: '🏦', title: 'Finanzas y Seguros', body: 'Explica productos financieros complejos con lenguaje simple, cualifica por perfil de riesgo y acompaña el proceso de contratación.' },
          { icon: '🏭', title: 'B2B Industrial', body: 'Resuelve consultas técnicas sobre productos, especificaciones y compatibilidad. Ideal para catálogos complejos.' },
          { icon: '🎓', title: 'Educación Superior', body: 'Guía a candidatos a lo largo del proceso de admisión, responde preguntas académicas y facilita la matrícula online.' },
        ]}
        faqs={[
          { q: '¿Qué modelos de IA usa AIgenciaLab?', a: 'Usamos Claude 3, GPT-4o y Gemini Pro según el caso de uso. Puedes elegir el modelo desde tu panel de configuración.' },
          { q: '¿El agente puede recordar conversaciones anteriores del mismo cliente?', a: 'Sí, con la función de memoria persistente (disponible desde el plan Pro). Cada cliente tiene su historial vinculado.' },
          { q: '¿Cómo maneja idiomas mezclados (Spanglish)?', a: 'Los modelos LLM modernos manejan mezcla de idiomas de forma natural, sin configuración adicional.' },
          { q: '¿Puedo entrenar el modelo con mis propios datos?', a: 'Sí. Puedes subir documentos, URLs y texto libre que el agente incorpora como base de conocimiento privada.' },
          { q: '¿Los datos de conversación son privados?', a: 'Sí. Tus datos no se usan para entrenar modelos de terceros. Cumplimos con GDPR y Ley N°19.628 chilena.' },
        ]}
      />
    </MainLayout>
  )
}