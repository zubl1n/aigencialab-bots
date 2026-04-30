'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LogIn, Menu, X } from 'lucide-react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled,   setScrolled]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Inicio',  href: '/' },
    { label: 'Precios', href: '/precios' },
    { label: 'Blog',    href: '/blog' },
  ]

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0A0F]/95 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/20'
          : 'bg-[#0A0A0F]/90 backdrop-blur-sm border-b border-white/[0.04]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16 items-center">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group" aria-label="AIgenciaLab — Inicio">
            <img
              src="/logo-aigencialab.svg"
              alt="AIgenciaLab"
              className="h-9 w-auto"
              style={{ filter: 'drop-shadow(0 0 8px rgba(124,58,237,0.3))' }}
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-[#A09CB0] hover:text-[#F1F0F5] text-sm font-medium transition-colors duration-200 relative group"
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#7C3AED] group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          {/* CTA — Ingresar (desktop) */}
          <div className="hidden md:block">
            <Link
              href="/login"
              id="navbar-login-btn"
              className="inline-flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-5 py-2 rounded-full text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] hover:scale-[1.03]"
            >
              <LogIn size={15} />
              Ingresar
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            id="navbar-mobile-toggle"
            className="md:hidden text-[#A09CB0] hover:text-[#F1F0F5] transition-colors p-2 rounded-lg hover:bg-white/5"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0D0D15] border-t border-white/[0.06] px-4 py-4 space-y-1">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center px-3 py-3 text-[#A09CB0] hover:text-[#F1F0F5] hover:bg-white/[0.04] rounded-xl font-medium text-sm transition-colors"
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/[0.06] mt-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold text-sm transition-all"
            >
              <LogIn size={15} />
              Ingresar
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
