'use client'
import { useState } from 'react'
import Link from 'next/link'

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  company: string; rubro: string; contact_name: string; whatsapp: string
  email: string; url: string; plan: string
  faqs: { q: string; a: string }[]
  wa_phone_id: string; wa_token: string
  agent_name: string; tone: string; escalate_keyword: string; welcome_msg: string
  channels: { whatsapp: boolean; web: boolean; email: boolean }
}

const RUBROS = [
  'ecommerce_moda','ecommerce_retail','clinica','inmobiliaria',
  'courier','restaurante','educacion','servicios','manufactura','otro'
]

const RUBRO_LABELS: Record<string,string> = {
  ecommerce_moda:'Ecommerce Moda',ecommerce_retail:'Retail General',clinica:'Clínica/Salud',
  inmobiliaria:'Inmobiliaria',courier:'Courier/Logística',restaurante:'Restaurante/Food',
  educacion:'Educación',servicios:'Servicios Profesionales',manufactura:'Manufactura',otro:'Otro'
}

export default function OnboardingPage() {
  const [step,    setStep]    = useState<Step>(1)
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')
  const [csvRows, setCsvRows] = useState<{name:string;price:string;stock:string}[]>([])

  const [form, setForm] = useState<FormData>({
    company:'', rubro:'', contact_name:'', whatsapp:'', email:'', url:'', plan:'starter',
    faqs:[{ q:'', a:'' }],
    wa_phone_id:'', wa_token:'',
    agent_name:'Nova', tone:'amigable', escalate_keyword:'humano', welcome_msg:'',
    channels:{ whatsapp:false, web:false, email:false }
  })

  const update = (field: keyof FormData, value: unknown) => setForm(f=>({...f,[field]:value}))

  // CSV parse
  function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const lines = (ev.target?.result as string).split('\n').filter(Boolean)
      const rows = lines.slice(0).map(l => {
        const [name='',price='',stock=''] = l.split(',')
        return { name:name.trim(), price:price.trim(), stock:stock.trim() }
      }).filter(r=>r.name)
      setCsvRows(rows)
    }
    reader.readAsText(file)
  }

  async function handleSave() {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/clients', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          company:     form.company,
          rubro:       form.rubro,
          contact_name:form.contact_name,
          whatsapp:    form.whatsapp.startsWith('+') ? form.whatsapp : `+56${form.whatsapp.replace(/\D/g,'')}`,
          email:       form.email,
          url:         form.url,
          plan:        form.plan,
          faqs:        form.faqs.filter(f=>f.q&&f.a),
          products:    csvRows,
          channels:    form.channels,
          wa_phone_id: form.wa_phone_id || null,
          config: { agent_name:form.agent_name, tone:form.tone, escalate_keyword:form.escalate_keyword, welcome_msg:form.welcome_msg }
        })
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
      setSuccess(true)
    } catch(err:unknown) { setError((err as Error).message) }
    finally { setSaving(false) }
  }

  const steps = [
    { n:1, label:'Datos empresa' },
    { n:2, label:'Agente IA' },
    { n:3, label:'WhatsApp' },
    { n:4, label:'Catálogo & FAQs' },
    { n:5, label:'Activar' },
  ]

  if (success) return (
    <div className="p-8 max-w-xl mx-auto text-center">
      <div className="glass rounded-2xl p-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2 text-gradient">¡Cliente Activado!</h2>
        <p className="text-slate-400 mb-6">El cliente fue guardado en Supabase. Se envió email de bienvenida si Resend está configurado.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard/clients" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-500 transition-colors">
            Ver Clientes →
          </Link>
          <button onClick={()=>{setSuccess(false);setStep(1)}} className="border border-white/10 text-slate-300 px-6 py-3 rounded-xl hover:border-white/20 transition-colors">
            Activar Otro
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">⚙️ Activar Nuevo Cliente</h1>
        <p className="text-slate-500 text-sm">Proceso completo en menos de 2 horas · Datos guardados en Supabase</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {steps.map((s,i)=>(
          <div key={s.n} className="flex items-center gap-2 shrink-0">
            <button onClick={()=>setStep(s.n as Step)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${step===s.n?'bg-blue-600 text-white':'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
              <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${step>s.n?'bg-emerald-500 text-white':step===s.n?'bg-white text-blue-600':'bg-white/10 text-slate-600'}`}>
                {step>s.n?'✓':s.n}
              </span>
              {s.label}
            </button>
            {i<steps.length-1 && <div className="w-4 h-px bg-white/10"/>}
          </div>
        ))}
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-3 mb-5 text-sm">{error}</div>}

      <div className="glass rounded-2xl p-8">

        {/* STEP 1 */}
        {step===1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold mb-4">🏢 Datos de la Empresa</h2>
            {[
              { label:'Empresa *',     name:'company',      type:'text',  ph:'RetailSur SpA', req:true  },
              { label:'URL sitio web', name:'url',          type:'url',   ph:'https://retailsur.cl', req:false },
              { label:'Nombre contacto *', name:'contact_name', type:'text', ph:'María González', req:true },
              { label:'WhatsApp *',    name:'whatsapp',     type:'tel',   ph:'912345678', req:true  },
              { label:'Email',         name:'email',        type:'email', ph:'maria@retailsur.cl', req:false },
            ].map(f=>(
              <div key={f.name}>
                <label className="block text-sm text-slate-400 mb-1.5">{f.label}</label>
                <input type={f.type} required={f.req} placeholder={f.ph}
                  value={form[f.name as keyof FormData] as string}
                  onChange={e=>update(f.name as keyof FormData, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors text-sm"/>
              </div>
            ))}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Rubro *</label>
              <select value={form.rubro} onChange={e=>update('rubro',e.target.value)} required
                className="w-full bg-[#0d0f1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm">
                <option value="">Seleccionar...</option>
                {RUBROS.map(r=><option key={r} value={r}>{RUBRO_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Plan</label>
              <div className="flex gap-3">
                {[['starter','STARTER'],['advanced','ADVANCED'],['enterprise','ENTERPRISE']].map(([val,lbl])=>(
                  <button key={val} onClick={()=>update('plan',val)} type="button"
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.plan===val?'border-blue-500 bg-blue-600/20 text-blue-300':'border-white/10 text-slate-400 hover:border-white/20'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step===2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold mb-4">🤖 Configuración del Agente IA</h2>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Nombre del agente</label>
              <input type="text" placeholder="Nova" value={form.agent_name} onChange={e=>update('agent_name',e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"/>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Tono de voz</label>
              <div className="flex gap-3">
                {[['amigable','😊 Amigable'],['formal','💼 Formal'],['tecnico','🔧 Técnico']].map(([val,lbl])=>(
                  <button key={val} onClick={()=>update('tone',val)} type="button"
                    className={`flex-1 py-2.5 rounded-xl border text-sm transition-all ${form.tone===val?'border-blue-500 bg-blue-600/20 text-blue-300':'border-white/10 text-slate-400 hover:border-white/20'}`}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Keyword para escalar a humano</label>
              <input type="text" placeholder="humano" value={form.escalate_keyword} onChange={e=>update('escalate_keyword',e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"/>
              <p className="text-xs text-slate-600 mt-1">Cuando el cliente escriba esta palabra, se escala la conversación</p>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Mensaje de bienvenida</label>
              <textarea placeholder={`¡Hola! Soy ${form.agent_name}, el asistente de ${form.company||'tu empresa'}. ¿En qué puedo ayudarte? 😊`}
                value={form.welcome_msg} onChange={e=>update('welcome_msg',e.target.value)} rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm resize-none"/>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Canales activos</label>
              <div className="flex gap-3">
                {[['whatsapp','💬 WhatsApp'],['web','🌐 Web Chat'],['email','📧 Email']].map(([ch,lbl])=>(
                  <label key={ch} className={`flex-1 text-center py-2.5 rounded-xl border text-sm cursor-pointer transition-all ${form.channels[ch as keyof typeof form.channels]?'border-emerald-500 bg-emerald-600/20 text-emerald-300':'border-white/10 text-slate-400'}`}>
                    <input type="checkbox" className="sr-only"
                      checked={form.channels[ch as keyof typeof form.channels]}
                      onChange={e=>update('channels',{...form.channels,[ch]:e.target.checked})}/>
                    {lbl}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step===3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold mb-2">💬 WhatsApp Business API</h2>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-sm text-blue-300">
              <p className="font-semibold mb-1">¿Cómo obtener estas credenciales?</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-blue-200/80">
                <li>Ir a <strong>developers.facebook.com</strong> → Crear App → WhatsApp</li>
                <li>En "WhatsApp → API Setup": copiar <strong>Phone Number ID</strong></li>
                <li>Generar <strong>Temporary Access Token</strong> (o token permanente)</li>
                <li>Configurar Webhook URL: <code className="text-xs bg-blue-900/30 px-1 rounded">https://aigencialab.cl/api/whatsapp/webhook</code></li>
                <li>Verify Token: <code className="text-xs bg-blue-900/30 px-1 rounded">aigencialab_wh_2024</code></li>
              </ol>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Phone Number ID</label>
              <input type="text" placeholder="123456789012345" value={form.wa_phone_id} onChange={e=>update('wa_phone_id',e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono text-sm"/>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Access Token</label>
              <input type="password" placeholder="EAAGxxxxxxxxxxxx..." value={form.wa_token} onChange={e=>update('wa_token',e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono text-sm"/>
              <p className="text-xs text-slate-600 mt-1">Guardado cifrado en Supabase. Nunca expuesto al cliente.</p>
            </div>
            {!form.channels.whatsapp && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-xs text-yellow-300">
                ⚠ Canal WhatsApp no activado en paso 2. Puedes omitir este paso si el cliente no usa WhatsApp aún.
              </div>
            )}
          </div>
        )}

        {/* STEP 4 */}
        {step===4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold mb-2">📚 Catálogo & FAQs</h2>
            {/* FAQs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm text-slate-400">Preguntas Frecuentes</label>
                <button type="button" onClick={()=>update('faqs',[...form.faqs,{q:'',a:''}])}
                  className="text-xs text-blue-400 hover:underline">+ Agregar FAQ</button>
              </div>
              <div className="space-y-3">
                {form.faqs.map((faq,i)=>(
                  <div key={i} className="glass rounded-xl p-4 space-y-2">
                    <input type="text" placeholder={`Pregunta ${i+1}...`} value={faq.q}
                      onChange={e=>{const f=[...form.faqs];f[i]={...f[i],q:e.target.value};update('faqs',f)}}
                      className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"/>
                    <textarea placeholder="Respuesta..." value={faq.a} rows={2}
                      onChange={e=>{const f=[...form.faqs];f[i]={...f[i],a:e.target.value};update('faqs',f)}}
                      className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"/>
                    {form.faqs.length>1 && (
                      <button type="button" onClick={()=>update('faqs',form.faqs.filter((_,j)=>j!==i))}
                        className="text-xs text-red-400 hover:underline">Eliminar</button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CSV */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">Catálogo de productos (CSV opcional)</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-blue-500/30 transition-colors">
                <input type="file" accept=".csv" onChange={handleCSV} className="hidden" id="csvInput"/>
                <label htmlFor="csvInput" className="cursor-pointer">
                  <div className="text-2xl mb-2">📄</div>
                  <div className="text-sm text-slate-400">Click para subir CSV</div>
                  <div className="text-xs text-slate-600 mt-1">Formato: Nombre,Precio,Stock (sin encabezado)</div>
                </label>
              </div>
              {csvRows.length>0 && (
                <div className="mt-3 text-xs text-emerald-400">✓ {csvRows.length} productos cargados: {csvRows.slice(0,3).map(r=>r.name).join(', ')}{csvRows.length>3?'...':''}</div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step===5 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold mb-4">✅ Resumen y Activación</h2>
            <div className="space-y-3 text-sm">
              {[
                ['🏢 Empresa',  form.company],
                ['📋 Rubro',   RUBRO_LABELS[form.rubro] ?? form.rubro],
                ['👤 Contacto', form.contact_name],
                ['📱 WhatsApp', form.whatsapp],
                ['📧 Email',   form.email],
                ['🌐 URL',     form.url],
                ['📦 Plan',    form.plan.toUpperCase()],
                ['🤖 Agente',  `${form.agent_name} (${form.tone})`],
                ['💬 FAQs',    `${form.faqs.filter(f=>f.q).length} cargadas`],
                ['📦 Productos', `${csvRows.length} en catálogo`],
                ['📡 Canales', Object.entries(form.channels).filter(([,v])=>v).map(([k])=>k).join(', ') || 'Ninguno'],
              ].map(([k,v])=>(
                <div key={k} className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-slate-500">{k}</span>
                  <span className="text-slate-300 text-right max-w-xs truncate">{v||'—'}</span>
                </div>
              ))}
            </div>

            {!form.company && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300">⚠ Nombre de empresa obligatorio</div>}

            <button onClick={handleSave} disabled={saving||!form.company}
              className="w-full bg-gradient-to-r from-blue-600 to-violet-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50">
              {saving ? '⏳ Activando cliente...' : '🚀 Activar Cliente Ahora'}
            </button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
          <button disabled={step===1} onClick={()=>setStep(s=>(s-1) as Step)}
            className="px-5 py-2.5 border border-white/10 text-slate-400 rounded-xl hover:border-white/20 transition-colors disabled:opacity-30 text-sm">
            ← Anterior
          </button>
          {step<5 && (
            <button onClick={()=>setStep(s=>(s+1) as Step)}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors text-sm font-medium">
              Siguiente →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
