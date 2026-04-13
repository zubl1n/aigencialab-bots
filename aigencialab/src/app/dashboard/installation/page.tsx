'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Code, 
  Puzzle, 
  Globe, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  Zap,
  Terminal,
  ChevronRight,
  Server,
  Package,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function InstallationPage() {
  const [activeTab, setActiveTab] = useState<'snippet' | 'wordpress' | 'api'>('snippet');
  const [apiKey, setApiKey] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchApiKey = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Obtenemos la API Key real desde la tabla api_keys
        const { data, error } = await supabase
          .from('api_keys')
          .select('key')
          .eq('client_id', user.id)
          .single();
          
        if (data) setApiKey(data.key);
        else console.error("No se encontró API Key para el usuario:", error);
      }
      setLoading(false);
    };
    fetchApiKey();
  }, []);

  const snippet = `<script 
  data-api-key="${apiKey || 'CARGANDO_API_KEY...'}" 
  src="${typeof window !== 'undefined' ? window.location.origin : 'https://aigencialab.cl'}/widget/widget.js" 
  async>
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
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

      {/* Tabs Selector */}
      <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-full max-w-xl">
        <button 
          onClick={() => setActiveTab('snippet')}
          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'snippet' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[var(--muted)] hover:text-white'}`}
        >
          <Globe className="w-4 h-4" /> Snippet JS
        </button>
        <button 
          onClick={() => setActiveTab('wordpress')}
          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'wordpress' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[var(--muted)] hover:text-white'}`}
        >
          <Package className="w-4 h-4" /> WordPress
        </button>
        <button 
          onClick={() => setActiveTab('api')}
          className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'api' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-[var(--muted)] hover:text-white'}`}
        >
          <Server className="w-4 h-4" /> API REST
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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
                <div className="bg-[#0b0e14] rounded-2xl p-6 border border-white/5 font-mono text-xs text-blue-100 overflow-x-auto selection:bg-blue-500/30">
                  <pre className="m-0 leading-relaxed font-mono">
                    {snippet}
                  </pre>
                </div>
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-4 right-4 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
                >
                  {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copiado</> : <><Copy className="w-3.5 h-3.5" /> Copiar Código</>}
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
            </div>
          )}

          {activeTab === 'wordpress' && (
            <div className="glass rounded-[40px] p-10 border border-[var(--border)] space-y-8 bg-gradient-to-br from-purple-600/5 to-transparent relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full" />
              
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 rounded-2xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">WordPress & WooCommerce</h3>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-white/5 border border-white/10 rounded-[32px] group gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-3 shadow-2xl">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/Wordpress_Blue_logo.png" alt="WP" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base uppercase tracking-tight">aigencialab-chatbot.zip</h4>
                    <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mt-0.5">Versión 1.0.0 · Instalador Zip Plugin</p>
                  </div>
                </div>
                <a 
                  href="/widget/aigencialab-chatbot.zip" 
                  download 
                  className="py-4 px-8 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30"
                >
                  <Download className="w-4 h-4" /> Bajar Plugin (.zip)
                </a>
              </div>

              <div className="space-y-6">
                 <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" /> Pasos para Activar
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <StepItem num="1" title="Subir Plugin" text="En tu admin de WP, ve a Plugins -> Añadir Nuevo -> Subir Plugin y elige el archivo descargado." />
                    <StepItem num="2" title="Activar" text="Haz clic en el botón 'Activar Plugin' una vez finalizada la instalación." />
                    <StepItem num="3" title="Vincular API" text="Ve al menú 'AIgenciaLab Bot' en los Ajustes generales de WordPress." />
                    <StepItem num="4" title="Copiar Key" text={`Tu clave de activación: ${apiKey || 'Obteniendo clave...'}`} code />
                 </div>
              </div>
            </div>
          )}

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
                  method="GET" 
                  endpoint="/bot-config" 
                  desc="Obtén la configuración JSON de tu agente IA para interfaces personalizadas." 
                  params={`api_key=${apiKey || '...'}`}
                />
                <ApiEndpoint 
                  method="POST" 
                  endpoint="/chat" 
                  desc="Interfaz programática para enviar mensajes y recibir respuestas del LLM." 
                  code={`fetch('/chat', {
  method: 'POST',
  body: JSON.stringify({
    api_key: "${apiKey || '...'}",
    message: "Hola",
    session_id: "random_id"
  })
})`}
                />
                <ApiEndpoint 
                  method="POST" 
                  endpoint="/capture-lead" 
                  desc="Registra datos de contacto capturados externamente en tu CRM local." 
                  code={`{ "api_key": "${apiKey || '...'}", "name": "Cliente", "email": "email@test.com" }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
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
                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">
                    Abrir Simulador
                  </button>
                </div>
                {/* Decoration */}
                <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/50 animate-pulse">
                  <Globe className="w-6 h-6 text-white" />
                </div>
             </div>
          </div>

          <div className="glass rounded-[32px] p-8 border border-[var(--border)]">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                <ExternalLink className="w-4 h-4 text-blue-400" /> Soporte & Docs
              </h4>
              <nav className="space-y-2">
                <ResourceLink title="Colección de Postman" href="#" />
                <ResourceLink title="Documentación de Webhooks" href="#" />
                <ResourceLink title="Personalización CSS" href="#" />
                <ResourceLink title="Guía de WooCommerce" href="#" />
              </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepItem({ num, title, text, code }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
          {num}
        </span>
        <h5 className="text-[11px] font-bold text-white uppercase tracking-tight">{title}</h5>
      </div>
      <p className="text-[10px] text-[var(--muted)] leading-relaxed font-medium pl-9">{text}</p>
      {code && (
        <div className="pl-9 pt-1">
          <code className="text-[10px] p-2 bg-black/40 rounded-lg border border-white/5 text-blue-400 block break-all font-mono">
             {text.split(': ')[1]}
          </code>
        </div>
      )}
    </div>
  );
}

function ApiEndpoint({ method, endpoint, desc, params, code }: any) {
  return (
    <div className="space-y-4 p-6 bg-white/[0.03] border border-white/5 rounded-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${method === 'GET' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
            {method}
          </span>
          <code className="text-[12px] text-white font-bold">{endpoint}</code>
        </div>
        <button className="text-[10px] font-bold text-blue-400 uppercase tracking-widest hover:text-white transition-colors">Copiar URL</button>
      </div>
      <p className="text-[10px] text-[var(--muted)] font-medium italic">{desc}</p>
      {params && (
         <div className="p-4 bg-black/30 rounded-2xl border border-white/5 font-mono text-[10px] text-emerald-300">
           ?{params}
         </div>
      )}
      {code && (
        <pre className="p-4 bg-black/30 rounded-2xl border border-white/5 font-mono text-[10px] text-blue-400 overflow-x-auto m-0">
          {code}
        </pre>
      )}
    </div>
  );
}

function ResourceLink({ title, href }: { title: string, href: string }) {
  return (
    <a href={href} className="flex justify-between items-center py-3 px-4 rounded-xl hover:bg-white/5 text-[10px] font-bold text-[var(--muted)] hover:text-white transition-all uppercase tracking-widest group border border-transparent hover:border-white/5">
      {title} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
    </a>
  );
}
