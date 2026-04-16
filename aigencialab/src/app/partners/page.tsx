import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowRight, Bot, Code, BarChart, Rocket, CheckCircle2, DollarSign, LayoutDashboard, Zap, ShieldCheck } from 'lucide-react';
import PartnerForm from './PartnerForm';

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
              <Link href="#formulario-partner" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm shadow-blue-600/20 transition-all hover:shadow-md hover:-translate-y-0.5">
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
              <Rocket className="w-4 h-4 mr-2" /> Programa de Alianzas 2026
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
              Evoluciona tu Agencia. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Vende Sistemas, no solo Webs.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Suma Inteligencia Artificial (IA) a los proyectos de tus clientes. Como Agencia Partner, serás capaz de vender Agentes Automatizados, generando <strong className="text-gray-900">ingresos pasivos todos los meses</strong> sin tener que programar una sola línea.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="#comisiones" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transition-all hover:scale-105 flex items-center justify-center">
                Ver Modelo de Comisiones <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link href="#escenarios" className="bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 px-8 py-4 rounded-full text-lg font-semibold transition-all flex items-center justify-center shadow-sm">
                Cómo Trabajaríamos Juntos
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
              <div className="mx-auto bg-white border rounded-md px-3 py-1 text-xs text-gray-400 w-64 text-center">Tu Portal de Ganancias</div>
            </div>
            <div className="pt-16 pb-8 px-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-90 grayscale-0 hover:grayscale-0 transition-all duration-500">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="text-blue-600 mb-2"><DollarSign className="w-8 h-8"/></div>
                <h3 className="font-bold text-gray-900 text-lg">Ingreso Mensual Permanente</h3>
                <p className="text-3xl font-extrabold text-blue-700 mt-2">$2.450.000</p>
                <p className="text-sm text-blue-600 mt-2">↑ +$350k ganados automáticamente este mes</p>
              </div>
              <div className="bg-gray-50 border rounded-xl p-6">
                <div className="text-gray-600 mb-2"><Bot className="w-8 h-8"/></div>
                <h3 className="font-bold text-gray-900 text-lg">Clientes con IA Activa</h3>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">14</p>
                <p className="text-sm text-gray-500 mt-2">Empresas que confían en ti</p>
              </div>
               <div className="bg-gray-50 border rounded-xl p-6">
                <div className="text-gray-600 mb-2"><Zap className="w-8 h-8"/></div>
                <h3 className="font-bold text-gray-900 text-lg">Consultas Respondidas</h3>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">8.402</p>
                <p className="text-sm text-gray-500 mt-2">Tiempo ahorrado a tus clientes</p>
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
              Hoy los negocios en Chile no quieren solo una página web bonita o una campaña de Google Ads. Buscan algo que les garantice atender, vender y responder cuando ellos cierran la tienda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Traditional Agency */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm opacity-80">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600 mb-6 font-bold text-xl">✗</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">La Agencia Tradicional</h3>
              <ul className="space-y-4">
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">✗</span> Vende sitios web estáticos que no consiguen clientes reales.</li>
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">✗</span> Cobra un precio único una sola vez y luego pierde el contacto con el cliente.</li>
                <li className="flex items-start"><span className="text-red-500 mr-2 mt-1">✗</span> Genera tráfico con publicidad (Ads), pero el equipo del cliente tarda horas en responder y los posibles compradores se van.</li>
              </ul>
            </div>

            {/* AIgencia Partner */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl border border-blue-500 shadow-xl text-white transform md:-translate-y-2">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-white mb-6 font-bold text-xl backdrop-blur-sm">✓</div>
              <h3 className="text-2xl font-bold text-white mb-4">La Agencia del Futuro (Partner)</h3>
              <ul className="space-y-4">
                <li className="flex items-start"><CheckCircle2 className="text-blue-300 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" /> Vende sitios web que incluyen "Vendedores Digitales 24/7".</li>
                <li className="flex items-start"><CheckCircle2 className="text-blue-300 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" /> Gana una comisión todos los meses solo porque su cliente utiliza la tecnología IA de AIgenciaLab.</li>
                <li className="flex items-start"><CheckCircle2 className="text-blue-300 w-5 h-5 mr-3 mt-0.5 flex-shrink-0" /> Conecta los anuncios a un sistema de WhatsApp Automático que atiende a las personas en 3 segundos.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Escenarios de Colaboración */}
      <section id="escenarios" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tight">4 Formas de Trabajar y Ganar Juntos</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl">Tú traes al cliente o el diseño, nosotros la tecnología automática.</p>
          </div>

          <div className="space-y-6">
            
            {/* Model 4: El Nuevo (Top Priority) */}
            <div className="group bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-1 shadow-md hover:shadow-2xl transition-all duration-300">
              <div className="bg-white rounded-xl p-8 h-full flex flex-col md:flex-row gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 font-semibold text-sm rounded-bl-xl z-10">Nuevo: Alianza Win / Win Total</div>
                <div className="md:w-1/3 flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                    <BarChart className="w-8 h-8"/>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Agencias de SEO y Marketing Digital Puro</h3>
                  <p className="text-blue-600 font-medium mt-2">No programes nada. Nosotros hacemos todo el trabajo técnico.</p>
                </div>
                <div className="md:w-2/3 space-y-4 text-gray-600">
                  <p>¿Tú agencia no hace desarrollo de sitios web y prefieres enfocar tu tiempo en Estrategia Asesora o Pauta Publicitaria? Este es el modelo perfecto.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <span className="font-bold text-gray-900 block mb-1">Tu Agencia se enfoca en:</span>
                      Realizar el SEO, lanzar publicidad (Meta/Google), mejorar el posicionamiento comercial y mantener el control sobre la cuenta de tu cliente.
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <span className="font-bold text-blue-900 block mb-1">AigenciaLab se encarga de:</span>
                      Construir el sitio web profesional o Ecommerce completo e integrar todos los elementos Chatbots e IA Avanzada que el cliente necesite.
                    </div>
                  </div>
                  <p className="pt-2 font-medium text-gray-900">El Beneficio final: Puedes cobrar a tu cliente un proyecto informático avanzado gigante sin tener un equipo de programación, y retienes la venta de tus servicios recurrentes mensuales de Marketing dirigiendo tráfico a una web potente.</p>
                </div>
              </div>
            </div>

            {/* Model 1: Landing Devs */}
            <div className="bg-white border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-8 group">
              <div className="md:w-1/3 flex-shrink-0">
                <div className="w-14 h-14 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-7 h-7"/>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Desarrollo Web (Sitios en WordPress o similares)</h3>
              </div>
              <div className="md:w-2/3 space-y-3 text-gray-600 flex flex-col justify-center">
                <p>Tú creas todo el diseño de la web para el cliente. Nosotros solo te pasamos una línea de código muy fácil de insertar que activará a nuestro Agente Inteligente. Este agente obtendrá el nombre y WhatsApp de quienes visiten la web y los mandará a su correo. Así venderás mucho más caro tu servicio afirmando que "incluye automatización".</p>
              </div>
            </div>

            {/* Model 2: E-commerce */}
            <div className="bg-white border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-8 group">
              <div className="md:w-1/3 flex-shrink-0">
                <div className="w-14 h-14 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-6">
                  <Bot className="w-7 h-7"/>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Diseñadores de Tiendas Virtuales (Shopify, Jumpseller)</h3>
              </div>
              <div className="md:w-2/3 space-y-3 text-gray-600 flex flex-col justify-center">
                <p>Armas la tienda online donde la gente va a comprar, y le agregas nuestro Conserje Inteligente. Ayudará en tiempo real al usuario de la tienda a ver sus despachos de Chilexpress/Starken, resolver devoluciones y ayudar a decidir tallas.</p>
              </div>
            </div>

            {/* Model 3: Paid Media */}
            <div className="bg-white border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row gap-8 group">
              <div className="md:w-1/3 flex-shrink-0">
                <div className="w-14 h-14 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7"/>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Agencias de Anuncios y RRSS</h3>
              </div>
              <div className="md:w-2/3 space-y-3 text-gray-600 flex flex-col justify-center">
                <p>Toda la gente que hace clic en tus avisos (Ads) llegarán a un WhatsApp oficial. Allí, nuestra tecnología les dará bienvenida instantánea (en la misma madruga), filtrará quién tiene dinero real y agendará la reunión de forma solitaria para la empresa de tu cliente.</p>
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
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Detalle de las Ganancias: Negocio Claro</h2>
            <p className="mt-4 text-xl text-gray-400 max-w-3xl">Queremos claridad financiera. Te ofrecemos dos alternativas dependiendo del margen económico que busques.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Revenue Share Table */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold mb-2 flex items-center"><DollarSign className="text-green-400 mr-2"/> Opción A: Comisión por Referido Constante</h3>
              <p className="text-gray-400 mb-8">Tú recomiendas directamente a AigenciaLab de forma transparente al cliente, y te pagamos para siempre.</p>
              
              <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs uppercase bg-gray-900/50 text-gray-400 border-b border-gray-700">
                    <tr>
                      <th className="px-4 py-4">Suscripción Vendida</th>
                      <th className="px-4 py-4">Te Llevas (Tu Pago)</th>
                      <th className="px-4 py-4">Ingreso Extra para Ti</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-white">Starter (Ej: $35.000)</td>
                      <td className="px-4 py-4 text-blue-400 font-bold">20% Mes a Mes</td>
                      <td className="px-4 py-4 text-green-400">~$7.000 sin hacer nada</td>
                    </tr>
                     <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors bg-gray-800 text-white">
                      <td className="px-4 py-4 font-bold">Pro (Ej: $119.000)</td>
                      <td className="px-4 py-4 text-blue-400 font-bold">25% Mes a Mes</td>
                      <td className="px-4 py-4 text-green-400">~$29.750 sin hacer nada</td>
                    </tr>
                     <tr className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-white">Business (Ej: $259.000)</td>
                      <td className="px-4 py-4 text-blue-400 font-bold">30% Mes a Mes</td>
                      <td className="px-4 py-4 text-green-400">~$77.700 sin hacer nada</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mt-6 bg-blue-900/30 p-4 rounded-lg flex items-start">
                <div className="bg-blue-600 rounded-full w-6 h-6 flex justify-center items-center mr-3 mt-1 flex-shrink-0 font-bold text-sm">!</div>
                <p className="text-gray-300 text-sm">Escala fácilmente. Invita a <span className="font-bold text-white">10 clientes corporativos</span> a subirse al sistema con el Plan Business y recibirás todos los meses un sueldo o renta extra de <span className="font-bold text-green-400">~$800.000 CLP</span> libres para tu empresa.</p>
              </div>
            </div>

            {/* Markup Model */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 rounded-2xl border border-blue-700 p-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <ShieldCheck className="w-48 h-48" />
               </div>
              <h3 className="text-2xl font-bold mb-2 flex items-center relative z-10"><Code className="text-blue-300 mr-2"/> Opción B: Tu Propio Recargo (Marca Blanca)</h3>
              <p className="text-blue-100 mb-8 relative z-10">Tú le cobras la totalidad del proyecto informático a la empresa (al monto que elijas), y subcontratas por debajo nuestro sistema de software de IA.</p>
              
              <div className="space-y-6 relative z-10">
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                  <h4 className="font-bold text-blue-400 border-b border-gray-700 pb-2 mb-3">¿Cómo se reparten las ganancias minuciosamente?</h4>
                  
                  <div className="mb-4">
                    <p className="font-bold text-white flex justify-between">
                      <span>🏦 Lo que gana AIgenciaLab:</span>
                    </p>
                    <p className="text-gray-300 text-sm mt-2">
                       AIgenciaLab le cobrará siempre a tu Agencia el <strong className="text-white">80%</strong> del costo mensual de mantenimiento del plan base (nuestro costo por entregar la arquitectura y servidores), y aplicará un 20% de descuento vitalicio para ti por tu cuenta mayorista. Nosotros ganamos en volumen y al asegurar la estabilidad del servidor a largo plazo.
                    </p>
                  </div>

                  <div className="bg-blue-900/40 p-3 rounded-lg border border-blue-600/50">
                    <p className="font-bold text-green-400 flex justify-between">
                      <span>🚀 Tus Enormes Ganancias (Agencia Partner):</span>
                    </p>
                    <p className="text-gray-200 text-sm mt-2 leading-relaxed">
                      Como Agencia Marca Blanca, la verdadera ganancia está en la "Implementación Única" o <strong className="text-white">Setup</strong> que tú decidas cobrarles por armar el proyecto. <br/><br/>
                      <strong>Ejemplo real:</strong><br/>
                      1. Cobraste un costo de implementación por valor de $800.000 (Eso es <strong className="text-green-400">100% ganancia que queda en tu bolsillo</strong>).<br/>
                      2. Le firmas al cliente un mantenimiento de $150.000 mes. Nosotros solo te pedimos la licencia original con nuestro 20% de descuento para partners. Ese margen o sobrante superior, es <strong className="text-green-400">exclusivo a favor de tu Agencia</strong>.<br/><br/>
                      Tú fijas tus reglas porque tú eres el dueño de su cuenta maestra.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Sandbox */}
      <section className="py-24 bg-white text-center px-4 relative">
        <div className="max-w-4xl mx-auto mb-16">
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-md">
             <Rocket className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Pruébalo Gratis en y veamos cómo aumentar tus ventas</h2>
          <p className="text-xl text-gray-600 leading-relaxed text-center">
            Para iniciar nuestra alianza, instalaremos y activaremos tu primer Agente Autónomo Pro en la propia web de tu negocio, <span className="font-bold text-gray-900">completamente gratis</span>. Comienza completando este formato y contactaremos contigo de forma directa.
          </p>
        </div>

        {/* El Formulario Client-Side */}
        <PartnerForm />
        
      </section>
      
      {/* Footer minimalista */}
       <footer className="bg-gray-50 py-12 border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} AIgenciaLab Partner Network.</p>
          <p className="mt-2">Servicios Protegidos · Cumplimiento Ley Chile N°19.628 de Protección de Datos Personales.</p>
        </div>
      </footer>
    </div>
  );
}
