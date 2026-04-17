import type { Metadata } from 'next';
import Link from 'next/link';
import { MainLayout } from '@/components/landing/MainLayout';
import {
  MessageSquare, BarChart3, Zap, Globe, Bot, Users,
  Check, ChevronRight, Building2, ShoppingBag, HeartPulse, GraduationCap,
  Car, DollarSign, Coffee,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Plataforma — AIgenciaLab · Agentes IA para Empresas',
  description: 'Centraliza y automatiza todas tus conversaciones empresariales con agentes IA. Multicanal, con Connect, analytics y app móvil.',
};

const HOW_IT_WORKS = [
  {
    step: '01', icon: Globe, title: 'Captura y centraliza',
    desc: 'Todos los canales en una sola vista. WhatsApp, Instagram, Messenger y webchat unificados sin importar de dónde venga el mensaje.',
  },
  {
    step: '02', icon: Bot, title: 'Califica leads automáticamente',
    desc: 'La IA identifica oportunidades reales, separa consultas simples de oportunidades de venta, y prioriza las conversaciones que importan.',
  },
  {
    step: '03', icon: Zap, title: 'Ejecuta acciones con Connect',
    desc: 'CRM, calendario, pagos — sin intervención humana. El agente actualiza Salesforce, agenda en Google Calendar y consulta stock en Shopify.',
  },
  {
    step: '04', icon: BarChart3, title: 'Mide y optimiza',
    desc: 'Reportes de conversión y atribución reales. Sabe exactamente cuántos leads se convirtieron en ventas gracias al agente IA.',
  },
];

const SECTORS = [
  { icon: ShoppingBag, name: 'Retail / E-commerce', cases: ['Consultas de stock en tiempo real', 'Seguimiento de pedidos y envíos', 'Abandono de carrito por WhatsApp'] },
  { icon: Building2, name: 'Inmobiliaria', cases: ['Calificación de prospectos', 'Agenda de visitas a propiedades', 'Información de proyectos 24/7'] },
  { icon: HeartPulse, name: 'Clínicas / Salud', cases: ['Agendamiento de horas médicas', 'Recordatorios automáticos', 'FAQ médicas básicas'] },
  { icon: GraduationCap, name: 'Educación', cases: ['Proceso de admisión automatizado', 'Información de programas', 'Seguimiento de postulantes'] },
  { icon: Car, name: 'Automotriz', cases: ['Consultas de fichas técnicas', 'Solicitud de test drive', 'Postventa y garantías'] },
  { icon: DollarSign, name: 'Servicios financieros', cases: ['Consultas de productos', 'Precalificación de créditos', 'Soporte 24/7 sin fila'] },
  { icon: Coffee, name: 'Hostelería', cases: ['Reservas automatizadas', 'Información de menú y precios', 'Gestión de pedidos online'] },
  { icon: Users, name: 'Servicios profesionales', cases: ['Agenda de consultas', 'FAQ de servicios y tarifas', 'Calificación de inquiries'] },
];

export default function PlatformPage() {
  return (
    <MainLayout>
      <div className="bg-white min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-b from-[#0a0f1e] to-[#1e3a5f] pt-28 pb-20 px-6 text-white text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-500/30 mb-6">
              <Bot className="w-3.5 h-3.5" /> La plataforma de agentes IA para empresas chilenas
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Centraliza y automatiza todas tus<br />
              <span className="text-blue-400">conversaciones</span> en una plataforma
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
              AIgenciaLab orquesta agentes IA para que tu equipo convierta más,
              opere con menos fricción, y nunca pierda un lead.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/precios" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all">
                Ver planes y precios →
              </Link>
              <Link href="/agendar" className="bg-white/10 hover:bg-white/15 border border-white/20 text-white px-8 py-4 rounded-xl font-bold transition-all">
                Agendar demo
              </Link>
            </div>
          </div>
        </section>

        {/* Ecosystem — 3 modules */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            El ecosistema AIgenciaLab
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-2xl mx-auto">
            Tres módulos que trabajan juntos para que tu agente IA no solo responda preguntas — ejecute acciones reales.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'AIgenciaLab Core', icon: MessageSquare, color: 'blue', desc: 'Conversaciones + Calificación + Dashboard', items: ['Bandeja unificada multicanal', 'Calificación automática de leads', 'Historial completo de conversaciones', 'Dashboard de métricas en tiempo real'] },
              { title: 'AIgenciaLab Connect', icon: Zap, color: 'violet', desc: 'Integraciones + Automatizaciones + Flujos', items: ['150+ integraciones disponibles', 'Flujos no-code drag & drop', 'Playbooks listos para activar', 'Conexión con CRM, pagos y calendarios'] },
              { title: 'AIgenciaLab Analytics', icon: BarChart3, color: 'emerald', desc: 'Reportes + Atribución + Insights', items: ['Atribución de ingresos por agente', 'Gráficos de conversión por canal', 'Top preguntas frecuentes', 'Exportación de datos'] },
            ].map(({ title, icon: Icon, color, desc, items }) => {
              const colors: Record<string, string> = {
                blue:   'bg-blue-50 text-blue-600 border-blue-100',
                violet: 'bg-violet-50 text-violet-600 border-violet-100',
                emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
              };
              return (
                <div key={title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border mb-4 ${colors[color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-xs text-slate-500 mb-4">{desc}</p>
                  {items.map(item => (
                    <div key={item} className="flex items-start gap-2 text-sm text-slate-600 mb-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-[#f8fafc] py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              Cómo funciona
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }) => (
                <div key={step} className="bg-white border border-slate-200 rounded-2xl p-6 flex gap-4">
                  <div className="text-4xl font-black text-slate-100 leading-none flex-shrink-0">{step}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-slate-900">{title}</h3>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sectors */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            Dónde funciona AIgenciaLab
          </h2>
          <p className="text-slate-500 text-center mb-12">
            Casos de uso reales por sector de industria
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SECTORS.map(({ icon: Icon, name, cases }) => (
              <div key={name} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
                <Icon className="w-5 h-5 text-blue-600 mb-2" />
                <div className="font-semibold text-slate-900 text-sm mb-2">{name}</div>
                {cases.map(c => (
                  <div key={c} className="text-xs text-slate-500 mb-1 flex items-start gap-1">
                    <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-300" />
                    {c}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0a0f1e] py-20 px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            ¿Tu sector no está en la lista?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            AIgenciaLab se adapta a cualquier negocio que tenga conversaciones con clientes.
            Cuéntanos tu caso.
          </p>
          <Link href="/agendar" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all">
            Agendar una conversación →
          </Link>
        </section>
      </div>
    </MainLayout>
  );
}
