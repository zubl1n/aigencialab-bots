'use client';

import React, { useState } from 'react';
import { Database, Server, Cpu, Globe, Lock, Code2, Bug, GitCommit, Key, ShieldCheck, Zap, Bot, Layers } from 'lucide-react';

export default function EsquemaOffPage() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'database' | 'stack' | 'bugs'>('architecture');

  const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 ${
        activeTab === id 
          ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' 
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 font-['Inter'] selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">System Operational</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
              <Server className="w-8 h-8 text-indigo-500" />
              AIgenciaLab <span className="text-slate-500 font-light">| Systems Architecture</span>
            </h1>
            <p className="mt-2 text-slate-400 text-sm max-w-2xl">
              Documentación confidencial nivel de ingeniería (`esquema_off`). Contiene el diagrama de flujo operativo del SaaS, aprovisionamiento automático (tenant bootstrapping), topología del ecosistema y control de excepciones.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-md font-mono text-xs text-slate-300">
              <GitCommit className="w-3 h-3" /> main-branch@a9f82c
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md font-mono text-xs text-indigo-300">
              <Lock className="w-3 h-3" /> RLS Enabled & Active
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto no-scrollbar border-t border-white/5 mt-4">
          <TabButton id="architecture" label="Arquitectura & SaaS Flow" icon={Layers} />
          <TabButton id="database" label="Auth, Triggers & Tenants" icon={Database} />
          <TabButton id="stack" label="Tech Stack" icon={Code2} />
          <TabButton id="bugs" label="Bugs & Control de Errores" icon={Bug} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        
        {/* TAB 1: ARCHITECTURE & SAAS FLOW */}
        {activeTab === 'architecture' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Globe className="w-6 h-6 text-blue-400" />
                Topología del Ecosistema AIgenciaLab
              </h2>
              
              {/* CSS Flow Diagram */}
              <div className="bg-[#0f172a] p-8 rounded-2xl border border-white/10 overflow-x-auto">
                <div className="min-w-[900px] flex flex-col items-center gap-8 relative pb-8">
                  
                  {/* Top Layer: Clients / External */}
                  <div className="flex gap-12 w-full justify-center">
                    <div className="w-64 bg-slate-800/50 border border-slate-700 p-4 rounded-xl text-center shadow-lg relative z-10">
                      <div className="text-blue-400 mb-2 flex justify-center"><Globe className="w-6 h-6" /></div>
                      <h3 className="font-bold text-white text-sm">Capa Cliente (Usuarios Finales)</h3>
                      <p className="text-xs text-slate-400 mt-2">Interactúan con el Widget JS en la web del negocio cliente.</p>
                    </div>
                  </div>

                  {/* V-Line */}
                  <div className="w-0.5 h-8 bg-slate-700 absolute top-[100px]" />

                  {/* Edge / Middleware Layer */}
                  <div className="flex gap-12 w-full justify-center">
                    <div className="w-80 bg-indigo-900/30 border border-indigo-500/30 p-4 rounded-xl text-center shadow-lg relative z-10 backdrop-blur-sm">
                      <div className="text-indigo-400 mb-2 flex justify-center"><Zap className="w-6 h-6" /></div>
                      <h3 className="font-bold text-white text-sm">Vercel Edge Network / Middleware</h3>
                      <p className="text-xs text-slate-400 mt-2">Routeo de API, validación CORS de la llave API, Next.js Rewrites para evadir cache del widget.</p>
                    </div>
                  </div>

                  {/* V-Line */}
                  <div className="w-0.5 h-8 bg-slate-700 absolute top-[216px]" />

                  {/* Next.js Core Layer */}
                  <div className="flex gap-8 w-full justify-center relative z-10">
                    <div className="w-72 bg-emerald-900/20 border border-emerald-500/20 p-5 rounded-xl">
                      <div className="text-emerald-400 mb-2 flex justify-center"><Server className="w-6 h-6" /></div>
                      <h3 className="font-bold text-white text-center text-sm">API Backend (Next.js 16)</h3>
                      <ul className="text-xs text-slate-400 mt-3 space-y-2 list-disc list-inside">
                        <li>Route Handlers (`/api/chat`)</li>
                        <li>Gestión de Streaming AI</li>
                        <li>Verificación de Suscripciones</li>
                      </ul>
                    </div>

                    <div className="w-72 bg-purple-900/20 border border-purple-500/20 p-5 rounded-xl">
                      <div className="text-purple-400 mb-2 flex justify-center"><Layers className="w-6 h-6" /></div>
                      <h3 className="font-bold text-white text-center text-sm">Dashboards (Admin / Client)</h3>
                      <ul className="text-xs text-slate-400 mt-3 space-y-2 list-disc list-inside">
                        <li>SSR + Client Components</li>
                        <li>WebSockets (Real-time charts)</li>
                        <li>Gestión de Prompts & Leads</li>
                      </ul>
                    </div>
                  </div>

                  {/* V-Lines to DB and LLM */}
                  <svg className="absolute top-[370px] w-[300px] h-12 z-0" style={{ left: 'calc(50% - 150px)' }}>
                    <path d="M 150 0 L 150 20 M 150 20 L 0 20 L 0 48 M 150 20 L 300 20 L 300 48" fill="transparent" stroke="#334155" strokeWidth="2" strokeLinejoin="round" />
                  </svg>

                  {/* Bottom Layer: Data & LLM */}
                  <div className="flex gap-20 w-full justify-center relative z-10 pt-4">
                    <div className="w-72 bg-blue-900/20 border border-blue-500/30 p-5 rounded-xl">
                      <div className="text-blue-400 mb-2 flex justify-center"><Database className="w-6 h-6" /></div>
                      <h3 className="font-bold text-white text-center text-sm">Supabase (PostgreSQL)</h3>
                      <ul className="text-xs text-slate-400 mt-3 space-y-2">
                        <li className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400"/> Auth & RLS Tenancy</li>
                        <li className="flex items-center gap-1"><Key className="w-3 h-3 text-amber-400"/> API Keys DB</li>
                        <li className="flex items-center gap-1"><Database className="w-3 h-3 text-blue-400"/> Vector DB & Relacional</li>
                      </ul>
                    </div>

                    <div className="w-72 bg-orange-900/20 border border-orange-500/30 p-5 rounded-xl">
                      <div className="text-orange-400 mb-2 flex justify-center"><Bot className="w-6 h-6" /></div>
                      <h3 className="font-bold text-white text-center text-sm">Capa de Inferencia (LLMs)</h3>
                      <ul className="text-xs text-slate-400 mt-3 space-y-2 list-disc list-inside">
                        <li>OpenAI (GPT-4o)</li>
                        <li>Groq (Llama-3 para ultra-low latency)</li>
                        <li>Motor Multi-Rubro Funcional</li>
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </section>

          </div>
        )}

        {/* TAB 2: DATABASE, AUTH & TENANTS */}
        {activeTab === 'database' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Autenticacion */}
              <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 lg:col-span-1">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Key className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">1. Autenticación y Tenant Creation</h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  Cada vez que un negocio se registra, la autenticación principal es delegada a <strong>Supabase Auth (`auth.users`)</strong>.
                </p>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-emerald-400 border border-white/5 mb-4">
                  Trigger: <span className="text-white">handle_new_auth_user()</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  En el milisegundo en que se consolida el usuario, este trigger intercepta el evento y crea automáticamente una entidad en nuestra tabla pública `clients`. Este registro de cliente actúa como la "cuenta maestra" o <strong>Tenant ID</strong> de la que colgarán todos los datos del negocio, aislando la arquitectura.
                </p>
              </div>

              {/* Bootstrapping */}
              <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8 lg:col-span-2">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">2. Auto-Aprovisionamiento (Bootstrapping)</h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                  Para lograr una experiencia <span className="text-white font-semibold">Zero-Touch</span> (que el cliente tenga el software listo desde el segundo cero), ejecutamos una arquitectura orientada a eventos en base de datos.
                </p>
                <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-emerald-400 border border-white/5 mb-6">
                  Trigger: <span className="text-white">handle_new_client_bootstrap()</span>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-white">1</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Generación de API Keys</h4>
                      <p className="text-xs text-slate-400 mt-1">Inserta un `api_key` cifrado y único en `api_keys`. Esta clave se incrusta en el widget del cliente para asegurar ruteo correcto al Agente.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-white">2</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Configuración Base del Agente</h4>
                      <p className="text-xs text-slate-400 mt-1">Crea la instancia en `bot_configs` asignando comportamiento, roles predefinidos y modelo (ej. Llama-3).</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-white">3</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Billing Profile & Suscripción Inicial</h4>
                      <p className="text-xs text-slate-400 mt-1">Inyecta a `subscriptions` el plan 'Starter' y activa el Trial de 14 días con timestamps UTC.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-white">4</div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Progresión de Onboarding</h4>
                      <p className="text-xs text-slate-400 mt-1">Se inicializa `onboarding_progress` para controlar y guiar el paso a paso dentro de su client dashboard.</p>
                    </div>
                  </li>
                </ul>
              </div>

            </section>

            {/* RLS */}
            <section className="bg-gradient-to-r from-emerald-900/20 to-[#0f172a] border border-emerald-500/20 rounded-2xl p-8 relative overflow-hidden">
              <ShieldCheck className="absolute -right-10 -bottom-10 w-64 h-64 text-emerald-500/5 rotate-12" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full font-mono text-xs text-emerald-300 mb-4">
                  <ShieldCheck className="w-3 h-3" /> Security Layer
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">3. Aislamiento de Datos Criptográfico (RLS)</h3>
                <p className="text-sm text-slate-300 max-w-3xl leading-relaxed mb-6">
                  Todo el clúster de base de datos posee <strong>Row Level Security (RLS)</strong> forzado. Esto garantiza que bajo ninguna vulnerabilidad en la API se filtren datos entre negocios concurrentes en el entorno Multi-Tenant SaaS.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['leads (Contactos capturados)', 'conversations (Historial chats)', 'bot_configs (Prompts/Modelo)', 'api_keys (Llaves seguridad)'].map((tabla) => (
                    <div key={tabla} className="bg-black/40 border border-emerald-500/10 p-4 rounded-xl">
                      <div className="font-mono text-xs text-emerald-400 mb-2">{tabla}</div>
                      <p className="text-xs text-slate-500">Posee la restricción mandatoria en la columna <code className="text-slate-300 bg-white/5 px-1 rounded">client_id</code>.</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

          </div>
        )}

        {/* TAB 3: TECH STACK */}
        {activeTab === 'stack' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Frontend */}
              <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-white/10 flex items-center justify-between">
                  Frontend & Client
                  <Globe className="w-5 h-5 text-indigo-400" />
                </h3>
                <ul className="space-y-4">
                  <li>
                    <div className="text-sm font-bold text-slate-200">Next.js 16.2.3 (App Router)</div>
                    <div className="text-xs text-slate-500 mt-1">Renderizado SSR/SSG con Turbopack. Manejo nativo de layouts y server components.</div>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-slate-200">React 19.2.4</div>
                    <div className="text-xs text-slate-500 mt-1">Concurrencia, Server Actions y hooks experimentales.</div>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-slate-200">Tailwind CSS v4 & PostCSS</div>
                    <div className="text-xs text-slate-500 mt-1">Estilización JIT, variables oklch(), y dark-mode nativo. Diseño premium Glassmorphism.</div>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-slate-200">UI Libraries</div>
                    <div className="text-xs text-slate-500 mt-1">`lucide-react` (iconos), `recharts` (gráficos SVG en Dashboards), `@xyflow/react` (Nodos visuales).</div>
                  </li>
                </ul>
              </div>

              {/* Backend & Admin */}
              <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-white/10 flex items-center justify-between">
                  Backend & Infra
                  <Server className="w-5 h-5 text-emerald-400" />
                </h3>
                <ul className="space-y-4">
                  <li>
                    <div className="text-sm font-bold text-slate-200">Supabase (PostgreSQL)</div>
                    <div className="text-xs text-slate-500 mt-1">Base de datos relacional (pgvector suportado), Edge Functions, Triggers SQL nativos.</div>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-slate-200">Supabase Auth & SSR</div>
                    <div className="text-xs text-slate-500 mt-1">`@supabase/ssr` para manejo de cookies securizadas y sesiones en Server Components.</div>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-slate-200">Vercel Serverless</div>
                    <div className="text-xs text-slate-500 mt-1">Ejecución de Route Handlers `/api` de manera escalable y auto-provisionada globalmente.</div>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-slate-200">LLM SDKs</div>
                    <div className="text-xs text-slate-500 mt-1">`openai` package nativo para orquestación de LLMs, parseo de tokens y system prompts.</div>
                  </li>
                </ul>
              </div>

              {/* Programacion / Dev / DevOps */}
              <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-8">
                <h3 className="text-lg font-bold text-white mb-6 pb-4 border-b border-white/10 flex items-center justify-between">
                  DevOps & Utils
                  <Code2 className="w-5 h-5 text-amber-400" />
                </h3>
                <ul className="space-y-4">
                  <li>
                    <div className="text-sm font-bold text-slate-200">Zod (v4.3.6)</div>
                    <div className="text-xs text-slate-500 mt-1">Validación matemática de esquemas (Schema Validation), type-safety estricta en mutaciones API.</div>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-slate-200">Vercel Deployment</div>
                    <div className="text-xs text-slate-500 mt-1">Edge Caching dinámico, Alias resolution (`aigencialab.cl`), Git hooks CI/CD.</div>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-slate-200">Resend (v6.10.0)</div>
                    <div className="text-xs text-slate-500 mt-1">API transaccional para envíos de correo críticos (recuperaciones, onboarding).</div>
                  </li>
                  <li>
                    <div className="text-sm font-bold text-slate-200">Typescript (Strict)</div>
                    <div className="text-xs text-slate-500 mt-1">Compilación estricta. Entorno gestionado mediante ESLint 9 + Next Config.</div>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: BUGS & ERRORS */}
        {activeTab === 'bugs' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                <Bug className="w-6 h-6 text-red-400" />
                Registro Histórico de Control (Troubleshooting)
              </h2>
              <p className="text-sm text-slate-400">Documentación forense de bugs de alta prioridad abordados en el ecosistema, causas raíz y metodologías de mitigación aplicadas.</p>
            </div>

            <div className="space-y-4">
              
              {/* Bug 1 */}
              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold rounded">SOLUCIONADO</span>
                    <h4 className="text-white font-bold text-lg">Caché Agresivo en Widget Vercel</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Mod: Frontend/Widget</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Causa Raíz / Error</h5>
                    <p className="text-sm text-slate-300">Vercel aplica un CDN caching inmutable agresivo en los archivos compilados del App Router. Las actualizaciones al código del chatbot widget no llegaban a los dominios de los clientes debido a validaciones de Hashing que fallaban en el decode de caracteres (Character Encoding Hashing Issues).</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Solución Técnica Aplicada</h5>
                    <p className="text-sm text-emerald-300/80">Re-arquitectura total del sistema de entrega del Widget mediante <strong>Next.js Rewrites</strong> en `next.config.ts`, saltándose el edge cache local y enviando handlers con headers `Cache-Control: no-store`. Se transicionó de bindings inline a `addEventListener`.</p>
                  </div>
                </div>
              </div>

              {/* Bug 2 */}
              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold rounded">SOLUCIONADO</span>
                    <h4 className="text-white font-bold text-lg">Parser de Color oklch() / lab() PDF Export</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Mod: App/Tarjetas</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Causa Raíz / Error</h5>
                    <div className="bg-black/50 p-2 rounded text-red-400 font-mono text-xs mb-2">Attempting to parse an unsupported color function "lab"</div>
                    <p className="text-sm text-slate-300">La librería `html2canvas` encargada de generar la exportación a PDF para las tarjetas de presentación fallaba en render time. El problema residía en que Tailwind v4 utiliza variables de color modernas (`oklch()`, `lab()`) de CSS Level 4 que el parser AST en JS de html2canvas no entendía.</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Solución Técnica Aplicada</h5>
                    <p className="text-sm text-emerald-300/80">Reemplazo de la biblioteca obsoleta por `html-to-image`, la cual evita un parser interno y renderiza inyectando los nodos directamente a un `SVG foreignObject`. El navegador procesa los colores modernos nativamente, resolviendo el crash completo.</p>
                  </div>
                </div>
              </div>

              {/* Bug 3 */}
              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold rounded">SOLUCIONADO</span>
                    <h4 className="text-white font-bold text-lg">Esquema Multi-Rubro Dinámico DB Sync</h4>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">Mod: Database/Core</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Causa Raíz / Error</h5>
                    <p className="text-sm text-slate-300">Durante la transición a un entorno SaaS "Multi-Tenant Multi-Rubro", la inserción de nuevos negocios demo colisionaba con los esquemas fijos preestablecidos de Supabase, impidiendo inicializar perfiles comerciales (ej. Automotoras vía WhatsApp) por restricciones de Foreing Keys estrictas.</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Solución Técnica Aplicada</h5>
                    <p className="text-sm text-emerald-300/80">Se generaron las migraciones SQL correspondientes (`MIGRATION_V3_PLAN_SYSTEM.sql` y `CRITICAL_FIXES.sql`) que permitieron la flexibilidad del modelo relacional. Se incorporó Groq Function Calling para ruteo semántico al vuelo, eliminando tablas rígidas.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
