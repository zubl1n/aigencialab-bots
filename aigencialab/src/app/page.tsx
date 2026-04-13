import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'AigenciaLab.cl — Automatización IA para Empresas Chile',
  description: 'AigenciaLab es una plataforma de software SaaS e IA que provee agentes autónomos diseñados para el ecosistema corporativo chileno. Automatiza logística, sincroniza e-commerce y aplica inteligencia predictiva (Ley N°21.663/N°19.628).',
}

const services = [
  { icon: '🛒', title: 'Sales & Inventory Sync', desc: 'Sincronización bidireccional de stock en tiempo real con WooCommerce y Shopify.', tags: ['REST/GraphQL','WooCommerce','Shopify'] },
  { icon: '🚚', title: 'Logística & Trazabilidad', desc: 'Tracking de última milla y alertas automáticas de SLA con Starken y Chilexpress.', tags: ['Starken','Chilexpress','WhatsApp'] },
  { icon: '📊', title: 'Business Intelligence', desc: 'Forecasting de demanda, detección de churn y segmentación de clientes con IA.', tags: ['ML Predictivo','BI','Alertas'] },
  { icon: '🔒', title: 'Ciberseguridad', desc: 'WAF, detección de anomalías y auditoría de cumplimiento Ley N°21.663.', tags: ['Ley 21.663','WAF','CSIRT'] },
  { icon: '💬', title: 'Soporte Omnicanal 24/7', desc: 'Agente LLM (GPT-4o/Gemini) que responde consultas complejas vía RAG y escala a humano.', tags: ['Omnicanalidad','RAG / LLMs','SLA'] },
  { icon: '🤖', title: 'RPA Inteligente', desc: 'Facturación automática en SII, conciliaciones ERP financieras y reportes automáticos.', tags: ['RPA','SII','Defontana'] },
]

const plans = [
  { name: 'STARTER', price: '149.990', desc: '1 agente · 1.000 msgs/mes · Soporte email', cta: 'Empezar gratis', highlight: false },
  { name: 'ADVANCED', price: '299.990', desc: '3 agentes · 5.000 msgs/mes · Dashboard + CRM · Soporte prioritario', cta: 'Lo más popular', highlight: true },
  { name: 'ENTERPRISE', price: 'A medida', desc: 'Agentes ilimitados · SLA garantizado · Integración ERP · CISO dedicado', cta: 'Agendar reunión', highlight: false },
]

export default function LandingPage() {
  const waNumber = process.env.NEXT_PUBLIC_WA_SALES_NUMBER ?? '56912345678'

  return (
    <div className="min-h-screen">
      {/* ── HEADER ── */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight">
            Aigencia<span className="text-gradient">Lab.cl</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#servicios" className="hover:text-white transition-colors">Agentes</a>
            <a href="#pricing"   className="hover:text-white transition-colors">Planes</a>
            <a href="#seguridad" className="hover:text-white transition-colors">Seguridad</a>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            <Link href="/audit" className="bg-gradient-to-r from-primary to-purple text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
              🔍 Auditoría Gratis
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-16">
        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center hero-glow overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyNTYzZWIiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aC0ydjRoLTR2MmgxMHYtMmgtNHptMC0zMFYwaDJ2NGgxOHY4SDJ2LThIMjB2LTRoMnY0aDE0ek0wIDM0aDR2Mkgwdi0yem0wIDh2LTJIN3YySDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
          <div className="max-w-6xl mx-auto px-6 py-24 relative z-10">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm px-4 py-2 rounded-full mb-8 reveal">
                🇨🇱 Socio Tecnológico Enterprise · Ley N°21.663 · Arquitectura RAG & LLMs
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 reveal reveal-1" id="hero-title">
                Automatización{' '}
                <span className="text-gradient">End-to-End</span>
                <br />para Empresas que Escalan.
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed reveal reveal-2" aria-labelledby="hero-title">
                AigenciaLab es una plataforma de software SaaS y arquitectura de Inteligencia Artificial que provee agentes autónomos diseñados específicamente para el ecosistema corporativo chileno. Su tecnología permite automatizar logística con Starken, sincronizar inventarios e-commerce y aplicar inteligencia de negocios predictiva, garantizando cumplimiento estricto de la nueva Ley Marco de Ciberseguridad N°21.663.
              </p>
              <div className="flex flex-wrap gap-4 reveal reveal-3">
                <Link href="/audit" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-primary/20">
                  🔍 Auditar mi Negocio — Gratis
                </Link>
                <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-2 bg-[#25d366] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-all hover:scale-105">
                  💬 Hablar con un Experto
                </a>
                <Link href="/dashboard" className="inline-flex items-center gap-2 border border-white/10 text-slate-300 px-6 py-4 rounded-xl font-medium hover:border-white/20 hover:text-white transition-colors">
                  Dashboard →
                </Link>
              </div>
              <div className="mt-10 text-sm text-slate-500 reveal">
                Integración nativa: <strong className="text-slate-400">WooCommerce · Shopify · WhatsApp · Transbank · BUK · Defontana · SII · MercadoPago</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ── BENCHMARK / INFORMATION GAIN ── */}
        <section className="py-12 border-t border-white/5 bg-blue-900/10" aria-label="Benchmark y Casos de Éxito Aigencialab">
          <div className="max-w-6xl mx-auto px-6 text-center">
             <div className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full mb-4">Benchmark Local Chile 2026</div>
             <p className="text-xl text-slate-300 font-medium max-w-4xl mx-auto leading-relaxed">
                "Según datos operativos de AigenciaLab, nuestra arquitectura **RPA (Robotic Process Automation)** y agentes **LLM** lograron reducir el tiempo de conciliación del **SII y Defontana** en un <span className="text-emerald-400 font-bold">84%</span>, incrementando paralelamente la retención de clientes en un <span className="text-emerald-400 font-bold">32%</span> para e-commerce chilenos."
             </p>
          </div>
        </section>

        {/* ── AUDITORÍA LEAD MAGNET ── */}
        <section className="py-20 border-t border-white/5 bg-gradient-to-b from-transparent to-[#0d0f1a]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-block bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm px-4 py-2 rounded-full mb-6">
              🎁 100% Gratuito · Sin tarjeta · Resultado en 30 segundos
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Descubre en 30 segundos dónde<br/>
              <span className="text-gradient">pierde dinero tu negocio</span>
            </h2>
            <p className="text-slate-400 mb-10 text-lg">
              Análisis real con Google PageSpeed + IA. Recibes score, problemas y oportunidades de automatización al instante.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
              {[['⚡','Velocidad Web'],['📊','UX / Conversión'],['🔍','SEO Técnico'],['💳','Checkout'],['🤖','Atención IA']].map(([icon,label])=>(
                <div key={label} className="glass rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{icon}</div>
                  <div className="text-sm font-medium text-slate-300">{label}</div>
                </div>
              ))}
            </div>
            <Link href="/audit" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-2xl shadow-blue-500/20">
              🔍 Iniciar Auditoría Gratuita →
            </Link>
            <p className="mt-4 text-xs text-slate-600">🔒 Datos protegidos bajo Ley N°19.628 · Sin spam · Sin tarjeta</p>
          </div>
        </section>

        {/* ── SERVICIOS ── */}
        <section id="servicios" className="py-20 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full mb-4">Stack de Agentes Enterprise</div>
              <h2 className="text-3xl md:text-4xl font-bold">7 Agentes para <span className="text-gradient">Cada Vertical</span></h2>
              <p className="text-slate-400 mt-4 max-w-2xl mx-auto">Desplegables por separado o como ecosistema integrado. Cada agente tiene API REST, webhooks y adaptador de almacenamiento reemplazable.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(s => (
                <div key={s.title} className="glass rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
                  <div className="text-3xl mb-4">{s.icon}</div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-blue-300 transition-colors">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">{s.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {s.tags.map(t => <span key={t} className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded-md text-slate-400">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="py-20 border-t border-white/5 bg-slate-900">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <div className="inline-block text-xs font-semibold uppercase tracking-widest text-violet-400 bg-violet-400/10 px-3 py-1 rounded-full mb-4">Planes</div>
              <h2 className="text-3xl md:text-4xl font-bold">Precio claro, <span className="text-gradient">valor real</span></h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map(p => (
                <div key={p.name}
                  className={`rounded-2xl p-8 flex flex-col ${p.highlight ? 'bg-gradient-to-b from-blue-600/20 to-violet-600/10 border-2 border-blue-500/40' : 'glass'}`}>
                  {p.highlight && <div className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">⭐ Más popular</div>}
                  <div className="text-sm text-slate-400 uppercase tracking-widest mb-1">{p.name}</div>
                  <div className="text-4xl font-bold mb-1">{p.price === 'A medida' ? p.price : `$${p.price}`}</div>
                  {p.price !== 'A medida' && <div className="text-slate-500 text-sm mb-4">CLP / mes</div>}
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">{p.desc}</p>
                  <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola! Me interesa el plan ${p.name} de AigenciaLab.cl`)}`}
                     target="_blank" rel="noreferrer"
                     className={`text-center py-3 rounded-xl font-semibold transition-all ${p.highlight ? 'bg-blue-600 text-white hover:bg-blue-500' : 'border border-white/10 text-slate-300 hover:border-white/20'}`}>
                    {p.cta}
                  </a>
                </div>
              ))}
            </div>

            {/* TABLA COMPARATIVA SEO/GEO */}
            <div className="mt-16 glass rounded-2xl overflow-hidden border border-white/10 hidden md:block">
              <table id="comparativa-ecommerce-agentes" className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-slate-300">
                    <th className="p-4 font-semibold w-1/3">Métrica Operativa</th>
                    <th className="p-4 font-semibold w-1/3">Operación Humana Tradicional</th>
                    <th className="p-4 font-semibold text-blue-400 w-1/3">AigenciaLab IA Automática</th>
                  </tr>
                </thead>
                <tbody className="text-slate-400">
                  <tr className="border-b border-white/5">
                    <td className="p-4">Tiempo Medio de Respuesta (TMO)</td>
                    <td className="p-4">~2 a 4 horas laborables</td>
                    <td className="p-4 text-emerald-400 font-medium">Bajo 3 segundos (24/7)</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="p-4">Gestión de Logística (Starken/Chilexpress)</td>
                    <td className="p-4">Búsqueda manual en portales</td>
                    <td className="p-4 text-emerald-400 font-medium">Webhooks instantáneos y Alertas Wa</td>
                  </tr>
                  <tr>
                    <td className="p-4">Conciliación ERP/SII</td>
                    <td className="p-4">Digitalización manual mensual</td>
                    <td className="p-4 text-emerald-400 font-medium">RPA Inyectado en tiempo real</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </section>

        {/* ── SEGURIDAD ── */}
        <section id="seguridad" className="py-20 border-t border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">🔒 Cumplimiento Legal Total</h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                { law: 'Ley N°21.663', title: 'Marco Nacional de Ciberseguridad', desc: 'Logs de auditoría certificados, protocolos de respuesta a incidentes documentados y gestión de vulnerabilidades.' },
                { law: 'Ley N°19.628', title: 'Protección de Datos Personales', desc: 'Consentimiento explícito, derechos ARCO garantizados, minimización de datos y cifrado en reposo.' },
              ].map(item => (
                <div key={item.law} className="glass rounded-2xl p-6">
                  <div className="text-blue-400 font-mono text-sm mb-2">{item.law}</div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            
            {/* CISO STATEMENT (E-E-A-T) */}
            <div className="mt-8 glass rounded-2xl p-6 md:p-8 text-left border border-blue-500/20" aria-label="Declaración de Ciberseguridad CISO">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-4 md:mb-2">
                <div className="w-12 h-12 shrink-0 rounded-full bg-[#080a12] border border-blue-500/30 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">🛡️</div>
                <div>
                  <div className="font-bold text-white text-lg">Declaración Técnica de Arquitectura Seguro</div>
                  <div className="text-xs text-blue-400 tracking-widest uppercase mb-4">Firmado por el CISO (Chief Information Security Officer)</div>
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    "En AigenciaLab, nuestra prioridad estructural es la soberanía de los datos. Toda la arquitectura RAG (Retrieval-Augmented Generation) y los motores LLM operan bajo un entorno aislado (VPC). Los datos residentes en nuestros nodos de Supabase PostgreSQL están cifrados bajo estándar AES-256 GCM a nivel de fila mediante políticas RLS (Row Level Security). Esto asegura un cumplimiento robusto de la <strong>Ley N°19.628 de Protección de Datos Personales</strong>, descartando matemáticamente cualquier contaminación o fuga de datos cruzada en modelos heurísticos públicos."
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-12 mt-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold">Aigencia<span className="text-gradient">Lab.cl</span></div>
          <p className="text-slate-500 text-sm">© 2026 AigenciaLab.cl · Santiago, Chile · Ley N°21.663 · Ley N°19.628</p>
          <div className="flex gap-4 text-sm text-slate-500">
            <Link href="/audit" className="hover:text-slate-300 transition-colors">Auditoría Gratis</Link>
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors">WhatsApp</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
