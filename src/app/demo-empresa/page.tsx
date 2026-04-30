'use client';

/**
 * /demo-empresa/page.tsx
 * Panel de demostración multi-rubro del Motor de Agente Dinámico AIgenciaLab.
 * 4 rubros switcheables en tiempo real, chat conectado a /api/chat con Groq + tools.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { ArchitecturePanel } from './ArchitecturePanel';

const DEMO_API_KEY  = 'agl_d9862b5f4d3b986babcad9d17797c684e3c8b557c3689f3a';
const API_CHAT      = '/api/chat';

// ─────────────────────────────────────────────────────────────
// RUBROS
// ─────────────────────────────────────────────────────────────
const RUBROS = [
  {
    id:          'clinica_medica',
    label:       'Clínica Médica',
    emoji:       '🏥',
    gradient:    'from-emerald-500/20 to-teal-500/10',
    border:      'border-emerald-500/30',
    activeBg:    'bg-emerald-500/15',
    activeText:  'text-emerald-300',
    activeRing:  'ring-emerald-500/40',
    color:       '#10b981',
    agent:       'Dr. Bot',
    business:    'Clínica Vida Sana',
    tagline:     'Agenda citas · Especialidades · Triaje gentil',
    questions:   [
      '¿Qué especialidades tienen?',
      'Necesito agendar con ginecología para mañana',
      '¿Cuánto vale una consulta de medicina general?',
      'Me duele el pecho, ¿qué hago?',
    ],
  },
  {
    id:          'tienda_retail',
    label:       'Tienda de Zapatos',
    emoji:       '👟',
    gradient:    'from-violet-500/20 to-purple-500/10',
    border:      'border-violet-500/30',
    activeBg:    'bg-violet-500/15',
    activeText:  'text-violet-300',
    activeRing:  'ring-violet-500/40',
    color:       '#8b5cf6',
    agent:       'Camila',
    business:    'StepUp Calzados',
    tagline:     'Catálogo inteligente · Stock real · Recomendaciones',
    questions:   [
      '¿Qué zapatillas tienen para correr?',
      'Busco botas en talla 38, ¿cuánto cuestan?',
      '¿Tienen descuentos este mes?',
      'Necesito zapatos formales para entrevista de trabajo',
    ],
  },
  {
    id:          'restaurante',
    label:       'Restaurante',
    emoji:       '🍽️',
    gradient:    'from-amber-500/20 to-orange-500/10',
    border:      'border-amber-500/30',
    activeBg:    'bg-amber-500/15',
    activeText:  'text-amber-300',
    activeRing:  'ring-amber-500/40',
    color:       '#f59e0b',
    agent:       'Sofía',
    business:    'Bistró Del Valle',
    tagline:     'Reservas · Menú · Eventos especiales',
    questions:   [
      'Quiero reservar una mesa para 4 personas el sábado',
      '¿Tienen opciones vegetarianas?',
      'Es el cumpleaños de mi esposa, ¿pueden hacer algo especial?',
      '¿A qué hora abren para cena?',
    ],
  },
  {
    id:          'fitness_gym',
    label:       'Gimnasio',
    emoji:       '💪',
    gradient:    'from-rose-500/20 to-pink-500/10',
    border:      'border-rose-500/30',
    activeBg:    'bg-rose-500/15',
    activeText:  'text-rose-300',
    activeRing:  'ring-rose-500/40',
    color:       '#f43f5e',
    agent:       'Alex',
    business:    'FitPro Gym',
    tagline:     'Membresías · Clases · Entrenador personal',
    questions:   [
      'Quiero bajar de peso, ¿qué membresía me recomiendas?',
      '¿Tienen clases de spinning y a qué horas?',
      '¿Cuánto cuesta el entrenador personal?',
      '¿Puedo probar el gym antes de inscribirme?',
    ],
  },
] as const;

type RubroId = (typeof RUBROS)[number]['id'];

interface Msg {
  role:   'user' | 'bot';
  text:   string;
  ts:     string;
  tool?:  string;   // nombre de tool llamada (si aplica)
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function DemoEmpresaPage() {
  const [activeRubro, setActiveRubro]   = useState<RubroId>('clinica_medica');
  const [messages,    setMessages]      = useState<Msg[]>([]);
  const [input,       setInput]         = useState('');
  const [sending,     setSending]       = useState(false);
  const [history,     setHistory]       = useState<{ role: string; content: string }[]>([]);
  const [toolBadge,   setToolBadge]     = useState<string | null>(null);
  const [latency,     setLatency]       = useState<number | null>(null);

  const chatEndRef  = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  const currentRubro = RUBROS.find(r => r.id === activeRubro)!;

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Reset chat on rubro switch
  const switchRubro = useCallback((id: RubroId) => {
    setActiveRubro(id);
    setMessages([]);
    setHistory([]);
    setInput('');
    setToolBadge(null);
    setLatency(null);
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  // ── Send message ─────────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || sending) return;
    setInput('');
    const ts = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    setMessages(p => [...p, { role: 'user', text: msg, ts }]);
    setSending(true);
    setToolBadge(null);

    const newHistory = [...history, { role: 'user', content: msg }];
    setHistory(newHistory);

    try {
      const res = await fetch(API_CHAT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:    msg,
          api_key:    DEMO_API_KEY,
          rubro_slug: activeRubro,
          session_id: `demo-${activeRubro}`,
          history,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error del servidor');

      const reply = data.reply ?? 'Sin respuesta';
      const botTs = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

      setMessages(p => [...p, { role: 'bot', text: reply, ts: botTs }]);
      setHistory([...newHistory, { role: 'assistant', content: reply }]);
      if (data.latency_ms) setLatency(data.latency_ms);

    } catch (e: any) {
      const botTs = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
      setMessages(p => [...p, { role: 'bot', text: `⚠️ ${e.message}`, ts: botTs }]);
    }

    setSending(false);
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#06060e] text-white relative overflow-hidden">

      {/* ── Ambient background glows ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute top-[-180px] left-[-100px] w-[600px] h-[600px] rounded-full opacity-10 blur-[120px] transition-all duration-1000"
          style={{ backgroundColor: currentRubro.color }}
        />
        <div
          className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full opacity-8 blur-[100px] transition-all duration-1000"
          style={{ backgroundColor: currentRubro.color }}
        />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── HEADER ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest text-gray-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Motor en vivo · Groq + Function Calling · 4 rubros
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(135deg, #fff 0%, ${currentRubro.color} 100%)` }}>
            Agente IA Multi-Rubro
          </h1>
          <p className="text-gray-400 text-base max-w-xl mx-auto">
            El mismo motor se adapta al rubro de tu cliente. Cambia de industria y observa cómo el agente ajusta su contexto, herramientas y personalidad en tiempo real.
          </p>
        </div>

        {/* ── RUBRO SELECTOR ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RUBROS.map(r => {
            const isActive = r.id === activeRubro;
            return (
              <button
                key={r.id}
                onClick={() => switchRubro(r.id)}
                className={`
                  relative group p-4 rounded-2xl border text-left transition-all duration-300 overflow-hidden
                  ${isActive
                    ? `${r.activeBg} ${r.border} ring-2 ${r.activeRing}`
                    : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10'}
                `}
              >
                {/* Glow on active */}
                {isActive && (
                  <div className="absolute inset-0 opacity-10 rounded-2xl"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${r.color}, transparent 70%)` }}
                  />
                )}
                <div className="relative">
                  <span className="text-2xl mb-2 block">{r.emoji}</span>
                  <p className={`text-xs font-bold tracking-tight ${isActive ? r.activeText : 'text-gray-300'}`}>{r.label}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5 leading-snug">{r.tagline}</p>
                  {isActive && (
                    <span className={`mt-2 inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full ${r.activeBg} ${r.activeText} border ${r.border}`}>
                      ACTIVO
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ── MAIN PANEL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

          {/* ── LEFT: Info Panel ── */}
          <div className="space-y-4">
            {/* Agent Card */}
            <div className={`rounded-2xl border ${currentRubro.border} bg-gradient-to-b ${currentRubro.gradient} p-5 space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="text-3xl w-14 h-14 flex items-center justify-center rounded-2xl bg-black/30 border border-white/10">
                  {currentRubro.emoji}
                </div>
                <div>
                  <p className={`font-black text-base ${currentRubro.activeText}`}>{currentRubro.business}</p>
                  <p className="text-gray-400 text-xs">Agente: <span className="text-white font-bold">{currentRubro.agent}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {[
                  ['Modelo',  'Groq llama-3.3-70b'],
                  ['Tools',   'Function Calling ✅'],
                  ['Contexto','Dinámico (DB)'],
                  ['Plan',    'Starter+ Demo'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-black/20 border border-white/5 rounded-xl p-2.5">
                    <p className="text-gray-600 uppercase tracking-widest mb-0.5">{k}</p>
                    <p className="text-white font-bold">{v}</p>
                  </div>
                ))}
              </div>

              {latency && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Última respuesta: <span className="text-emerald-400 font-bold">{latency}ms</span>
                </div>
              )}
            </div>

            {/* Example Questions */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-3">
                💬 Preguntas de ejemplo
              </p>
              {currentRubro.questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={sending}
                  className="w-full text-left text-xs text-gray-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.04] hover:border-white/10 rounded-xl px-3 py-2.5 transition-all duration-200 disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* How it works */}
            <div className="bg-black/20 border border-white/[0.06] rounded-2xl p-4 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">⚙️ Bajo el capó</p>
              {[
                { n: '1', text: 'Chat → POST /api/chat {message, rubro_slug}' },
                { n: '2', text: 'Lookup business_profiles WHERE client=X AND rubro=Y' },
                { n: '3', text: 'Construye system prompt dinámico con {{variables}}' },
                { n: '4', text: 'Groq llama tools (function calling) si el usuario las activa' },
                { n: '5', text: 'Guarda lead/cita en DB, retorna respuesta final' },
              ].map(step => (
                <div key={step.n} className="flex gap-2.5 items-start">
                  <span className={`text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${currentRubro.activeBg} ${currentRubro.activeText}`}>
                    {step.n}
                  </span>
                  <p className="text-[10px] text-gray-500 leading-snug">{step.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Live Chat ── */}
          <div className="flex flex-col rounded-2xl border border-white/[0.08] bg-black/30 backdrop-blur overflow-hidden min-h-[580px]">

            {/* Chat header */}
            <div className={`px-5 py-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r ${currentRubro.gradient}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                  style={{ backgroundColor: currentRubro.color + '30', border: `1px solid ${currentRubro.color}40` }}>
                  {currentRubro.emoji}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{currentRubro.agent}</p>
                  <p className="text-[10px] text-gray-400">{currentRubro.business}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-bold">EN LÍNEA</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[350px] max-h-[480px]">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-3">
                  <div className="text-5xl">{currentRubro.emoji}</div>
                  <p className="text-gray-500 text-sm font-medium">
                    ¡Hola! Soy {currentRubro.agent} de {currentRubro.business}.
                  </p>
                  <p className="text-gray-700 text-xs">Selecciona una pregunta de ejemplo o escribe tu consulta →</p>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                  {m.role === 'bot' && (
                    <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-sm"
                      style={{ backgroundColor: currentRubro.color + '20', border: `1px solid ${currentRubro.color}30` }}>
                      {currentRubro.emoji}
                    </div>
                  )}
                  <div className="max-w-[78%]">
                    {m.role === 'bot' && (
                      <p className="text-[9px] font-bold mb-1" style={{ color: currentRubro.color }}>
                        {currentRubro.agent}
                      </p>
                    )}
                    <div className={`
                      rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap
                      ${m.role === 'user'
                        ? 'text-white rounded-tr-sm'
                        : 'bg-white/[0.04] border border-white/[0.06] text-gray-200 rounded-tl-sm'}
                    `} style={m.role === 'user' ? { backgroundColor: currentRubro.color + 'cc' } : {}}>
                      {m.text}
                    </div>
                    <p className="text-[9px] text-gray-700 mt-1 px-1">{m.ts}</p>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex justify-start gap-2">
                  <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-sm"
                    style={{ backgroundColor: currentRubro.color + '20' }}>
                    {currentRubro.emoji}
                  </div>
                  <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: currentRubro.color, animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: currentRubro.color, animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: currentRubro.color, animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/[0.06]">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder={`Escribe tu consulta a ${currentRubro.agent}…`}
                  className="flex-1 bg-white/[0.04] border border-white/10 focus:border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={sending || !input.trim()}
                  className="px-5 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 text-white"
                  style={{ backgroundColor: currentRubro.color }}
                >
                  {sending ? '…' : '→'}
                </button>
              </div>
              <p className="text-center text-[9px] text-gray-700 mt-2 tracking-wider">
                Powered by <span className="text-white/40">AIgenciaLab</span> · Groq llama-3.3-70b · Function Calling
              </p>
            </div>
          </div>
        </div>

        {/* ── FOOTER METRICS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Groq FREE',        value: '$0',        sub: 'Costo mensual LLM',  emoji: '💚' },
            { label: 'Function Calling', value: '6',         sub: 'Tools disponibles',  emoji: '⚙️' },
            { label: 'Rubros listos',    value: '4',         sub: 'Clínica, Retail, Rest, Gym', emoji: '🚀' },
            { label: 'Tiempo respuesta', value: `${latency ?? '< 2s'}${latency ? 'ms' : ''}`, sub: 'Groq ultra-rápido', emoji: '⚡' },
          ].map(m => (
            <div key={m.label} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-center">
              <p className="text-2xl mb-1">{m.emoji}</p>
              <p className="text-xl font-black text-white">{m.value}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{m.label}</p>
              <p className="text-[9px] text-gray-700 mt-0.5">{m.sub}</p>
            </div>
          ))}
        </div>

      </div>

      {/* ── Architecture Panel (flotante, preservado) ── */}
      <ArchitecturePanel />
    </div>
  );
}
