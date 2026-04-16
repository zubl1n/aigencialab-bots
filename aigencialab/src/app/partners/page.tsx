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
              <div className="bg-white rounded-xl p-8 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 font-semibold text-sm rounded-bl-xl z-10">Nuevo: Alianza Win / Win Total</div>
                <div className="flex flex-col md:flex-row gap-8 mb-6">
                  <div className="md:w-1/3 flex-shrink-0">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                      <BarChart className="w-8 h-8"/>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Agencias de SEO y Marketing Digital Puro (PyMEs)</h3>
                    <p className="text-blue-600 font-medium mt-2">No programes nada. Nosotros somos tu brazo técnico.</p>
                  </div>
                  <div className="md:w-2/3 space-y-4 text-gray-600">
                    <p>¿Tienes una agencia o PyME de Marketing Digital enfocado en posicionamiento (SEO), redes sociales o publicidad, pero <strong>no quieres lidiar con el código ni servidores</strong>? Este ecosistema está diseñado para ti.</p>
                    <p>En lugar de perder negocios porque "no haces sitios web complejos", puedes ofrecer un paquete integral premium. Nosotros construimos un Desarrollo Web Completo optimizado + IA (Chatbots, RAG, automatizaciones), y tú sigues vendiendo tus servicios sobre una plataforma mucho más potente.</p>
                  </div>
                </div>

                {/* Expanded Monetization Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">3 Formas de Multiplicar tus Ganancias (Sin programar):</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 1. Setup Informático</div>
                      <p className="text-sm text-gray-600">Nosotros fijamos un costo mayorista por construir la web y la IA. Tú le cobras a tu cliente un "Fee de Desarrollo" muy superior. Toda la diferencia o recargo es <strong>100% tu ganancia directa</strong>.</p>
                      <div className="mt-3 text-xs font-mono font-bold bg-green-50 border-l-4 border-green-500 text-green-800 p-2 rounded">Ej: Vendes a $1.000.000, nos pagas $300.000, te ganas $700.000 libres.</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 2. Retención y SEO / GEO</div>
                      <p className="text-sm text-gray-600">Te entregamos páginas con <em>Generative Engine Optimization (GEO)</em> y Schema Markup. Esto eleva los resultados de tu servicio mensual de SEO, justificando que cobres <strong>Retainers más caros</strong> por tu excelente posicionamiento.</p>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 3. MRR de Mantenimiento IA</div>
                      <p className="text-sm text-gray-600">Puedes cobrarle al cliente una póliza mensual por "Entrenamiento y mantenimiento del Bot", mientras nosotros nos encargamos del servidor. Creas un ingreso pasivo gigante (MRR).</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model 1: Landing Devs */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-1 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="bg-white rounded-xl p-6 lg:p-8 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gray-900 text-white px-4 py-1 font-semibold text-sm rounded-bl-xl z-10">Alianza: Desarrollo Web</div>
                <div className="flex flex-col md:flex-row gap-8 mb-6">
                  <div className="md:w-1/3 flex-shrink-0">
                    <div className="w-14 h-14 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-6">
                      <LayoutDashboard className="w-7 h-7"/>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Diseñadores de Sitios Web (WordPress / Wix)</h3>
                    <p className="text-gray-600 font-medium mt-2">Construye la fachada, nosotros ponemos el vendedor.</p>
                  </div>
                  <div className="md:w-2/3 space-y-4 text-gray-600">
                    <p>Si tu negocio core es construir webs para abogados, clínicas o empresas de servicios, sabes que el cliente siempre se queja de "mi web nueva no me trae clientes". Esto cambia hoy.</p>
                    <p>Tú creas el diseño web y UX. Nosotros te entregamos una <strong>sola línea de código segura (Script)</strong>. Al pegarla, despliegas un Agente Virtual que califica prospectos. Si el usuario pregunta "precio", el bot extrae su nombre, email y teléfono, e inyecta la oportunidad en el correo de tu cliente automáticamente.</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">3 Formas de Monetizar este Modelo:</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 1. Upsell de "Sitio Inteligente"</div>
                      <p className="text-sm text-gray-600">Puedes cobrar fácilmente un <strong>30% o 50% extra</strong> sobre la cotización de tu página web simplemente argumentando que estás entregando un "Sistema Automatizado de Ventas" y no solo un brochure digital estático.</p>
                      <div className="mt-3 text-xs font-mono font-bold bg-green-50 border-l-4 border-green-500 text-green-800 p-2 rounded">Ej: Web de $600.000 sube a $900.000 reales (+ $300.000 directos).</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 2. Consultoría en CRM</div>
                      <p className="text-sm text-gray-600">Además de la web, puedes cobrar un <em>Setup</em> adicional por "integrar" los correos o el Excel del cliente con la IA, actuando como su asesor tecnológico de confianza.</p>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 3. Licencia a tu Nombre</div>
                      <p className="text-sm text-gray-600">Usas nuestra cuenta de agencia (descuento del 20%) y tú le cobras al cliente directamente por el mantenimiento mensual de su chatbot de leads.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model 2: E-commerce */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-1 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="bg-white rounded-xl p-6 lg:p-8 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 font-semibold text-sm rounded-bl-xl z-10">Alianza: E-Commerce</div>
                <div className="flex flex-col md:flex-row gap-8 mb-6">
                  <div className="md:w-1/3 flex-shrink-0">
                    <div className="w-14 h-14 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-6">
                      <Bot className="w-7 h-7"/>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Creadores de Tiendas (Shopify, Jumpseller)</h3>
                    <p className="text-blue-600 font-medium mt-2">Armas el catálogo, la IA reduce abandonos de carrito.</p>
                  </div>
                  <div className="md:w-2/3 space-y-4 text-gray-600">
                    <p>El mayor dolor de cabeza de quien te compra un eCommerce es coordinar despachos y responder "cuánto cuesta el envío". Tú puedes eliminarle ese problema de raíz.</p>
                    <p>Armas la tienda online donde la gente va a comprar, y le agregas nuestro <strong>Agente Experto IA</strong>. Este sistema ayudará en tiempo real al usuario de la tienda a consultar el estado de despacho (tracking), resolver devoluciones automáticas y asistir en decisiones de tallas.</p>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 mt-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 border-b border-blue-200 pb-2">3 Formas de Monetizar la Tienda:</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 1. Módulo "Atención Automática"</div>
                      <p className="text-sm text-gray-600">En tu propuesta de diseño de tienda, incluyes como ítem de lujo la "Burbuja de Inteligencia Comercial", aumentando instantáneamente el Ticket Final (Setup) del E-commerce.</p>
                      <div className="mt-3 text-xs font-mono font-bold bg-green-50 border-l-4 border-green-500 text-green-800 p-2 rounded">Ej: Tienda Shopify de $800k cierra en $1.2M (+ $400.000 íntegros).</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 2. Fee de Actualización de Catálogo</div>
                      <p className="text-sm text-gray-600">La ropa o los productos cambian por temporada. El cliente necesitará que alguien nutra la base de datos de la IA con el nuevo catálogo (Prompts). <strong>Ese Retainer te lo pagarán a ti</strong>.</p>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 3. Upselling cruzado (CRO)</div>
                      <p className="text-sm text-gray-600">La IA actúa como un agente de ventas persistente para recuperar clientes. Si la tienda sube su tasa de conversión gracias al bot, la retención de la agencia se dispara, justificando tarifas premium por tu servicio.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model 3: Paid Media */}
            <div className="group bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-1 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="bg-white rounded-xl p-6 lg:p-8 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 font-semibold text-sm rounded-bl-xl z-10">Alianza: Performance / Ads</div>
                <div className="flex flex-col md:flex-row gap-8 mb-6">
                  <div className="md:w-1/3 flex-shrink-0">
                    <div className="w-14 h-14 bg-gray-100 text-gray-900 rounded-xl flex items-center justify-center mb-6">
                      <Zap className="w-7 h-7"/>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Agencias de Tráfico Pago (Meta, Google, Tiktok)</h3>
                    <p className="text-green-600 font-medium mt-2">Deja de desperdiciar conversiones por culpa del cliente.</p>
                  </div>
                  <div className="md:w-2/3 space-y-4 text-gray-600">
                    <p>Sabemos la frustración: Tu agencia genera miles de leads altamente calificados con las campañas, pero llegan al WhatsApp del cliente y su equipo humano demora 12 horas en responder. El lead se enfría, se pierde la venta y le echan la culpa a "la mala calidad del anuncio" (ROAS falsamente bajo).</p>
                    <p><strong>Solución:</strong> Todo el tráfico de tus Ads aterrizará primero en nuestra <strong>IA en WhatsApp Oficial</strong>. Dará la bienvenida en 3 segundos (incluso de madrugada), perfilará si el lead tiene capacidad económica, y automáticamente agendará una reunión en el calendario de la empresa solo a los que sirven.</p>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-4">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">3 Formas de Ganar con Tráfico Automatizado:</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 1. Retención Inquebrantable</div>
                      <p className="text-sm text-gray-600">Al demostrarle al cliente un ROAS (Retorno) 3x superior porque los leads sí se cierran en caliente, renovarán tu agencia de Ads todos los meses sin rechistar.</p>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 2. Venta del Embudo (Funnel Setup)</div>
                      <p className="text-sm text-gray-600">A tu tarifa mensual de campañas o de Community Management, puedes cobrarle adicionalmente un espectacular "Costo de Desarrollo de Embudo Inteligente en WhatsApp".</p>
                      <div className="mt-3 text-xs font-mono font-bold bg-green-50 border-l-4 border-green-500 text-green-800 p-2 rounded">Ej: Extra de +$500.000 por integrar Ads al Bot Oficial de WhatsApp.</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1 flex items-center"><DollarSign className="w-4 h-4 text-green-500 mr-1"/> 3. Participación en Ingresos IA</div>
                      <p className="text-sm text-gray-600">Si tu cliente empieza a consumir miles de mensajes IA para soportar tus Ads virales, tú recibes mes a mes tu 20% a 30% recurrente sobre el plan Enterprise de AIgenciaLab.</p>
                    </div>
                  </div>
                </div>
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
              
              <div className="space-y-6 relative z-10 mt-6">
                <div className="bg-gray-900/80 p-6 rounded-2xl border border-blue-500/30">
                  <h4 className="font-extrabold text-blue-400 border-b border-gray-700 pb-3 mb-6 text-xl">Ejemplo Visual de Ganancias: El Escenario Real</h4>
                  
                  <div className="space-y-8">
                    {/* Step 1: El Setup */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-300 font-semibold flex items-center">
                          <span className="bg-gray-700 text-white w-6 h-6 rounded flex items-center justify-center mr-2">1</span> 
                          Tú cobras el Proyecto Completo Inicial (Setup)
                        </span>
                        <span className="text-green-400 font-extrabold text-lg">$800.000 CLP</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-4 shadow-inner">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-4 rounded-full relative" style={{ width: '100%' }}>
                           <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">100% PARA TU AGENCIA</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">La totalidad de la ganancia por implementación e intermediación entra pura a la cuenta de tu empresa. Nosotros no tocamos ni comisionamos este dinero inicial gigante.</p>
                    </div>

                    <div className="border-t border-gray-700 pb-2 pt-2"></div>

                    {/* Step 2: MRR */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-300 font-semibold flex items-center">
                           <span className="bg-gray-700 text-white w-6 h-6 rounded flex items-center justify-center mr-2">2</span> 
                           Le facturas la Mensualidad (Mantenimiento IA)
                        </span>
                        <span className="text-white font-extrabold text-lg">$150.000 CLP <span className="text-xs text-gray-500 font-normal">/ Mes</span></span>
                      </div>
                      
                      {/* Visual Split Bar */}
                      <div className="flex w-full h-8 rounded-full overflow-hidden mt-3 border border-gray-700 shadow-2xl">
                        <div className="bg-gradient-to-r from-blue-700 to-indigo-600 flex items-center justify-center text-xs font-bold text-white px-2" style={{ width: '18.6%' }}>
                          $28k
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-900 px-2" style={{ width: '81.4%' }}>
                          Tu Ganancia Directa Mensual (MRR): $122.000 CLP
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700/80">
                          <p className="text-[10px] text-blue-300 uppercase tracking-widest font-bold">Costo Mayorista Software</p>
                          <div className="flex items-center gap-3 mt-1 mb-2">
                             <p className="text-lg font-bold text-gray-500 line-through decoration-red-500/70">$35.000</p>
                             <p className="text-3xl font-extrabold text-blue-400">$28.000</p>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed mb-3">Se te otorga un <span className="text-blue-300 font-bold bg-blue-900/30 px-1 py-0.5 rounded">20% de Descuento Especial</span> sobre el precio original mensual. AIgenciaLab solo retiene este monto base para garantizar servidores mundiales sin caídas.</p>
                          <div className="bg-red-900/30 border border-red-500/30 rounded px-2 py-1 inline-block text-[10px] text-red-300 uppercase tracking-widest font-bold mb-1">Importante: KPI Requerido</div>
                          <p className="text-xs text-gray-400 leading-relaxed">Para optar y mantener esta Licencia Mayorista de Marca Blanca, la Agencia <span className="text-red-300 font-semibold">será evaluada bajo KPIs reales</span>. Se exige un compromiso de mantener un <strong>mínimo mensual activo de cuentas</strong> con nosotros.</p>
                        </div>
                        
                        <div className="bg-green-900/10 p-4 rounded-xl border border-green-500/30 relative overflow-hidden">
                          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full blur-xl"></div>
                          <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold">Tu Mensualidad Pasiva Neta</p>
                          <p className="text-3xl font-extrabold text-green-400 mt-1 mb-2">$122.000 <span className="text-sm font-normal text-green-500">/ mes</span></p>
                          <p className="text-xs text-gray-400 leading-relaxed">Multiplica esto por 10 clientes fidelizados en tu cartera y tendrás un sueldo gratis automático de <span className="text-white font-bold">$1.220.000 CLP directos</span>, sin programar nada.</p>
                        </div>
                      </div>
                    </div>
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
