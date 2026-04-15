'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function StickyBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show banner only if not dismissed in this session
    const dismissed = sessionStorage.getItem('banner_dismissed')
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('banner_dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="bg-[#7C3AED] text-white sticky top-16 z-40 w-full">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <p className="text-sm font-medium flex-1 text-center">
          ⚡ <strong>Prueba gratuita de 14 días</strong> — Sin tarjeta de crédito — Activa tu agente IA hoy
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/register"
            className="bg-white text-[#7C3AED] px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-purple-50 transition whitespace-nowrap"
          >
            Empezar ahora →
          </Link>
          <button
            onClick={dismiss}
            aria-label="Cerrar banner"
            className="text-white/70 hover:text-white transition text-lg leading-none"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
