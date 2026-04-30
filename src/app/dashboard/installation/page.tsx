'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download, Code, Puzzle, Globe, CheckCircle2, Copy,
  ExternalLink, Zap, Terminal, ChevronRight, Server,
  Package, Eye, ShieldCheck, RefreshCw, Loader2, Key,
  XCircle
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://aigencialab.cl';

export default function InstallationPage() {
  const [activeTab, setActiveTab]       = useState<'snippet' | 'wordpress' | 'api'>('snippet');
  const [apiKey, setApiKey]             = useState<string>('');
  const [clientId, setClientId]         = useState<string>('');
  const [copied, setCopied]             = useState<'snippet' | 'api' | null>(null);
  const [loading, setLoading]           = useState(true);
  const [generating, setGenerating]     = useState(false);
  const [genError, setGenError]         = useState<string | null>(null);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  // Widget verification
  const [verifying, setVerifying]       = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ installed: boolean; domain: string | null; checkedAt: string; error?: string | null } | null>(null);


  const supabase = createClient();

  const fetchKey = useCallback(async () => {
    setLoading(true);
    setGenError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setClientId(user.id);

      const { data, error } = await supabase
        .from('api_keys')
        .select('key')
        .eq('client_id', user.id)
        .maybeSingle();

      if (data?.key) {
        setApiKey(data.key);
      } else {
        // No key yet: auto-generate one
        await generateKey(user.id);
      }
    } catch (e: any) {
      setGenError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateKey = async (forId?: string) => {
    setGenerating(true);
    setGenError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = forId ?? user?.id;
      if (!uid) throw new Error('No autenticado');

      const res  = await fetch('/api/client/generate-api-key', { method: 'POST' });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? 'Error generando key');
      setApiKey(json.key);
    } catch (e: any) {
      setGenError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => { fetchKey(); }, [fetchKey]);

  const snippet = `<script\n  src="${SITE_URL}/api/widget/${clientId || 'TU_CLIENT_ID'}/script.js"\n  async>\n</script>`;

  const copyText = (text: string, type: 'snippet' | 'api') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        <span className="ml-3 text-gray-400">Cargando credenciales…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Centro de Instalación</h1>
          <p className="text-[var(--muted)]">Conecta tu asistente IA a tu negocio en minutos.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Conexión SSL Protegida</span>
        </div>
      </div>

      {/* API Key panel */}
      <div className="glass rounded-2xl p-6 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-yellow-400" /> Tu API Key
          </h3>
          <button onClick={() => generateKey()} disabled={generating}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-white transition">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {generating ? 'Generando…' : 'Regenerar key'}
          </button>
        </div>
        {genError && (
          <div className="flex items-center gap-2 text-xs text-red-400 mb-2">
            <XCircle className="w-3.5 h-3.5 flex-shrink-0" /> {genError}
          </div>
        )}
        {apiKey ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-black/40 rounded-xl px-4 py-3 font-mono text-xs text-yellow-300 border border-yellow-500/10 break-all">
              {apiKey}
            </div>
            <button onClick={() => copyText(apiKey, 'api')}
              className="flex-shrink-0 p-2.5 bg-yellow-600/20 hover:bg-yellow-500/30 text-yellow-400 rounded-xl transition">
              {copied === 'api' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="text-sm text-gray-400 italic">No se pudo obtener la API Key.</div>
        )}
        <p className="text-[10px] text-[var(--muted)] mt-2">
          Mantén esta clave privada. Se usa para autenticar tus requests a la API de AIgenciaLab.
        </p>
      </div>

      {/* Widget verification */}
      <div className="glass rounded-2xl p-6 border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verificar Instalación
          </h3>
          <button
            onClick={async () => {
              setVerifying(true); setVerifyResult(null);
              try {
                const res  = await fetch('/api/client/verify-widget');
                const data = await res.json();
                setVerifyResult(data);
              } catch { setVerifyResult({ installed: false, domain: null, checkedAt: new Date().toISOString(), error: 'Error de red al verificar.' }); }
              finally { setVerifying(false); }
            }}
            disabled={verifying}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-white border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            {verifying ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando…</> : <><Eye className="w-3.5 h-3.5" /> Verificar ahora</>}
          </button>
        </div>
        <p className="text-[11px] text-[var(--muted)] mb-4">
          Comprobamos automáticamente si el snippet está instalado en tu dominio registrado.
        </p>
        {verifyResult && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
            verifyResult.installed
              ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/8 border-red-500/20 text-red-300'
          }`}>
            {verifyResult.installed
              ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />}
            <div>
              <p className="font-bold mb-0.5">
                {verifyResult.installed ? '✅ Widget detectado en tu sitio' : '❌ Widget no detectado'}
              </p>
              <p className="text-xs opacity-80">
                {verifyResult.error ?? `Dominio verificado: ${verifyResult.domain}`}
              </p>
              <p className="text-[10px] opacity-50 mt-1">
                Verificado: {new Date(verifyResult.checkedAt).toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        )}
        {!verifyResult && !verifying && (
          <p className="text-[11px] text-gray-700 italic">Haz clic en "Verificar ahora" para comprobar tu instalación.</p>
        )}
      </div>


      <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-full max-w-xl">
        {(['snippet', 'wordpress', 'api'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
              ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[var(--muted)] hover:text-white'}`}>
            {tab === 'snippet' && <><Globe className="w-4 h-4" /> Snippet JS</>}
            {tab === 'wordpress' && <><Package className="w-4 h-4" /> WordPress</>}
            {tab === 'api' && <><Server className="w-4 h-4" /> API REST</>}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* ── SNIPPET TAB ── */}
          {activeTab === 'snippet' && (
            <div className="glass rounded-[40px] p-10 border border-[var(--border)] space-y-6 bg-gradient-to-br from-blue-600/5 to-transparent relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                  <Code className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Snippet Universal</h3>
              </div>
              <p className="text-sm text-[var(--muted)] leading-relaxed font-medium">
                La forma más rápida de integrar el bot en cualquier sitio web. Funciona en HTML, React, PHP, Webflow, Shopify y más.
              </p>

              <div className="relative group">
                <div className="bg-[#0b0e14] rounded-2xl p-6 border border-white/5 font-mono text-xs text-blue-100 overflow-x-auto">
                  <pre className="m-0 leading-relaxed font-mono">{snippet}</pre>
                </div>
                <button onClick={() => copyText(snippet, 'snippet')}
                  className="absolute top-4 right-4 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  {copied === 'snippet' ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar Código</>}
                </button>
              </div>

              <div className="flex items-start gap-4 p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <h5 className="text-[11px] font-bold text-blue-400 uppercase tracking-tight">Consejo Pro</h5>
                  <p className="text-xs text-blue-100/70 leading-relaxed font-medium">
                    Pega el código justo antes del cierre de la etiqueta <code className="text-blue-400 font-bold">&lt;/body&gt;</code> para asegurar que el widget no afecte la velocidad de carga (LCP) de tu sitio.
                  </p>
                </div>
              </div>

              {/* Test live link */}
              {clientId && (
                <a href={`/api/widget/${clientId}/script.js`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-green-400 hover:text-green-300 transition">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Verificar script.js en vivo →
                </a>
              )}
            </div>
          )}

          {/* ── WORDPRESS TAB ── */}
          {activeTab === 'wordpress' && (
            <div className="glass rounded-[40px] p-10 border border-[var(--border)] space-y-8 bg-gradient-to-br from-purple-600/5 to-transparent relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full" />
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">WordPress & WooCommerce</h3>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[32px] gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-3 shadow-2xl">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Wordpress_Blue_logo.png" alt="WP" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base uppercase tracking-tight">aigencialab-chatbot.zip</h4>
                    <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-0.5">Versión 1.0.0 · Plugin ZIP</p>
                  </div>
                </div>
                <a href="/widget/aigencialab-chatbot.zip" download
                  className="py-4 px-8 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30">
                  <Download className="w-4 h-4" /> Bajar Plugin (.zip)
                </a>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-purple-400" /> Pasos para Activar
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StepItem num="1" title="Subir Plugin" text="En tu admin de WP, ve a Plugins → Añadir Nuevo → Subir Plugin y elige el archivo .zip descargado." />
                  <StepItem num="2" title="Activar" text="Haz clic en 'Activar Plugin' una vez finalizada la instalación." />
                  <StepItem num="3" title="Vincular API" text="Ve al menú 'AIgenciaLab Bot' en los Ajustes de WordPress." />
                  <StepItem num="4" title="Pegar API Key" text={`Tu clave de activación: ${apiKey || 'cargando...'}`} code />
                </div>
              </div>

              {/* Alternative: use snippet in WP header */}
              <div className="p-5 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                <p className="text-xs font-bold text-yellow-400 mb-2">Alternativa rápida sin plugin:</p>
                <p className="text-[10px] text-[var(--muted)]">
                  En WP puedes ir a <strong className="text-white">Apariencia → Editor de temas → header.php</strong> y pegar el snippet JS justo antes de <code className="text-yellow-400">&lt;/body&gt;</code>.
                </p>
              </div>
            </div>
          )}

          {/* ── API REST TAB ── */}
          {activeTab === 'api' && (
            <div className="glass rounded-[40px] p-10 border border-[var(--border)] space-y-8 bg-gradient-to-br from-emerald-600/5 to-transparent relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-600/10 blur-[100px] rounded-full" />
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
                  <Server className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">API REST Full Access</h3>
              </div>

              <div className="space-y-6">
                <ApiEndpoint
                  method="POST"
                  endpoint="/api/chat"
                  desc="Envía un mensaje al agente y recibe la respuesta del LLM."
                  code={`fetch('https://aigencialab.cl/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    api_key: "${apiKey || 'TU_API_KEY'}",
    message: "Hola, ¿cuáles son sus servicios?",
    session_id: "usuario_123"
  })
})`}
                />
                <ApiEndpoint
                  method="GET"
                  endpoint="/api/widget/{client_id}/script.js"
                  desc="Obtén el script de instalación del widget para tu client_id."
                  params={`client_id=${clientId || 'TU_CLIENT_ID'}`}
                />
                <ApiEndpoint
                  method="POST"
                  endpoint="/api/leads"
                  desc="Registra un lead capturado externamente en tu CRM de AIgenciaLab."
                  code={`{
  "api_key": "${apiKey || 'TU_API_KEY'}",
  "name": "Juan Pérez",
  "email": "juan@empresa.cl",
  "phone": "+56912345678",
  "message": "Interesado en plan Pro"
}`}
                />
              </div>

              <p className="text-[10px] text-[var(--muted)] pt-2">
                Base URL: <code className="text-emerald-400">https://aigencialab.cl</code> · Autenticación via <code className="text-emerald-400">api_key</code> en el body.
              </p>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-6">
          {/* Preview del bot */}
          <div className="glass rounded-[32px] p-8 border border-[var(--border)] overflow-hidden">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <Eye className="w-4 h-4 text-blue-400" /> Preview del Bot
            </h4>
            <div className="aspect-[4/5] rounded-2xl border border-white/5 bg-black/40 relative flex items-center justify-center p-6 text-center group">
              <div className="relative z-10">
                <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Puzzle className="w-10 h-10 text-blue-400" />
                </div>
                <h5 className="text-[11px] font-bold text-white uppercase tracking-widest mb-2">Widget Preview</h5>
                <p className="text-[10px] text-[var(--muted)] leading-relaxed mb-6">Visualiza cómo se verá el botón flotante en tu sitio web.</p>
                {clientId ? (
                  <a
                    href={`/widget/${clientId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-3 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    Abrir Simulador →
                  </a>
                ) : (
                  <button disabled
                    className="w-full py-3 bg-white/5 text-white border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest opacity-50 cursor-not-allowed">
                    Cargando…
                  </button>
                )}
              </div>
              {/* Decoration */}
              <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/50 animate-pulse">
                <Globe className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Soporte & Docs */}
          <div className="glass rounded-[32px] p-8 border border-[var(--border)]">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
              <ExternalLink className="w-4 h-4 text-blue-400" /> Soporte & Docs
            </h4>
            <nav className="space-y-2">
              <ResourceLink
                title="Colección de Postman"
                href="https://documenter.getpostman.com/view/aigencialab"
                external
              />
              <ResourceLink
                title="Documentación de Webhooks"
                href="/dashboard/support"
              />
              <ResourceLink
                title="Personalización CSS del Widget"
                href="/dashboard/support"
              />
              <ResourceLink
                title="Guía de WooCommerce"
                href="/dashboard/support"
              />
              <ResourceLink
                title="Contactar Soporte"
                href="mailto:soporte@aigencialab.cl"
                external
              />
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────── */
function StepItem({ num, title, text, code }: { num: string; title: string; text: string; code?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">{num}</span>
        <h5 className="text-[11px] font-bold text-white uppercase tracking-tight">{title}</h5>
      </div>
      <p className="text-[10px] text-[var(--muted)] leading-relaxed font-medium pl-9">{code ? text.split(': ')[0] + ':' : text}</p>
      {code && (
        <div className="pl-9">
          <code className="text-[10px] p-2 bg-black/40 rounded-lg border border-white/5 text-yellow-400 block break-all font-mono">
            {text.split(': ').slice(1).join(': ')}
          </code>
        </div>
      )}
    </div>
  );
}

function ApiEndpoint({ method, endpoint, desc, params, code }: {
  method: string; endpoint: string; desc: string; params?: string; code?: string;
}) {
  const [copied, setCopied] = useState(false);
  const textToCopy = code ?? (params ? `${endpoint}?${params}` : endpoint);

  return (
    <div className="space-y-4 p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${method === 'GET' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
            {method}
          </span>
          <code className="text-[12px] text-white font-bold">{endpoint}</code>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(textToCopy); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-[10px] font-bold text-blue-400 hover:text-white transition-colors flex items-center gap-1"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <p className="text-[10px] text-[var(--muted)] font-medium italic">{desc}</p>
      {params && (
        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 font-mono text-[10px] text-emerald-300">?{params}</div>
      )}
      {code && (
        <pre className="p-4 bg-black/30 rounded-2xl border border-white/5 font-mono text-[10px] text-blue-400 overflow-x-auto m-0 whitespace-pre-wrap">{code}</pre>
      )}
    </div>
  );
}

function ResourceLink({ title, href, external }: { title: string; href: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-white/5 text-[10px] font-bold text-[var(--muted)] hover:text-white transition-all uppercase tracking-widest group border border-transparent hover:border-white/5"
    >
      {title}
      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
    </a>
  );
}
