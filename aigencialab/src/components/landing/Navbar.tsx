'use client'
import Link from 'next/link'
import { useState } from 'react'

const products = [
  { name: 'Agente de Ventas',       desc: 'Aumenta tus conversiones con IA 24/7', icon: '🤝', href: '/productos/agente-ventas' },
  { name: 'Atención al Cliente',    desc: 'Resuelve el 90% de las consultas',      icon: '💬', href: '/productos/atencion-cliente' },
  { name: 'Captura de Leads',       desc: 'Convierte visitas en prospectos',        icon: '🎯', href: '/productos/captura-leads' },
  { name: 'IA Conversacional',      desc: 'Interacciones naturales y fluidas',      icon: '🧠', href: '/productos/ia-conversacional' },
  { name: 'Widget para Web',        desc: 'Fácil instalación en tu sitio',          icon: '⚡', href: '/productos/widget-web' },
  { name: 'Integraciones',          desc: 'Conectado a tu CRM y herramientas',      icon: '🔗', href: '/productos/integraciones' },
]

const solutions = [
  { name: 'E-commerce',         desc: 'Automatiza ventas y soporte de pedidos',      icon: '🛒', href: '/soluciones/ecommerce' },
  { name: 'Inmobiliarias',      desc: 'Agenda visitas y califica compradores',        icon: '🏢', href: '/soluciones/inmobiliarias' },
  { name: 'Educación',          desc: 'Atención a estudiantes y leads de matrículas', icon: '📚', href: '/soluciones/educacion' },
  { name: 'Salud y Clínicas',   desc: 'Agendamiento médico automatizado',             icon: '🏥', href: '/soluciones/salud' },
  { name: 'Agencias Digitales', desc: 'Escala tus operaciones con IA',                icon: '🚀', href: '/soluciones/agencias' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileProducts, setMobileProducts] = useState(false)
  const [mobileSolutions, setMobileSolutions] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="bg-[#7C3AED] text-white rounded-md px-2 py-1 text-sm font-bold leading-none">AI</span>
            <span className="text-[#F1F0F5] font-bold text-lg">genciaLab</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 font-medium">

            {/* Productos dropdown */}
            <div className="group relative h-16 flex items-center">
              <button className="text-[#A09CB0] hover:text-[#F1F0F5] flex items-center gap-1 text-sm transition-colors">
                Productos <span className="text-xs opacity-60">▾</span>
              </button>
              <div className="absolute top-16 left-0 w-80 bg-[#111118] border border-white/8 shadow-2xl rounded-xl p-2 flex flex-col gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform translate-y-2 group-hover:translate-y-0 origin-top">
                {products.map(p => (
                  <Link key={p.href} href={p.href} className="flex items-start gap-3 px-3 py-2.5 hover:bg-[#7C3AED]/10 rounded-lg transition-colors">
                    <span className="text-xl mt-0.5">{p.icon}</span>
                    <div>
                      <div className="text-[#F1F0F5] text-sm font-semibold">{p.name}</div>
                      <div className="text-[#6B6480] text-xs">{p.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Soluciones dropdown */}
            <div className="group relative h-16 flex items-center">
              <button className="text-[#A09CB0] hover:text-[#F1F0F5] flex items-center gap-1 text-sm transition-colors">
                Soluciones <span className="text-xs opacity-60">▾</span>
              </button>
              <div className="absolute top-16 left-0 w-72 bg-[#111118] border border-white/8 shadow-2xl rounded-xl p-2 flex flex-col gap-0.5 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all transform translate-y-2 group-hover:translate-y-0 origin-top">
                {solutions.map(p => (
                  <Link key={p.href} href={p.href} className="flex items-start gap-3 px-3 py-2.5 hover:bg-[#7C3AED]/10 rounded-lg transition-colors">
                    <span className="text-xl mt-0.5">{p.icon}</span>
                    <div>
                      <div className="text-[#F1F0F5] text-sm font-semibold">{p.name}</div>
                      <div className="text-[#6B6480] text-xs">{p.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Link href="/precios" className="text-[#A09CB0] hover:text-[#F1F0F5] text-sm transition-colors">Precios</Link>
            <Link href="/blog" className="text-[#A09CB0] hover:text-[#F1F0F5] text-sm transition-colors">Blog</Link>
            <Link href="/casos-exito" className="text-[#A09CB0] hover:text-[#F1F0F5] text-sm transition-colors">Casos de éxito</Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/audit" className="border border-[#7C3AED]/50 text-[#C084FC] hover:bg-[#7C3AED]/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              Auditoría Gratis
            </Link>
            <Link href="/login" className="text-[#A09CB0] hover:text-[#F1F0F5] text-sm transition-colors px-2 py-2">
              Iniciar sesión
            </Link>
            <Link href="/register" className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              Comenzar gratis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#A09CB0] hover:text-[#F1F0F5] transition-colors p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menú"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A0A0F] border-t border-white/6 px-4 py-4 space-y-2">
          <button
            className="w-full text-left text-[#A09CB0] font-semibold py-2 flex justify-between"
            onClick={() => setMobileProducts(!mobileProducts)}
          >
            Productos <span>{mobileProducts ? '▲' : '▼'}</span>
          </button>
          {mobileProducts && (
            <div className="pl-4 space-y-1">
              {products.map(p => (
                <Link key={p.href} href={p.href} onClick={() => setMobileOpen(false)}
                  className="block text-[#6B6480] hover:text-[#F1F0F5] py-1.5 text-sm">{p.name}</Link>
              ))}
            </div>
          )}
          <button
            className="w-full text-left text-[#A09CB0] font-semibold py-2 flex justify-between"
            onClick={() => setMobileSolutions(!mobileSolutions)}
          >
            Soluciones <span>{mobileSolutions ? '▲' : '▼'}</span>
          </button>
          {mobileSolutions && (
            <div className="pl-4 space-y-1">
              {solutions.map(p => (
                <Link key={p.href} href={p.href} onClick={() => setMobileOpen(false)}
                  className="block text-[#6B6480] hover:text-[#F1F0F5] py-1.5 text-sm">{p.name}</Link>
              ))}
            </div>
          )}
          <Link href="/precios" className="block text-[#A09CB0] py-2 font-semibold">Precios</Link>
          <Link href="/blog" className="block text-[#A09CB0] py-2 font-semibold">Blog</Link>
          <hr className="border-white/10 my-2" />
          <Link href="/audit" className="block text-center border border-[#7C3AED]/50 text-[#C084FC] py-2.5 rounded-xl font-semibold">Auditoría Gratis</Link>
          <Link href="/register" className="block text-center bg-[#7C3AED] text-white py-2.5 rounded-xl font-semibold mt-2">Comenzar gratis</Link>
        </div>
      )}
    </nav>
  )
}
