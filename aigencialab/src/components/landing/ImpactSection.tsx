'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

function useCountUp(target: number, duration: number = 2000, trigger: boolean = true) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    const startTime = performance.now()
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration, trigger])
  return count
}

function CounterBlock({ value, label, prefix = '', suffix = '' }: {
  value: number; label: string; prefix?: string; suffix?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const count = useCountUp(value, 1800, visible)

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="text-center px-8">
      <div className="text-4xl md:text-5xl font-bold text-[#C084FC] mb-2">
        {prefix}{count.toLocaleString('es-CL')}{suffix}
      </div>
      <div className="text-[#6B6480] text-sm max-w-[140px] mx-auto leading-tight">{label}</div>
    </div>
  )
}

function PainCard({ icon, title, body, stat }: { icon: string; title: string; body: string; stat: string }) {
  return (
    <div className="bg-[#111118] border border-white/8 rounded-2xl p-7 hover:border-[#7C3AED]/30 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(124,58,237,0.1)]">
      <div className="text-3xl mb-4">{icon}</div>
      <div className="inline-block text-xs font-bold text-[#7C3AED] bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-full px-3 py-1 mb-3">
        {stat}
      </div>
      <h3 className="text-[#F1F0F5] font-bold text-lg mb-2">{title}</h3>
      <p className="text-[#A09CB0] text-sm leading-relaxed">{body}</p>
    </div>
  )
}

export function ImpactSection() {
  return (
    <section className="bg-[#06060A] py-24 border-t border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[#6B6480] text-xs uppercase tracking-widest mb-4 font-semibold">
            Mientras lees esto, tu competencia ya está usando IA
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#F1F0F5] mb-4">
            Cada hora sin IA es dinero que se va
          </h2>
          <p className="text-[#A09CB0] text-lg max-w-xl mx-auto">
            Las empresas que adoptaron IA en 2025 triplicaron sus leads y redujeron sus costos de soporte en más del 60%.
          </p>
        </div>

        {/* Counters */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-0 md:divide-x divide-white/10 mb-20 bg-[#111118] border border-white/8 rounded-2xl py-10">
          <CounterBlock value={127}  label="Leads perdidos hoy en Chile" suffix="+" />
          <CounterBlock value={43}   label="Millones en ventas no concretadas" prefix="$" suffix="M" />
          <CounterBlock value={73}   label="De consultas sin respuesta en 5min" suffix="%" />
        </div>

        {/* Pain points */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <PainCard
            icon="⏰"
            title="Respuesta tardía = lead perdido"
            body="El 78% de los compradores elige al proveedor que responde primero. Si tardas más de 5 minutos, ya perdiste la venta."
            stat="78% de compradores"
          />
          <PainCard
            icon="💸"
            title="Fuera del horario comercial"
            body="El 40% de las consultas llegan entre las 7pm y las 9am. Sin IA, ese tráfico nocturno se va directo a tu competencia."
            stat="40% de consultas nocturnas"
          />
          <PainCard
            icon="📉"
            title="Tu equipo en tareas repetitivas"
            body="El 65% del tiempo de soporte se gasta en las mismas 20 preguntas. La IA las resuelve en segundos, liberando tu equipo."
            stat="65% tiempo desperdiciado"
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-[#A09CB0] mb-6">
            Recibe un diagnóstico gratuito de cuánto estás perdiendo — en menos de 24 horas
          </p>
          <Link
            href="/audit"
            className="inline-block bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold px-10 py-4 rounded-xl transition-all hover:shadow-[0_8px_30px_rgba(124,58,237,0.4)]"
          >
            Quiero mi diagnóstico gratuito →
          </Link>
          <p className="text-[#6B6480] text-sm mt-3">Sin costo · Sin compromiso · Respuesta en 24 horas</p>
        </div>

      </div>
    </section>
  )
}
