import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'

export default function ProductPage() {
  return (
    <MainLayout>
      <div className="bg-white">
        <header className="py-20 px-6 sm:px-12 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">Integraciones</h1>
          <p className="text-lg text-gray-600 mb-8">Conecta con tus herramientas favoritas como CRM y plataformas de pago.</p>
          <Link href="/register" className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition">Probar gratis</Link>
        </header>

        <section className="py-16 px-6 sm:px-12 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Beneficios</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                'Solución automatizada 24/7',
                'Personalización completa con tu marca',
                'Integración rápida en 5 minutos',
                'Soporte dedicado'
              ].map((b, i) => (
                <div key={i} className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-sm">
                  <div className="bg-green-100 p-2 rounded-full text-green-600">✓</div>
                  <span className="font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 sm:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Cómo funciona</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="p-6">
                <div className="text-purple-600 font-bold text-2xl mb-4">1</div>
                <h3 className="font-bold mb-2">Regístrate</h3>
                <p className="text-gray-600">Crea tu cuenta en segundos.</p>
              </div>
              <div className="p-6">
                <div className="text-purple-600 font-bold text-2xl mb-4">2</div>
                <h3 className="font-bold mb-2">Configura tu IA</h3>
                <p className="text-gray-600">Dale contexto y ajusta el comportamiento.</p>
              </div>
              <div className="p-6">
                <div className="text-purple-600 font-bold text-2xl mb-4">3</div>
                <h3 className="font-bold mb-2">Instala en tu web</h3>
                <p className="text-gray-600">Copia el widget y comienza a interactuar.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 text-center bg-purple-50">
          <h2 className="text-3xl font-bold mb-8">¿Listo para transformar tu negocio?</h2>
          <Link href="/register" className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-purple-700 transition">Comenzar ahora gratis</Link>
        </section>
      </div>
    </MainLayout>
  )
}