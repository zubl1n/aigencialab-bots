import { MainLayout } from '@/components/landing/MainLayout'
import { ProductPageTemplate } from '@/components/landing/ProductPageTemplate'
export const metadata = { title: 'IA para Salud y Clínicas — AIgenciaLab', description: 'Agendamiento médico y atención a pacientes automatizado.' }
export default function Page() {
  return (
    <MainLayout>
      <ProductPageTemplate
        badge="Solución · Salud"
        emoji="🏥"
        title="IA para Clínicas: **Agendamiento médico** sin espera"
        subtitle="Tus pacientes no pueden esperar. Un agente IA agenda horas, responde preguntas de preparación y envía recordatorios automáticos — liberando a tu recepción del 80% de llamadas repetitivas."
        metrics={[
          { value: '500+', label: 'Horas agendadas/mes automáticamente' },
          { value: '80%',  label: 'Reducción en llamadas a recepción' },
          { value: '4.9★', label: 'Satisfacción de pacientes' },
        ]}
        benefits={[
          'Agendamiento de horas 24/7 sin intervención de recepción',
          'Envío de instrucciones de preparación para exámenes automáticamente',
          'Recordatorio de cita 24h y 1h antes por WhatsApp y SMS',
          'Gestión de reagendamientos y cancelaciones sin llamadas',
          'Responde preguntas sobre coberturas de isapres y fonasa',
          'Verificación de disponibilidad en tiempo real por especialidad',
          'Derivación inteligente al profesional correcto según síntoma declarado',
          'Cumplimiento RGPD y Ley N°19.628 en el manejo de datos de salud',
        ]}
        steps={[
          { number: '01', title: 'Conectas tu agenda médica', body: 'Integramos con tu sistema de agenda (SIAP, iMedic, Doctoralia, o Google Calendar). Disponibilidad en tiempo real.' },
          { number: '02', title: 'El agente atiende al paciente', body: 'Pregunta por especialidad, síntoma o médico preferido. Muestra horarios disponibles y confirma la cita.' },
          { number: '03', title: 'El paciente recibe confirmación', body: 'Confirmación inmediata por WhatsApp con instrucciones de preparación, dirección y recordatorio automático.' },
        ]}
        useCases={[
          { icon: '🦷', title: 'Clínicas Dentales', body: '500 horas agendadas al mes sin que recepción toque el teléfono. Recordatorios con instrucciones por especialidad.' },
          { icon: '🔬', title: 'Centros de Diagnósticos', body: 'Agendamiento de exámenes con instrucciones de ayuno, preparación y logística enviadas automáticamente.' },
          { icon: '🧠', title: 'Salud Mental', body: 'Primera consulta pactada de forma anónima y discreta. El agente maneja la sensibilidad del área con protocolos específicos.' },
        ]}
        faqs={[
          { q: '¿Con qué sistemas de agenda médica se integra?', a: 'Nativo con Doctoralia, iMedic y Google Calendar. Para sistemas propios o ClínicaLab usamos API o integración manual.' },
          { q: '¿Cómo maneja el agente información sensible de salud?', a: 'Cumplimos GDPR, Ley N°19.628 y protocolos de datos sensibles. Los datos de salud nunca se usan para entrenar modelos externos.' },
          { q: '¿Puede el agente hacer triage básico?', a: 'Puede hacer un pre-triage por síntomas declarados para derivar a la especialidad correcta, pero no hace diagnóstico médico.' },
          { q: '¿Funciona para clínicas con múltiples especialidades?', a: 'Sí. Puedes configurar múltiples especialidades, con reglas de derivación y disponibilidades independientes por médico.' },
          { q: '¿Qué pasa con cancelaciones de último minuto?', a: 'El sistema notifica al paciente siguiente en lista de espera automáticamente cuando se libera un cupo.' },
        ]}
      />
    </MainLayout>
  )
}