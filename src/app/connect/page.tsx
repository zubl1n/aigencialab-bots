import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/landing/MainLayout';
import { Zap, Check, ArrowRight, Database, Calendar, CreditCard, ShoppingCart, Bell, BarChart3, Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AIgenciaLab Connect — Integraciones No-Code para tu Agente IA',
  description: '150+ integraciones disponibles. Conecta tu agente IA con HubSpot, Salesforce, Google Calendar, Shopify, MercadoPago y más. Sin código.',
};

const INTEGRATIONS: { category: string; icon: typeof Database; items: string[] }[] = [
  { category: 'CRM', icon: Database, items: ['HubSpot', 'Salesforce', 'Zoho CRM', 'Pipedrive'] },
  { category: 'Calendarios', icon: Calendar, items: ['Google Calendar', 'Calendly', 'Microsoft Outlook', 'Cal.com'] },
  { category: 'Pagos', icon: CreditCard, items: ['MercadoPago', 'Stripe', 'Transbank WebPay', 'Flow Chile'] },
  { category: 'E-commerce', icon: ShoppingCart, items: ['Shopify', 'WooCommerce', 'Jumpseller', 'Bsale'] },
  { category: 'Notificaciones', icon: Bell, items: ['Slack', 'WhatsApp (nativo)', 'Email', 'Telegram'] },
  { category: 'Datos', icon: BarChart3, items: ['Google Sheets', 'Airtable', 'Notion', 'Excel Online'] },
];

const PLAYBOOKS = [
  { title: 'Lead → CRM automático', desc: 'Nuevo mensaje por WhatsApp → crear contacto en HubSpot + notificar a Slack', tags: ['WhatsApp', 'HubSpot', 'Slack'], time: '< 2 min activar' },
  { title: 'Consulta de stock live', desc: 'Cliente pregunta por producto → verificar stock en Shopify → responder disponibilidad', tags: ['Shopify', 'Webchat'], time: '< 2 min activar' },
  { title: 'Agendamiento inteligente', desc: 'Solicitud de reunión → verificar Google Calendar → proponer horarios → confirmar', tags: ['Google Calendar', 'WhatsApp'], time: '< 2 min activar' },
  { title: 'Recuperación de carrito', desc: 'Abandono de carrito detectado → mensaje WhatsApp a las 2h con enlace', tags: ['WooCommerce', 'WhatsApp'], time: '< 2 min activar' },
  { title: 'Lead calificado → Pipeline', desc: 'Lead calificado por IA → crear deal en Pipedrive + asignar al vendedor', tags: ['Pipedrive', 'Slack'], time: '< 2 min activar' },
  { title: 'Soporte post-venta', desc: 'Consulta de garantía o devolución → crear ticket + actualizar estado del pedido', tags: ['WooCommerce', 'Email'], time: '< 2 min activar' },
];

export default function ConnectPage() {
  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#0a0f1e] to-[#1e293b] pt-28 pb-20 px-6 text-white">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-violet-500/20 text-violet-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-500/30 mb-6">
              <Zap className="w-3.5 h-3.5" /> Módulo de Integraciones
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              AIgenciaLab{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-400">
                Connect
              </span>
            </h1>
            <p className="text-slate-300 text-xl mb-4">
              Conecta todos tus sistemas. Tu agente IA hace el resto.
            </p>
            <p className="text-slate-400 text-base max-w-2xl mx-auto mb-10">
              Sin código. Sin fricciones. Tu agente pasa de responder preguntas a ejecutar acciones reales
              en los sistemas que ya usas en tu empresa.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/precios" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all">
                Ver planes con Connect →
              </Link>
              <Link href="/agendar" className="bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all">
                Solicitar demo
              </Link>
            </div>
          </div>
        </section>

        {/* How it works — 3 steps */}
        <section className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Cómo funciona Connect
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Conecta tu sistema', desc: 'OAuth o API key. Sin código. En minutos tendrás HubSpot, Shopify o Google Calendar sincronizados con tu agente.' },
              { step: '2', title: 'Activa un Playbook', desc: 'Elige entre decenas de flujos prediseñados o crea el tuyo desde cero con el constructor visual.' },
              { step: '3', title: 'Tu agente ejecuta solo', desc: 'Cuando llega un mensaje, el agente detecta la intención y ejecuta las acciones definidas automáticamente.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-black text-xl">
                  {step}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Integration catalog */}
        <section className="bg-[#f8fafc] py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
              Integraciones disponibles
            </h2>
            <p className="text-slate-500 text-center mb-12">
              150+ conectores organizados por categoría.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {INTEGRATIONS.map(({ category, icon: Icon, items }) => (
                <div key={category} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{category}</span>
                  </div>
                  {items.map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-700 py-1 border-b border-slate-50 last:border-0">
                      <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Playbooks */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Playbooks listos para activar
          </h2>
          <p className="text-slate-500 text-center mb-12">
            Flujos de automatización prediseñados. Un clic y funcionan.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLAYBOOKS.map(({ title, desc, tags, time }) => (
              <div key={title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-slate-900 text-sm">{title}</h3>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex-shrink-0 ml-2">
                    <Play className="w-2.5 h-2.5" />
                    {time}
                  </div>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed mb-3">{desc}</p>
                <div className="flex flex-wrap gap-1">
                  {tags.map(tag => (
                    <span key={tag} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-[#0a0f1e] to-[#1e3a5f] py-20 px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            Connect está disponible desde el plan Starter
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            El plan Pro incluye Connect completo con más de 150 integraciones y el builder de flujos personalizado.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/precios" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all">
              Ver planes →
            </Link>
            <Link href="/agendar" className="bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all">
              Hablar con un experto
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
