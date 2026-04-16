import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, Bot, Code, BarChart, Rocket, CheckCircle2, DollarSign, LayoutDashboard, Zap, ShieldCheck, Mail } from 'lucide-react';

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation (Simplified for landing) */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
              <span className="font-bold text-xl tracking-tight">AIgenciaLab <span className="text-blue-600">Partners</span></span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/contacto" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
                Contacto
              </Link>
              <Link href="/audit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm shadow-blue-600/20 transition-all hover:shadow-md hover:-translate-y-0.5">
                Convertirme en Partner
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-white opacity-70"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 ring-1 ring-inset ring-blue-600/20 mb-6">
              <Rocket className="w-4 h-4 mr-2" /> Partner Program 2026
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
              Evoluciona tu Agencia. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Vende Sistemas, no solo Webs.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Únete a AIgenciaLab como Growth Partner. Integra Agentes de IA autónomos en los proyectos de tus clientes y genera ingresos recurrentes pasivos (MRR) mes a mes, sin aumentar tu carga operativa.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="#comisiones" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all hover:scale-105 flex items-center justify-center">
                Ver Modelo de Comisiones <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="#escenarios" className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 px-8 py-4 rounded-full text-lg font-semibold transition-all flex items-center justify-center shadow-sm">
                Casos de Uso Conjuntos
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Visual Mockup */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-2xl p-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-12 bg-gray-50 border-b flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="mx-auto bg-white border rounded-md px-3 py-1 text-xs text-gray-400 w-64 text-center">Dashboard Partner</div>
            </div>
            <div className="pt-16 pb-8 px-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-90 grayscale-0 hover:grayscale-0 transition-all duration-500">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="text-blue-600 mb-2"><DollarSign className="w-8 h-8"/></div>
                <h3 className="font-bold text-gray-900 text-lg">MRR Generado</h3>
                <p className="text-3xl font-extrabold text-blue-700 mt-2">$2.450.000</p>
                <p className="text-sm text-blue-600 mt-2">↑ +$350k este mes</p>
              </div>
              <div className="bg-gray-50 border rounded-xl p-6">
                <div className="text-gray-600 mb-2"><Bot className="w-8 h-8"/></div>
                <h3 className="font-bold text-gray-900 text-lg">Licencias Activas</h3>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">14</p>
                <p className="text-sm text-gray-500 mt-2">Clientes retenidos</p>
              </div>
               <div className="bg-gray-50 border rounded-xl p-6">
                <div className="text-gray-600 mb-2"><Zap className="w-8 h-8"/></div>
                <h3 className="font-bold text-gray-900 text-lg">Leads Capturados (IA)</h3>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">8.402</p>
                <p className="text-sm text-gray-500 mt-2">En piloto automático</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem / Solution */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">El Mercado Cambió. Tu Agencia también debe hacerlo.</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Hoy los clientes no quieren solo una página web bonita o una campaña de Ads de muchos clics. Quieren una infraestructura capaz de convertir, cotizar y vender cuando ellos están durmiendo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Traditional Agency */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm opacity-80">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-6 font-bold text-xl">✗</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">La Agencia Tradicional</h3>
              <ul className="space-y-4">
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">✗</span> Vende sitios web estáticos (folletería digital).</li>
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">✗</span> Cobra un "Setup" único (One-off) y pierde al cliente.</li>
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">✗</span> Genera leads con Adds, pero el cliente los pierde porque su equipo tarda 24 hrs en responder.</li>
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">✗</span> Compite por precio en un mercado saturado de "creadores de webs".</li>
              </ul>
            </div>

            {/* AIgencia Partner */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl border border-blue-500 shadow-xl text-white transform md:-translate-y-2">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-white mb-6 font-bold text-xl backdrop-blur-sm">✓</div>
              <h3 className="text-2xl font-bold text-white mb-4">AIgencia Partner</h3>
              <ul className="space-y-4">
                <li className="flex items-start"><CheckCircle2 className="text-blue-300 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" /> Vende Máquinas de Conversión con Agentes 24/7.</li>
                <li className="flex items-start"><CheckCircle2 className="text-blue-300 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" /> Gana una comisión vitalicia MES A MES (MRR).</li>
                <li className="flex items-start"><CheckCircle2 className="text-blue-300 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" /> Conecta sus campañas a una IA en WhatsApp que responde en 2 segundos, multiplicando el ROAS.</li>
                <li className="flex items-start"><CheckCircle2 className="text-blue-300 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" /> Se diferencia entregando tecnología Deep Tech sin tener que programarla.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Escenarios de Colaboración */}
      <section id="escenarios" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">4 Modelos de Alianza Estratégica (Win/Win)</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl">Tú pones al cliente o el diseño, nosotros la autonomía inteligente. Elige la modalidad que se adapte perfectamente a los servicios que ya ofreces.</p>
          </div>

          <div className="space-y-6">
            
            {/* Model 4: El Nuevo (Top Priority for Marketing only agencies) */}
            <div className="group bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-1 shadow-md hover:shadow-2xl transition-all duration-300">
              <div className="bg-white rounded-xl p-8 h-full flex flex-col md:flex-row gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 font-semibold text-sm rounded-bl-xl z-10">Nuevo: 100% Core Marketing</div>
                <div className="md:w-1/3 flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <BarChart className="w-8 h-8"/>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Agencias de SEO y Marketing Digital Puro</h3>
                  <p className="text-blue-600 font-medium mt-2">Nosotros desarrollamos todo.</p>
                </div>
                <div className="md:w-2/3 space-y-4 text-gray-600">
                  <p>¿No haces desarrollo web o te quita mucho tiempo lidiar con servidores y código? Este es el modelo perfecto.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <span className="font-bold text-gray-900 block mb-1">Tu Agencia hace:</span>
                      El SEO, las pautas en Redes (Ads), la estrategia comercial y retienes la cuenta de Marketing del cliente.
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <span className="font-bold text-blue-900 block mb-1">AigenciaLab hace:</span>
                      Desarrollamos el Ecommerce o Sistema Web completo desde cero, e integramos la IA conversacional.
                    </div>
                  </div>
                  <p className="pt-2 font-medium text-gray-900">El Beneficio: Ganas comisiones por nuestro presupuesto de desarrollo, elevas el ticket de tus servicios de marketing al dirigir tráfico a una web de alta conversión y no tienes que tocar ni una sola línea de código.</p>
                </div>
              </div>
            </div>

            {/* Model 1: Landing Devs */}
            <div className="bg-white border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-8 group">
              <div className="md:w-1/3 flex-shrink-0">
                <div className="w-14 h-14 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-7 h-7"/>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Desarrollo de Sitios Corporativos y Landing Pages</h3>
              </div>
              <div className="md:w-2/3 space-y-3 text-gray-600 flex flex-col justify-center">
                <p>Tú creas el diseño web y UX con WordPress o código. Nosotros integramos un Agente Virtual que califica prospectos. Cuando un usuario pregunta "precio", el bot extrae su nombre, email y teléfono, e inyecta la oportunidad en el CRM de tu cliente automáticamente. Venderás "Funnels" en lugar de páginas sueltas.</p>
              </div>
            </div>

            {/* Model 2: E-commerce */}
            <div className="bg-white border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-8 group">
              <div className="md:w-1/3 flex-shrink-0">
                <div className="w-14 h-14 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-6">
                  <Bot className="w-7 h-7"/>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Creadores de E-Commerce (Shopify, WC)</h3>
              </div>
              <div className="md:w-2/3 space-y-3 text-gray-600 flex flex-col justify-center">
                <p>Armas la tienda online completa. Luego, conectas nuestro Agente IA que sincroniza el inventario en tiempo real. Este conserje responde preguntas de talla, ayuda a rastrear el despacho (Tracking) con Starken/Chilexpress y empuja el upselling recomendando productos relacionados dentro del chat, reduciendo abandonos de carrito.</p>
              </div>
            </div>

            {/* Model 3: Paid Media */}
            <div className="bg-white border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-8 group">
              <div className="md:w-1/3 flex-shrink-0">
                <div className="w-14 h-14 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7"/>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Agencias de Performance Ads</h3>
              </div>
              <div className="md:w-2/3 space-y-3 text-gray-600 flex flex-col justify-center">
                <p>Corres compañas en Meta y Google dirigiendo a WhatsApp. En lugar de que el equipo del cliente responda 4 horas tarde, nuestro Agente con WhatsApp Business API contesta en 3 segundos, agenda las llamadas en el calendario de tu cliente y descarta los leads curiosos. Tus reportes de ROAS subirán históricamente.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Comisiones y Negocio */}
      <section id="comisiones" className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Estructura de Comisiones Exclusivas</h2>
            <p className="mt-4 text-xl text-gray-400 max-w-3xl">Dos formas de ganar, tú decides si quieres ingresos pasivos de por vida o un ticket alto y rápido (Markup).</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Revenue Share Table */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-2 flex items-center"><DollarSign className="text-green-400 mr-2"/> Opción A: Revenue Share (MRR)</h3>
              <p className="text-gray-400 mb-8">El modelo de socios pasivos. Te llevas comisión mientras el cliente mantenga su suscripción en nuestra plataforma.</p>
              
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs uppercase bg-gray-900/50 text-gray-400 border-b border-gray-700">
                    <tr>
                      <th className="px-4 py-4">Plan AIgenciaLab</th>
                      <th className="px-4 py-4">% Comisión</th>
                      <th className="px-4 py-4">MRR Estimado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-white">Starter (Ref: $35k)</td>
                      <td className="px-4 py-4 text-blue-400 font-bold">20% Mes a Mes</td>
                      <td className="px-4 py-4 text-green-400">~$7.000 / mes</td>
                    </tr>
                     <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors bg-gray-800 text-white">
                      <td className="px-4 py-4 font-bold">Pro (Ref: $119k)</td>
                      <td className="px-4 py-4 text-blue-400 font-bold">25% Mes a Mes</td>
                      <td className="px-4 py-4 text-green-400">~$29.750 / mes</td>
                    </tr>
                     <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-white">Business (Ref: $259k)</td>
                      <td className="px-4 py-4 text-blue-400 font-bold">30% Mes a Mes</td>
                      <td className="px-4 py-4 text-green-400">~$77.700 / mes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-6 bg-blue-900/30 p-4 rounded-lg flex items-start">
                <div className="bg-blue-600 rounded-full w-6 h-6 flex justify-center items-center mr-3 mt-1 flex-shrink-0 font-bold text-sm">!</div>
                <p className="text-gray-300 text-sm">Escapa a la trampa del tiempo. <span className="font-bold text-white">10 clientes</span> en Plan Business generan casi <span className="font-bold text-green-400">$800.000 de renta pasiva neta mensual</span> para tu agencia.</p>
              </div>
            </div>

            {/* Markup Model */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl border border-blue-700 p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <ShieldCheck className="w-48 h-48" />
               </div>
              <h3 className="text-2xl font-bold mb-2 flex items-center relative z-10"><Code className="text-blue-300 mr-2"/> Opción B: Agencia (Marca Blanca / Markup)</h3>
              <p className="text-blue-100 mb-8 relative z-10">Para agencias que facturan proyectos corporativos completos (llave en mano).</p>
              
              <ul className="space-y-6 relative z-10">
                <li className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-800 border-2 border-blue-500 font-bold flex items-center justify-center mr-4 flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Descuento Partner (-30%)</h4>
                    <p className="text-blue-200 mt-1">Nosotros te cobramos el software directamente a ti con un descuento de por vida del 30% como partner mayorista.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-800 border-2 border-blue-500 font-bold flex items-center justify-center mr-4 flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Tú fijas tu Ticket Base (Setup)</h4>
                    <p className="text-blue-200 mt-1">Si le cobras al cliente un "Fee de Implementación de Inteligencia Artificial" de $500.000 - $1.000.000 CLP. Ese margen es 100% tuyo.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-800 border-2 border-blue-500 font-bold flex items-center justify-center mr-4 flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Control Total</h4>
                    <p className="text-blue-200 mt-1">Eres el dueño de la infraestructura y revendes el servicio bajo paraguas cerrado como parte de tus "mantenciones".</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Sandbox */}
      <section className="py-24 bg-white text-center px-4">
        <div className="max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-md">
             <Rocket className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Pruébalo Gratis en tu propia Agencia</h2>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Las grandes alianzas comienzan con transparencia. Para ser partner, primero te instalamos una cuenta Inteligente Pro de AIgenciaLab <span className="font-bold text-gray-900">en tu propia web 100% gratis</span>. Así aumentas la captación de tus propios leads de diseño/marketing y puedes usar tu sitio como DEMO en vivo para tus futuros clientes.
          </p>
          
          <div className="bg-gray-50 border rounded-2xl p-8 max-w-2xl mx-auto mb-10 shadow-sm text-left">
             <h3 className="font-bold text-lg text-gray-900 mb-4 border-b pb-2">Próximos Pasos de la Alianza</h3>
             <ul className="space-y-3 text-gray-700">
               <li className="flex items-center"><ChevronRight className="w-5 h-5 text-blue-500 mr-2"/> 1. Reunión rápida de 15 min de fit tecnológico.</li>
               <li className="flex items-center"><ChevronRight className="w-5 h-5 text-blue-500 mr-2"/> 2. Te entregamos tu ID de Partner y el Dashboard.</li>
               <li className="flex items-center"><ChevronRight className="w-5 h-5 text-blue-500 mr-2"/> 3. Configuramos la IA en la web de tu agencia.</li>
               <li className="flex items-center"><ChevronRight className="w-5 h-5 text-blue-500 mr-2"/> 4. Añadimos la propuesta de automatización en todas tus cotizaciones futuras.</li>
             </ul>
          </div>

          <a href="mailto:partners@aigencialab.cl" className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
            <Mail className="w-5 h-5 mr-3" /> Quiero ser Partner (Agendar Demo)
          </a>
        </div>
      </section>
      
      {/* Footer minimalista */}
       <footer className="bg-gray-50 py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} AIgenciaLab Partner Network.</p>
          <p className="mt-2">Arquitectura RAG local · Cumplimiento Ley N°19.628 de Protección de Datos.</p>
        </div>
      </footer>
    </div>
  );
}
