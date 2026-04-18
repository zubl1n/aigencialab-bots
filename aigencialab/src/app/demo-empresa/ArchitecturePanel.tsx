'use client';

import { useState, useEffect, useRef } from 'react';

/** Real API key for demo-empresa bot (QA Client) */
const DEMO_API_KEY = 'agl_d9862b5f4d3b986babcad9d17797c684e3c8b557c3689f3a';
const API_CHAT     = '/api/chat';
const CLIENT_ID    = '2d4bb7f8-b103-4d01-8fbe-7712a61aae3e';

type Tab = 'bot' | 'client' | 'admin';

interface Msg { role: 'user' | 'bot'; text: string; ts: string }
interface ContextSnap {
  company: string; bot_name: string; model: string; language: string;
  temperature: number; max_tokens: number; system_prompt_source: string;
  system_prompt: string; faqs_count: number; context_token_estimate: number;
  faqs: { q: string; a: string }[];
}
interface ConvRow { id: string; contact_name: string; status: string; channel: string; created_at: string }
interface LeadRow { id: string; name: string; email: string; phone: string; created_at: string; source: string }

export function ArchitecturePanel() {
  const [isOpen, setIsOpen]     = useState(false);
  const [tab, setTab]           = useState<Tab>('bot');

  // BOT tab
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);
  const [history, setHistory]   = useState<{ role: string; content: string }[]>([]);
  const [ctx, setCtx]           = useState<ContextSnap | null>(null);
  const [ctxLoading, setCtxLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // CLIENT tab
  const [convs, setConvs]       = useState<ConvRow[]>([]);
  const [leads, setLeads]       = useState<LeadRow[]>([]);
  const [loadingClient, setLoadingClient] = useState(false);

  // ADMIN tab
  const [adminStats, setAdminStats] = useState<any>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  /* ─── Load context snapshot ─────────────────────────────────── */
  const loadContext = async () => {
    setCtxLoading(true);
    try {
      const res = await fetch(`/api/internal/context-builder?client_id=${CLIENT_ID}`, {
        headers: { 'x-service-key': '' } // Admin session from cookie handled server-side
      });
      if (res.ok) setCtx(await res.json());
      else setCtx(null);
    } catch { setCtx(null); }
    setCtxLoading(false);
  };

  /* ─── Load client data ──────────────────────────────────────── */
  const loadClientData = async () => {
    setLoadingClient(true);
    try {
      const [convsRes, leadsRes] = await Promise.all([
        fetch('/api/conversations?limit=5'),
        fetch('/api/leads?limit=5'),
      ]);
      if (convsRes.ok) {
        const d = await convsRes.json();
        setConvs(d.conversations ?? d.data ?? []);
      }
      if (leadsRes.ok) {
        const d = await leadsRes.json();
        setLeads(d.leads ?? d.data ?? []);
      }
    } catch {}
    setLoadingClient(false);
  };

  /* ─── Load admin stats ──────────────────────────────────────── */
  const loadAdminStats = async () => {
    setLoadingAdmin(true);
    try {
      // Use public admin endpoint (context-builder with service key)
      const res = await fetch(`/api/internal/context-builder?client_id=${CLIENT_ID}`);
      if (res.ok) setAdminStats(await res.json());
    } catch {}
    setLoadingAdmin(false);
  };

  /* ─── Tab change ────────────────────────────────────────────── */
  useEffect(() => {
    if (tab === 'bot' && !ctx) loadContext();
    if (tab === 'client') loadClientData();
    if (tab === 'admin') loadAdminStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  /* ─── Send message ──────────────────────────────────────────── */
  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput('');
    const ts = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    setMessages(p => [...p, { role: 'user', text: userMsg, ts }]);
    setSending(true);

    const newHistory = [...history, { role: 'user', content: userMsg }];
    setHistory(newHistory);

    try {
      const res = await fetch(API_CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, api_key: DEMO_API_KEY, session_id: 'arch-demo', history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error del servidor');
      const reply = data.reply ?? 'Sin respuesta';
      setMessages(p => [...p, { role: 'bot', text: reply, ts: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) }]);
      setHistory([...newHistory, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages(p => [...p, { role: 'bot', text: `⚠️ ${e.message}`, ts }]);
    }
    setSending(false);
  };

  const TABS: { id: Tab; label: string; icon: string; color: string }[] = [
    { id: 'bot',    label: '1. Bot Context',    icon: '🤖', color: 'text-purple-400' },
    { id: 'client', label: '2. Client Role',    icon: '👤', color: 'text-blue-400' },
    { id: 'admin',  label: '3. Root/Admin',     icon: '🔐', color: 'text-amber-400' },
  ];

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-[9000] flex items-center gap-2 bg-[#0d0d0d] border border-purple-500/40 text-purple-300 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xl hover:bg-purple-900/30 transition"
      >
        <span>🏗️</span> Arquitectura Técnica
      </button>

      {!isOpen ? null : (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0a0a12] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <span className="text-lg">🏗️</span>
                <div>
                  <h2 className="text-white font-bold text-sm">Panel de Arquitectura — AIgenciaLab</h2>
                  <p className="text-gray-600 text-[10px]">Entorno: /demo-empresa · Cliente: Valle Alto Propiedades</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-600 hover:text-white text-xl leading-none">×</button>
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-white/8">
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex-1 py-3 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    tab === t.id ? `${t.color} border-b-2 border-current bg-white/[0.03]` : 'text-gray-600 hover:text-gray-400'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">

              {/* ── TAB 1: Bot Context ── */}
              {tab === 'bot' && (
                <div className="grid md:grid-cols-2 gap-6 h-full">
                  {/* Left: live chat */}
                  <div className="flex flex-col bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-400">🤖 Chat en tiempo real</span>
                      <span className="text-[10px] text-gray-700">API: /api/chat · model: llama-3.1-8b-instant</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[280px]">
                      {messages.length === 0 && (
                        <p className="text-gray-700 text-xs text-center pt-8">Envía un mensaje para ver el bot en acción.<br/><span className="text-gray-800">Ej: "¿Cuáles son los requisitos para arrendar?"</span></p>
                      )}
                      {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${m.role === 'user' ? 'bg-purple-600/70 text-white' : 'bg-white/5 border border-white/8 text-gray-300'}`}>
                            {m.role === 'bot' && <p className="text-[9px] text-purple-400 font-bold mb-1">Asistente IA</p>}
                            <p className="leading-relaxed">{m.text}</p>
                            <p className="text-[9px] opacity-40 mt-1 text-right">{m.ts}</p>
                          </div>
                        </div>
                      ))}
                      {sending && (
                        <div className="flex justify-start">
                          <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-xs text-gray-500 italic">procesando…</div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-3 border-t border-white/5 flex gap-2">
                      <input value={input} onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Pregunta algo al bot…"
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-purple-500/40"
                      />
                      <button onClick={sendMessage} disabled={sending || !input.trim()}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition">
                        →
                      </button>
                    </div>
                  </div>

                  {/* Right: context snapshot */}
                  <div className="space-y-4">
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-purple-400">📋 Context Snapshot</span>
                        <button onClick={loadContext} className="text-[10px] text-gray-600 hover:text-white border border-white/10 px-2 py-1 rounded-lg transition">
                          {ctxLoading ? '…' : '↻ Reload'}
                        </button>
                      </div>
                      {ctxLoading ? (
                        <p className="text-xs text-gray-700">Cargando contexto…</p>
                      ) : ctx ? (
                        <div className="space-y-3 text-[11px]">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              ['Empresa', ctx.company],
                              ['Bot', ctx.bot_name],
                              ['Modelo', ctx.model],
                              ['Idioma', ctx.language],
                              ['Temp', ctx.temperature],
                              ['Tokens max', ctx.max_tokens],
                              ['FAQs', ctx.faqs_count],
                              ['Est. tokens', ctx.context_token_estimate],
                            ].map(([k, v]) => (
                              <div key={String(k)} className="bg-white/[0.03] rounded-lg p-2">
                                <p className="text-gray-600 text-[9px] uppercase tracking-widest">{k}</p>
                                <p className="text-white font-mono font-bold">{String(v)}</p>
                              </div>
                            ))}
                          </div>

                          <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                            <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-2 flex items-center gap-1">
                              System Prompt
                              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${ctx.system_prompt_source === 'custom' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                {ctx.system_prompt_source}
                              </span>
                            </p>
                            <pre className="text-gray-400 text-[10px] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">{ctx.system_prompt}</pre>
                          </div>

                          {ctx.faqs.length > 0 && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 max-h-24 overflow-y-auto">
                              <p className="text-[9px] uppercase tracking-widest text-gray-600 mb-2">FAQs Inyectadas ({ctx.faqs.length})</p>
                              {ctx.faqs.map((f, i) => (
                                <div key={i} className="text-[10px] mb-1">
                                  <span className="text-blue-300 font-bold">Q: </span><span className="text-gray-400">{f.q.slice(0, 60)}…</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-600">
                          <p className="mb-1">Requiere sesión de admin para leer el context snapshot.</p>
                          <p className="text-[10px]">El endpoint <code className="text-purple-400">/api/internal/context-builder</code> valida la sesión del admin via cookie.</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-purple-900/10 border border-purple-500/15 rounded-xl p-4 text-[11px] text-purple-300 space-y-1">
                      <p className="font-bold text-purple-300">💡 Flujo de contexto</p>
                      <p className="text-purple-400/70">1. Widget → POST /api/chat {'{'} api_key, message, history {'}'}</p>
                      <p className="text-purple-400/70">2. api_key → lookup api_keys tabla → client_id</p>
                      <p className="text-purple-400/70">3. client_id → bot_configs + clients.faqs</p>
                      <p className="text-purple-400/70">4. Build system_prompt (custom || generated+FAQs)</p>
                      <p className="text-purple-400/70">5. LLM call → reply → save conversation</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: Client Role ── */}
              {tab === 'client' && (
                <div className="space-y-5">
                  <div className="bg-blue-900/10 border border-blue-500/15 rounded-xl p-4 text-xs text-blue-300">
                    <p className="font-bold mb-1">👤 ¿Qué ve el cliente con acceso a /dashboard?</p>
                    <p className="text-blue-400/70">El cliente autenticado ve SOLO sus datos. RLS en Supabase asegura que <code>client_id = auth.uid()</code>. Aquí se muestran datos reales del cliente activo.</p>
                  </div>

                  {loadingClient ? (
                    <p className="text-gray-600 text-xs text-center py-8">Cargando datos del cliente…</p>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-5">
                      {/* Conversations */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-400">💬 Últimas Conversaciones</span>
                          <a href="/dashboard/conversations" target="_blank" className="text-[10px] text-blue-400/60 hover:text-blue-400">Ver todo →</a>
                        </div>
                        <div className="p-4 space-y-2">
                          {convs.length === 0 ? (
                            <p className="text-gray-700 text-xs text-center py-4">Sin conversaciones aún. Interactúa con el bot en la tab "Bot Context".</p>
                          ) : convs.map(c => (
                            <div key={c.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-3">
                              <div>
                                <p className="text-xs font-medium text-white">{c.contact_name || 'Visitante'}</p>
                                <p className="text-[10px] text-gray-600">{new Date(c.created_at).toLocaleDateString('es-CL')} · {c.channel}</p>
                              </div>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                c.status === 'open' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/15' :
                                c.status === 'resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15' :
                                'text-gray-500 bg-white/5 border-white/10'
                              }`}>{c.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Leads */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-400">🎯 Leads Capturados</span>
                          <a href="/dashboard/leads" target="_blank" className="text-[10px] text-blue-400/60 hover:text-blue-400">CRM completo →</a>
                        </div>
                        <div className="p-4 space-y-2">
                          {leads.length === 0 ? (
                            <p className="text-gray-700 text-xs text-center py-4">Sin leads aún. El bot captura leads cuando detecta intención de compra/arriendo.</p>
                          ) : leads.map(l => (
                            <div key={l.id} className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-lg p-3">
                              <div>
                                <p className="text-xs font-medium text-white">{l.name || '—'}</p>
                                <p className="text-[10px] text-gray-600">{l.email} · {new Date(l.created_at).toLocaleDateString('es-CL')}</p>
                              </div>
                              <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/15 font-bold">{l.source || 'chat'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 text-[11px]">
                    {[
                      { icon: '💬', title: '/dashboard/conversations', desc: 'Historial completo de chats', href: '/dashboard/conversations' },
                      { icon: '🎯', title: '/dashboard/leads', desc: 'CRM con score y filtros', href: '/dashboard/leads' },
                      { icon: '📊', title: '/dashboard/analytics', desc: 'KPIs, msgs/día, tasa respuesta', href: '/dashboard/analytics' },
                    ].map(r => (
                      <a key={r.title} href={r.href} target="_blank"
                        className="bg-white/[0.02] border border-white/5 hover:border-blue-500/20 rounded-xl p-4 transition block">
                        <p className="text-lg mb-2">{r.icon}</p>
                        <code className="text-blue-400 text-[10px]">{r.title}</code>
                        <p className="text-gray-600 mt-1">{r.desc}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB 3: Admin/Root ── */}
              {tab === 'admin' && (
                <div className="space-y-5">
                  <div className="bg-amber-900/10 border border-amber-500/15 rounded-xl p-4 text-xs text-amber-300">
                    <p className="font-bold mb-1">🔐 Rol Root — Aislamiento y Monitoreo Global</p>
                    <p className="text-amber-400/70">El admin usa <code>SUPABASE_SERVICE_ROLE_KEY</code> que bypassa RLS. Cada ruta <code>/admin/*</code> verifica <code>verifyAdmin()</code> (email + app_metadata.role).</p>
                  </div>

                  {/* Data isolation diagram */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <p className="text-xs font-bold text-amber-400 mb-4">🗄️ Arquitectura de Aislamiento de Datos</p>
                    <div className="space-y-3 text-[11px] font-mono">
                      {[
                        { table: 'clients',       rls: 'auth.uid() = id',                        admin: 'Service Role bypasses' },
                        { table: 'bot_configs',   rls: 'client_id = auth.uid()',                  admin: 'Service Role bypasses' },
                        { table: 'conversations', rls: 'client_id = auth.uid()',                  admin: 'Service Role bypasses' },
                        { table: 'messages',      rls: 'via conversations (client_id)',            admin: 'Service Role bypasses' },
                        { table: 'leads',         rls: 'client_id = auth.uid()',                  admin: 'Service Role bypasses' },
                        { table: 'api_keys',      rls: 'client_id = auth.uid()',                  admin: 'Service Role bypasses' },
                        { table: 'tickets',       rls: 'client_id = auth.uid() (client view)',    admin: '/api/admin/tickets uses Service Role' },
                      ].map(r => (
                        <div key={r.table} className="flex items-center gap-3 bg-white/[0.015] border border-white/5 rounded-lg p-2.5">
                          <code className="text-amber-400 w-32 flex-shrink-0">{r.table}</code>
                          <div className="flex-1 text-gray-500 text-[10px]">RLS: {r.rls}</div>
                          <div className="text-emerald-400/70 text-[10px] text-right">{r.admin}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin routes */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                    <p className="text-xs font-bold text-amber-400 mb-4">🛣️ Rutas Admin implementadas</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {[
                        ['/admin', 'Dashboard global: MRR, churn, health'],
                        ['/admin/clientes', 'Todos los clientes + health score'],
                        ['/admin/clientes/[id]', 'Detalle + 6 tabs + bot editor'],
                        ['/admin/conversations (global)', '/api/conversations bypass RLS'],
                        ['/admin/leads', 'Leads cross-client con funnel'],
                        ['/admin/tickets', 'Soporte + internal notes + canned'],
                        ['/admin/pagos', 'MRR/ARR/LTV + churn rate'],
                        ['/admin/alertas', 'Churn predictor + system health'],
                        ['/admin/bots', 'Estado de todos los bots'],
                        ['/admin/auditorias', 'Audit log de operaciones admin'],
                        ['/api/internal/context-builder', 'Context snapshot por cliente'],
                        ['/api/admin/export/[entity]', 'CSV export (clients, leads)'],
                      ].map(([route, desc]) => (
                        <div key={route} className="bg-white/[0.015] border border-white/5 rounded-lg p-2.5">
                          <code className="text-amber-400 block text-[9px] truncate">{route}</code>
                          <p className="text-gray-600 mt-0.5">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Context snapshot for this client (loaded above) */}
                  {adminStats && (
                    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                      <p className="text-xs font-bold text-amber-400 mb-3">🔍 Context Snapshot — Valle Alto Propiedades</p>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        {[
                          ['Empresa', adminStats.company],
                          ['Modelo', adminStats.model],
                          ['Prompt source', adminStats.system_prompt_source],
                          ['FAQs', adminStats.faqs_count],
                          ['Est tokens', adminStats.context_token_estimate],
                          ['Built at', new Date(adminStats.built_at).toLocaleTimeString('es-CL')],
                        ].map(([k, v]) => (
                          <div key={String(k)} className="bg-white/[0.03] rounded-lg p-2">
                            <p className="text-gray-600 text-[9px] uppercase tracking-widest">{k}</p>
                            <p className="text-white font-mono font-bold">{String(v)}</p>
                          </div>
                        ))}
                      </div>
                      <a href="/admin" target="_blank"
                        className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition">
                        → Abrir Admin Dashboard completo
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
