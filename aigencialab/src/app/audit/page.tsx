'use client'
import { useState } from 'react'
import Link from 'next/link'
import type { AuditResult } from '@/lib/types'

const RUBROS = [
  { value: 'ecommerce_moda',   label: 'Ecommerce — Moda y vestuario' },
  { value: 'ecommerce_retail', label: 'Ecommerce — Retail general' },
  { value: 'clinica',          label: 'Clínica / Salud' },
  { value: 'inmobiliaria',     label: 'Inmobiliaria / Propiedades' },
  { value: 'courier',          label: 'Courier / Logística' },
  { value: 'restaurante',      label: 'Restaurante / Food' },
  { value: 'educacion',        label: 'Educación / Capacitación' },
  { value: 'servicios',        label: 'Servicios profesionales' },
  { value: 'manufactura',      label: 'Manufactura / Industria' },
  { value: 'otro',             label: 'Otro' },
]

const ANALYZING_MSGS = [
  'Iniciando análisis de infraestructura digital...',
  '📡 Consultando Google PageSpeed en tiempo real...',
  '🌐 Descargando y analizando HTML del sitio...',
  '🔍 Procesando señales SEO y de conversión...',
  '🤖 Calculando oportunidades de automatización IA...',
  '📊 Generando reporte personalizado...',
]

export default function AuditPage() {
  const [step,     setStep]     = useState<'form'|'analyzing'|'report'>('form')
  const [msg,      setMsg]      = useState(ANALYZING_MSGS[0])
  const [progress, setProgress] = useState(0)
  const [result,   setResult]   = useState<AuditResult | null>(null)
  const [leadInfo, setLeadInfo] = useState({ name:'', company:'', url:'', rubro:'', whatsapp:'' })
  const [error,    setError]    = useState('')

  const waNumber = process.env.NEXT_PUBLIC_WA_SALES_NUMBER ?? '56912345678'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd     = new FormData(e.currentTarget)
    const url    = (fd.get('url') as string).trim()
    const rubro  = fd.get('rubro') as string
    const name   = (fd.get('name') as string).trim()
    const company= (fd.get('company') as string).trim()
    const wa     = (fd.get('whatsapp') as string).trim()
    const email  = (fd.get('email') as string).trim()

    setLeadInfo({ name, company, url, rubro, whatsapp: wa })
    setStep('analyzing')
    setProgress(0)

    // Animación de progreso
    let msgIdx = 0
    const msgTimer = setInterval(() => {
      if (msgIdx < ANALYZING_MSGS.length - 1) setMsg(ANALYZING_MSGS[++msgIdx])
    }, 2500)
    const progTimer = setInterval(() => {
      setProgress(p => Math.min(p + 2, 90))
    }, 300)

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, rubro, name, company, whatsapp: wa, email }),
      })
      clearInterval(msgTimer); clearInterval(progTimer)
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Error del servidor') }
      const data = await res.json()
      setProgress(100)
      setMsg('✅ Análisis completado')
      setTimeout(() => { setResult(data.analysis); setStep('report') }, 600)
    } catch (err: unknown) {
      clearInterval(msgTimer); clearInterval(progTimer)
      setError((err as Error).message ?? 'Error inesperado')
      setStep('form')
    }
  }

  const sevColor = { critical: 'border-red-500/40 bg-red-500/5', warning: 'border-yellow-500/40 bg-yellow-500/5', info: 'border-blue-500/40 bg-blue-500/5' }
  const fmtCLP = (n: number) => '$' + Math.round(n).toLocaleString('es-CL')
  const rand   = (a: number, b: number) => Math.floor(Math.random()*(b-a+1))+a
  const tierBg = result ? (result.score>=70?'from-emerald-500/20':result.score>=50?'from-blue-500/20':result.score>=35?'from-yellow-500/20':'from-red-500/20') : ''

  return (
    <div className="min-h-screen py-12 px-4" style={{background:'linear-gradient(135deg,#080a12 0%,#0d1020 100%)'}}>
      <div className="max-w-2xl mx-auto">

        {/* ── HEADER ── */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-xl font-bold mb-4">
            Aigencia<span className="text-gradient">Lab.cl</span>
          </Link>
          <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full mb-4">
            🎁 100% Gratuita · Sin tarjeta · Resultado en ~30 segundos
          </div>
        </div>

        {/* ── STEP 1: FORM ── */}
        {step === 'form' && (
          <div className="glass rounded-2xl p-8">
            <h1 className="text-2xl font-bold mb-2">Auditoría IA Gratuita<br/><span className="text-gradient">para tu Negocio</span></h1>
            <p className="text-slate-400 text-sm mb-8">Detectamos automáticamente dónde pierdes clientes y dinero. Análisis real con Google PageSpeed.</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-6 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">🌐 URL de tu sitio web</label>
                <input name="url" type="url" placeholder="https://tu-empresa.cl"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"/>
                <p className="text-xs text-slate-600 mt-1">Si no tienes sitio web, también lo analizamos</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">🏢 Rubro de tu empresa *</label>
                <select name="rubro" required className="w-full bg-[#0d0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="">Selecciona tu industria</option>
                  {RUBROS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">👤 Tu nombre *</label>
                  <input name="name" type="text" required placeholder="María González"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">🏢 Empresa</label>
                  <input name="company" type="text" placeholder="RetailSur SpA"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">📱 WhatsApp *</label>
                  <div className="flex">
                    <span className="bg-white/5 border border-r-0 border-white/10 rounded-l-xl px-3 py-3 text-slate-400 text-sm">🇨🇱 +56</span>
                    <input name="whatsapp" type="tel" required placeholder="9 XXXX XXXX" pattern="[0-9\s]{8,11}"
                      className="flex-1 bg-white/5 border border-white/10 rounded-r-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">📧 Email (opcional)</label>
                  <input name="email" type="email" placeholder="gerente@empresa.cl"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"/>
                </div>
              </div>
              <button type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20">
                Analizar mi Negocio con IA →
              </button>
              <p className="text-center text-xs text-slate-600">🔒 Datos protegidos bajo Ley N°19.628 · Sin spam</p>
            </form>
          </div>
        )}

        {/* ── STEP 2: ANALYZING ── */}
        {step === 'analyzing' && (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="w-20 h-20 rounded-full border-2 border-blue-500/20 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
              </div>
              <span className="absolute inset-0 flex items-center justify-center text-2xl">🤖</span>
            </div>
            <h2 className="text-xl font-bold mb-2">Analizando tu negocio con IA...</h2>
            <p className="text-slate-400 text-sm mb-8">{msg}</p>
            <div className="bg-white/5 rounded-full h-2 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-violet-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            {['📡 Velocidad y rendimiento web','🌐 Análisis HTML y SEO real','📊 Benchmarks por rubro','🤖 Oportunidades de automatización'].map((item,i) => (
              <div key={item} className="flex items-center gap-3 text-sm text-left mb-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${progress > i*25+10 ? 'bg-emerald-500' : 'bg-white/10'}`}>
                  {progress > i*25+10 ? '✓' : '○'}
                </span>
                <span className={progress > i*25+10 ? 'text-emerald-300' : 'text-slate-500'}>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 3: REPORT ── */}
        {step === 'report' && result && (
          <div className="space-y-6">
            {/* Header reporte */}
            <div className="glass rounded-2xl p-6 text-center">
              <div className="text-sm font-bold mb-1">Aigencia<span className="text-gradient">Lab.cl</span></div>
              <h2 className="text-lg font-semibold">Reporte de Auditoría IA</h2>
              <div className="text-slate-400 text-sm">{leadInfo.name} · {leadInfo.url || 'Sin sitio'} · {new Date().toLocaleDateString('es-CL',{day:'2-digit',month:'long',year:'numeric'})}</div>
              <div className="text-xs mt-1 font-semibold" style={{color: result.realData ? '#059669' : '#D97706'}}>
                {result.realData ? '📡 Análisis real (PageSpeed + HTML)' : '📊 Estimado por rubro'}
              </div>
            </div>

            {/* Score ring */}
            <div className={`glass rounded-2xl p-8 bg-gradient-to-br ${tierBg} to-transparent`}>
              <div className="flex items-center gap-8">
                <div className="relative w-28 h-28 shrink-0">
                  <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="10"/>
                    <circle cx="60" cy="60" r="52" fill="none" stroke={result.tierColor} strokeWidth="10"
                      strokeLinecap="round" strokeDasharray="327"
                      strokeDashoffset={327 - (result.score/100)*327}
                      style={{transition:'stroke-dashoffset 1.5s ease'}}/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{result.score}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1" style={{color:result.tierColor}}>{result.tier}</div>
                  <div className="text-slate-400 text-sm">Score de Madurez Digital</div>
                  <div className="text-slate-500 text-xs mt-1">{result.issues.length} problemas detectados</div>
                </div>
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-4">
              {result.metrics.map(m => (
                <div key={m.label} className="glass rounded-xl p-4">
                  <div className="text-xs text-slate-500 mb-1">{m.label}</div>
                  <div className="text-xl font-bold" style={{color:m.color}}>{m.value}</div>
                  <div className="text-xs mb-2" style={{color:m.color}}>{m.status}</div>
                  {m.detail && <div className="text-xs text-slate-600 mb-2">{m.detail}</div>}
                  <div className="bg-white/5 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full transition-all duration-700" style={{width:`${m.score}%`, background:m.color}}/>
                  </div>
                </div>
              ))}
            </div>

            {/* Core Web Vitals */}
            {result.psi && (
              <div className="glass rounded-xl p-4 border border-blue-500/20">
                <h3 className="text-sm font-bold text-blue-300 mb-3">⚡ Core Web Vitals (Google Real)</h3>
                <div className="flex flex-wrap gap-3">
                  {[['LCP',result.psi.lcp],['FCP',result.psi.fcp],['TBT',result.psi.tbt],['SI',result.psi.si]].filter(([,v])=>v).map(([k,v])=>(
                    <div key={k} className="bg-white/5 rounded-lg px-3 py-2 text-center">
                      <div className="text-xs text-slate-500">{k}</div>
                      <div className="font-bold text-sm">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Issues */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold mb-4">⚡ Problemas Detectados</h3>
              <div className="space-y-3">
                {result.issues.map((issue,i) => (
                  <div key={i} className={`flex gap-3 p-4 rounded-xl border ${sevColor[issue.sev]}`}>
                    <span className="text-xl shrink-0">{issue.icon}</span>
                    <div>
                      <div className="font-semibold text-sm">{issue.title}</div>
                      <div className="text-slate-400 text-xs mt-1">{issue.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Oportunidades */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold mb-4">🚀 Oportunidades de IA</h3>
              <div className="space-y-3">
                {result.opportunities.map((opp,i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <span className="text-2xl shrink-0">{opp.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{opp.title}</div>
                      <div className="text-slate-400 text-xs">{opp.desc}</div>
                    </div>
                    <div className="text-emerald-400 text-xs font-bold whitespace-nowrap">{opp.impact}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings */}
            <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border border-emerald-500/30 text-center">
              <div className="text-sm text-slate-400 mb-1">💰 Ahorro mensual estimado con automatización IA</div>
              <div className="text-4xl font-black text-emerald-400">
                {fmtCLP(rand(result.savingsMin, result.savingsMax))} <span className="text-lg font-normal text-slate-400">/mes</span>
              </div>
              <div className="text-xs text-slate-500 mt-2">Benchmarks del rubro {result.rubroName} en Chile · CPC Chile 2025</div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`🤖 Hola AigenciaLab! Completé la auditoría.\n\n📊 Score: ${result.score}/100 (${result.tier})\n🏢 Empresa: ${leadInfo.company||leadInfo.name} — ${result.rubroName}\n🌐 Web: ${leadInfo.url||'Sin sitio'}\n\n¿Cuándo podemos hablar?`)}`}
                 target="_blank" rel="noreferrer"
                 className="flex items-center justify-center gap-2 w-full bg-[#25d366] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all">
                💬 Agendar Mejora IA por WhatsApp
              </a>
              <button onClick={() => window.print()}
                className="w-full border border-white/10 text-slate-300 py-3 rounded-xl font-medium hover:border-white/20 transition-colors">
                🖨️ Descargar Reporte PDF
              </button>
              <button onClick={() => { setStep('form'); setResult(null); setProgress(0); setMsg(ANALYZING_MSGS[0]) }}
                className="w-full text-slate-500 text-sm py-2 hover:text-slate-300 transition-colors">
                ← Analizar otro sitio
              </button>
            </div>

            <p className="text-center text-xs text-slate-600 pb-8">🔒 Ley N°21.663 · Ley N°19.628 · AigenciaLab.cl</p>
          </div>
        )}
      </div>
    </div>
  )
}
