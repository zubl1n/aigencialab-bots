const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src/app');

// 1. Pages for products
const products = [
    { slug: 'agente-ventas', title: 'Agente de Ventas', desc: 'Aumenta tus conversiones con un agente experto en ventas que trabaja 24/7.' },
    { slug: 'atencion-cliente', title: 'Atención al Cliente 24/7', desc: 'Resuelve consultas de tus clientes instantáneamente en cualquier momento.' },
    { slug: 'captura-leads', title: 'Captura de Leads', desc: 'Automatiza la recolección y calificación de prospectos.' },
    { slug: 'ia-conversacional', title: 'IA Conversacional', desc: 'Interacciones naturales y humanas gracias a IA avanzada.' },
    { slug: 'widget-web', title: 'Widget para Web', desc: 'Integra el agente en tu sitio web con una línea de código.' },
    { slug: 'integraciones', title: 'Integraciones', desc: 'Conecta con tus herramientas favoritas como CRM y plataformas de pago.' }
];

products.forEach(p => {
    const dir = path.join(pagesDir, 'productos', p.slug);
    fs.mkdirSync(dir, { recursive: true });
    
    const content = `
import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'

export default function ProductPage() {
  return (
    <MainLayout>
      <div className="bg-white">
        <header className="py-20 px-6 sm:px-12 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">${p.title}</h1>
          <p className="text-lg text-gray-600 mb-8">${p.desc}</p>
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
`;
    fs.writeFileSync(path.join(dir, 'page.tsx'), content.trim());
});

// 2. Pages for Solutions
const solutions = [
    { slug: 'ecommerce', title: 'E-commerce', desc: 'Mejora las ventas de tu tienda online con recomendaciones 24/7.' },
    { slug: 'inmobiliarias', title: 'Inmobiliarias', desc: 'Califica leads y agenda visitas de propiedades de forma automática.' },
    { slug: 'educacion', title: 'Educación', desc: 'Información inmediata sobre cursos, matrículas y becas.' },
    { slug: 'salud', title: 'Salud y Clínicas', desc: 'Agenda de horas médicas, atención de dudas frecuentes y confirmaciones.' },
    { slug: 'agencias', title: 'Agencias Digitales', desc: 'Atención a prospectos y clientes en piloto automático.' }
];

solutions.forEach(p => {
    const dir = path.join(pagesDir, 'soluciones', p.slug);
    fs.mkdirSync(dir, { recursive: true });
    
    // Copy similar structure from product
    const content = `
import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'

export default function SolutionPage() {
  return (
    <MainLayout>
      <div className="bg-white">
        <header className="py-20 px-6 sm:px-12 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">AIgenciaLab para ${p.title}</h1>
          <p className="text-lg text-gray-600 mb-8">${p.desc}</p>
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
`;
    fs.writeFileSync(path.join(dir, 'page.tsx'), content.trim());
});

// 3. Pages for Nosotros
['nosotros', 'casos-exito', 'contacto'].forEach(slug => {
    const dir = path.join(pagesDir, slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'page.tsx'), `
import { MainLayout } from '@/components/landing/MainLayout'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="py-20 px-6 text-center max-w-4xl mx-auto min-h-[60vh]">
        <h1 className="text-4xl md:text-5xl font-bold capitalize mb-6">${slug.replace('-', ' ')}</h1>
        <p className="text-lg text-gray-600 mb-8">Información sobre ${slug.replace('-', ' ')} próximamente.</p>
        <Link href="/" className="text-purple-600 font-semibold hover:underline">Volver al inicio</Link>
      </div>
    </MainLayout>
  )
}
`.trim());
});

console.log("Pages generated");
