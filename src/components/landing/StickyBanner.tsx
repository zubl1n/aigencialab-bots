'use client'
import { useState } from 'react'
import Link from 'next/link'

export function StickyBanner() {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div className="bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white sticky top-0 z-50 w-full shadow-lg shadow-purple-500/10">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <p className="text-sm font-medium flex-1 text-center">
          🎯 <strong>Auditoría Gratuita de Automatización</strong> — Descubre cuánto pierde tu negocio sin IA
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/audit"
            className="bg-white text-[#7C3AED] px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-purple-50 transition whitespace-nowrap"
          >
            Agenda aquí →
          </Link>
          <button
            onClick={() => setVisible(false)}
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
