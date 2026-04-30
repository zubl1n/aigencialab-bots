import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'

export default function AuditGracias() {
  return (
    <MainLayout>
      <div className="bg-[#0A0A0F] min-h-screen text-[#F1F0F5] flex items-center justify-center px-6">
        <div className="max-w-2xl text-center">
          <div className="text-6xl mb-8">🎉</div>
          <h1 className="text-4xl font-bold mb-4 text-[#F1F0F5]">¡Solicitud recibida!</h1>
          <p className="text-[#A09CB0] text-lg mb-8">
            Tu auditoría gratuita está en proceso. Nuestro equipo revisará tu empresa y te enviará un análisis personalizado en <strong className="text-[#C084FC]">menos de 24 horas</strong> a <strong className="text-[#C084FC]">tu email</strong>.
          </p>
          <div className="bg-[#16161E] border border-white/8 rounded-2xl p-8 mb-8 text-left space-y-3">
            <h2 className="font-bold text-lg mb-4">Próximos pasos:</h2>
            {[
              'Revisamos tu sitio web y flujo de atención actual',
              'Identificamos los puntos de mayor oportunidad para IA',
              'Preparamos tu informe personalizado',
              'Te contactamos para presentar los resultados',
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#7C3AED] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="text-[#A09CB0]">{s}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-3 rounded-xl font-semibold transition">
              Volver al inicio
            </Link>
            <Link href="/precios" className="border border-white/10 text-[#C084FC] px-8 py-3 rounded-xl font-semibold hover:bg-white/5 transition">
              Ver planes y precios
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
