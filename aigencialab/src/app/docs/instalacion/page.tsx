'use client';

import { useState } from 'react';
import { Copy, Check, Globe, MessageSquare } from 'lucide-react';
import { MainLayout } from '@/components/landing/MainLayout';

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="relative">
      <pre className="bg-[#0f172a] text-slate-300 text-xs leading-relaxed p-5 rounded-xl overflow-x-auto font-mono">
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1.5 rounded-lg transition-all"
      >
        {copied ? <><Check className="w-3 h-3 text-emerald-400" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
      </button>
    </div>
  );
}

const TABS = [
  { id: 'web', label: 'Webchat', icon: Globe },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { id: 'instagram', label: 'Instagram', icon: Globe },
  { id: 'messenger', label: 'Messenger', icon: MessageSquare },
];

const WEBCHAT_SNIPPET = `<script>
  (function(w,d,s,o,f,js,fjs){
    w['AIgenciaLabObject']=o;
    w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','ailab','https://cdn.aigencialab.cl/widget.js'));
  ailab('init', { token: 'TU_EMBED_TOKEN_AQUI' });
</script>`;

export default function DocsInstalacionPage() {
  const [activeTab, setActiveTab] = useState('web');

  return (
    <MainLayout>
      <div className="bg-[#f8fafc] min-h-screen pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Guía de instalación</h1>
            <p className="text-slate-500">Configura tu agente IA en los canales que contrataste.</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === 'web' && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Instalación Webchat</h2>
                <p className="text-slate-500 text-sm mb-4">Agrega el agente IA a cualquier sitio web en menos de 5 minutos.</p>

                <div className="space-y-5">
                  {[
                    {
                      step: 1,
                      title: 'Obtén tu código de instalación',
                      content: 'Ve a Dashboard → Mis Agentes → [tu agente] → "Instalar en web". Tu token único ya está incluido en el código.',
                    },
                    {
                      step: 2,
                      title: 'Pega el código en tu sitio web',
                      content: 'Copia el siguiente snippet y pégalo justo antes del </body> en todas las páginas de tu sitio:',
                      code: WEBCHAT_SNIPPET,
                    },
                    {
                      step: 3,
                      title: 'Verifica la instalación',
                      content: 'El dashboard mostrará "Detectado en línea ✓" cuando el widget envíe su primera sesión. La verificación es automática.',
                    },
                  ].map(({ step, title, content, code }) => (
                    <div key={step} className="flex gap-4">
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">{step}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                        <p className="text-slate-500 text-sm mb-2">{content}</p>
                        {code && <CodeBlock code={code} />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="font-semibold text-blue-900 text-sm mb-1">✓ Compatible con</div>
                  <div className="flex flex-wrap gap-2">
                    {['HTML', 'WordPress', 'Shopify', 'Wix', 'Webflow', 'Next.js', 'Squarespace'].map(p => (
                      <span key={p} className="text-xs bg-white text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">{p}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Instalación WhatsApp Business</h2>
              <p className="text-slate-500 text-sm mb-6">Disponible en planes Starter, Pro y Enterprise.</p>
              <div className="space-y-5">
                {[
                  { step: 1, title: 'Proporciona tu número de WhatsApp Business', content: 'Durante la sesión de implementación, indícale a tu ingeniero asignado el número de WhatsApp Business dedicado. Debe ser un número exclusivo para el agente IA — no puede ser compartido con WhatsApp personal.' },
                  { step: 2, title: 'Conexión via Cloud API de Meta', content: 'El equipo de AIgenciaLab conecta la cuenta usando la WhatsApp Business Cloud API. No requiere acción técnica de tu parte.' },
                  { step: 3, title: 'Validación del número', content: 'En la primera sesión de implementación validamos el número. Meta envía un código de verificación al teléfono.' },
                  { step: 4, title: 'Agente activo', content: 'Una vez activo, el agente responde automáticamente los mensajes entrantes en ese número. Si también lo usa tu equipo, podemos configurar un horario de activación.' },
                ].map(({ step, title, content }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                      <p className="text-slate-500 text-sm">{content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'instagram' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-lg font-bold text-slate-900">Instalación Instagram DM</h2>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-200">BETA</span>
              </div>
              <p className="text-slate-500 text-sm mb-6">Disponible en planes Starter, Pro y Enterprise. Responde DMs de Instagram automáticamente.</p>
              <div className="space-y-5">
                {[
                  { step: 1, title: 'Cuenta Instagram Business requerida', content: 'Necesitas una cuenta de Instagram Business conectada a una Página de Facebook. Las cuentas personales o de creador no son compatibles con la API de Meta.' },
                  { step: 2, title: 'Autorización OAuth de Meta', content: 'En la sesión de implementación, inicia sesión con tu cuenta de Instagram Business desde el panel de AIgenciaLab. Autorizaremos los permisos: instagram_manage_messages, pages_messaging, instagram_basic.' },
                  { step: 3, title: 'El agente responde tus DMs', content: 'Una vez autorizado, el agente responde automáticamente los DMs de Instagram. Los comentarios en publicaciones están en el roadmap para Q3 2026.' },
                ].map(({ step, title, content }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                      <p className="text-slate-500 text-sm">{content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messenger' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Instalación Facebook Messenger</h2>
              <p className="text-slate-500 text-sm mb-6">Disponible en planes Pro y Enterprise. Requiere Página de Facebook con Messenger activo.</p>
              <div className="space-y-5">
                {[
                  { step: 1, title: 'Página de Facebook requerida', content: 'Necesitas una Página de Facebook (no perfil personal) con Messenger activo. El agente responderá en el Messenger de esa página.' },
                  { step: 2, title: 'Login con Facebook', content: 'En la sesión de implementación, iniciamos sesión con la cuenta de Facebook que administra la página. Solicitamos el permiso pages_messaging sobre la página seleccionada.' },
                  { step: 3, title: 'Respuesta automática activa', content: 'El agente IA responde automáticamente en el Messenger de tu página. Puedes configurar horarios y handoff a agentes humanos desde el dashboard.' },
                ].map(({ step, title, content }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{step}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                      <p className="text-slate-500 text-sm">{content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help CTA */}
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center gap-4">
            <MessageSquare className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-slate-900 mb-0.5">¿Necesitas ayuda con la instalación?</div>
              <div className="text-sm text-slate-500">Tu ingeniero asignado te acompaña en todo el proceso durante el período de implementación.</div>
            </div>
            <a
              href="https://wa.me/56912345678"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex-shrink-0"
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
