import Link from 'next/link';
import { ReactNode } from 'react';

const products = [
  { name: 'Agente de Ventas', desc: 'Aumenta tus conversiones con IA 24/7', icon: '⚡', href: '/productos/agente-ventas' },
  { name: 'Atención al Cliente 24/7', desc: 'Resuelve el 90% de las consultas', icon: '🎧', href: '/productos/atencion-cliente' },
  { name: 'Captura de Leads', desc: 'Convierte visitas en prospectos', icon: '🎯', href: '/productos/captura-leads' },
  { name: 'IA Conversacional', desc: 'Interacciones naturales', icon: '💬', href: '/productos/ia-conversacional' },
  { name: 'Widget para Web', desc: 'Fácil instalación en tu sitio', icon: '🧩', href: '/productos/widget-web' },
  { name: 'Integraciones', desc: 'Conectado a tu CRM', icon: '🔗', href: '/productos/integraciones' },
];

const solutions = [
  { name: 'E-commerce', desc: 'Automatiza ventas y stock', icon: '🛍️', href: '/soluciones/ecommerce' },
  { name: 'Inmobiliarias', desc: 'Agenda visitas a propiedades', icon: '🏢', href: '/soluciones/inmobiliarias' },
  { name: 'Educación', desc: 'Atención a estudiantes', icon: '🎓', href: '/soluciones/educacion' },
  { name: 'Salud y Clínicas', desc: 'Agendamiento médico automatizado', icon: '⚕️', href: '/soluciones/salud' },
  { name: 'Agencias Digitales', desc: 'Escala tus operaciones', icon: '📈', href: '/soluciones/agencias' },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm text-gray-900 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-purple-600 text-white rounded-md p-1.5 leading-none">AI</span>
              genciaLab
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center font-medium">
            
            <div className="group relative h-16 flex items-center">
              <button className="hover:text-purple-600 flex items-center gap-1 transition-colors">
                Productos <span className="text-xs">▾</span>
              </button>
              <div className="absolute top-16 left-0 w-80 bg-white border border-gray-100 shadow-xl rounded-xl p-3 flex flex-col gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform origin-top translate-y-2 group-hover:translate-y-0">
                {products.map(p => (
                  <Link key={p.href} href={p.href} className="group/item flex items-start p-3 hover:bg-purple-50 rounded-lg transition-colors">
                    <span className="text-2xl mr-3">{p.icon}</span>
                    <div>
                      <div className="text-gray-900 font-semibold group-hover/item:text-purple-700">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="group relative h-16 flex items-center">
              <button className="hover:text-purple-600 flex items-center gap-1 transition-colors">
                Soluciones <span className="text-xs">▾</span>
              </button>
              <div className="absolute top-16 left-0 w-80 bg-white border border-gray-100 shadow-xl rounded-xl p-3 flex flex-col gap-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform origin-top translate-y-2 group-hover:translate-y-0">
                {solutions.map(p => (
                  <Link key={p.href} href={p.href} className="group/item flex items-start p-3 hover:bg-purple-50 rounded-lg transition-colors">
                    <span className="text-2xl mr-3">{p.icon}</span>
                    <div>
                      <div className="text-gray-900 font-semibold group-hover/item:text-purple-700">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/precios" className="hover:text-purple-600 transition-colors">Precios</Link>
            <Link href="/blog" className="hover:text-purple-600 transition-colors">Blog</Link>
            
            <div className="group relative h-16 flex items-center">
              <button className="hover:text-purple-600 flex items-center gap-1 transition-colors">
                Nosotros <span className="text-xs">▾</span>
              </button>
              <div className="absolute top-16 left-0 w-56 bg-white border border-gray-100 shadow-xl rounded-xl p-2 flex flex-col opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform origin-top translate-y-2 group-hover:translate-y-0">
                <Link href="/nosotros" className="px-4 py-3 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors font-medium">Sobre AIgenciaLab</Link>
                <Link href="/casos-exito" className="px-4 py-3 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors font-medium">Casos de éxito</Link>
                <Link href="/contacto" className="px-4 py-3 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors font-medium">Contacto</Link>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-gray-900 font-semibold hover:text-purple-600 px-3 py-2 transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/register" className="bg-purple-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-purple-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5">
              Probar gratis →
            </Link>
          </div>

          {/* Mobile menu button (Simplified for strict CSS-only request, handling mobile with simple block/hidden is complex without state, but sticking to basic CSS nav) */}
          <div className="md:hidden flex items-center group">
            <button className="p-2 text-gray-600">☰</button>
             {/* Note: In a real NextJS app, mobile menu uses state, but simulating with group hover for now to comply with strict CSS rule */}
            <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl p-4 hidden group-hover:block transition-all">
               <div className="flex flex-col space-y-4">
                 <div className="font-bold text-gray-400 text-sm uppercase tracking-widest">General</div>
                 <Link href="/precios" className="block text-gray-900 font-medium font-semibold hover:text-purple-600">Precios</Link>
                 <Link href="/nosotros" className="block text-gray-900 font-medium font-semibold hover:text-purple-600">Nosotros</Link>
                 <Link href="/contacto" className="block text-gray-900 font-medium font-semibold hover:text-purple-600">Contacto</Link>
                 <hr/>
                 <Link href="/login" className="block text-center border border-gray-300 text-gray-900 font-semibold py-3 rounded-xl">Iniciar sesión</Link>
                 <Link href="/register" className="block text-center bg-purple-600 text-white font-semibold py-3 rounded-xl">Probar gratis</Link>
               </div>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
