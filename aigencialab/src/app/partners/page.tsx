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
            {/* Model 4: El Nuevo (Top Priority) */}
            <div className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-1 shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-500">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl opacity-20 group-hover:opacity-100 blur transition duration-500"></div>
              <div className="bg-white rounded-[22px] p-8 lg:p-10 relative overflow-hidden h-full z-10">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2 font-bold text-sm rounded-bl-2xl shadow-lg flex items-center">
                   <Zap className="w-4 h-4 mr-2 text-yellow-300 animate-pulse"/> 
                   🌟 Estrella: Alianza Win/Win Total
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 mb-8 mt-4">
                  <div className="md:w-1/3">
                    <div className="w-20 h-20 bg-blue-50/80 ring-1 ring-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner transform group-hover:scale-110 transition-transform duration-500">
                      <BarChart className="w-10 h-10"/>
                    </div>
                    <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">Agencias SEO & Marketing Integral</h3>
                    <div className="flex gap-2 mt-3">
                       <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Cero Código</span>
                       <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Alta Retención</span>
                    </div>
                  </div>
                  <div className="md:w-2/3 space-y-5 text-gray-600 leading-relaxed text-lg pt-2">
                    <p>¿Tu fuerte es el posicionamiento o el diseño, pero <strong>huyes de la programación compleja o de servidores</strong>? Te estás perdiendo clientes corporativos que piden "Sistemas Integrales".</p>
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <p className="text-gray-900 font-medium"><strong className="text-blue-700">La Solución:</strong> Nosotros operamos como tu "Departamento Técnico Fantasma". Elaboramos desarrollos web de lujo inyectados con Inteligencia Artificial. Tú pones la marca de tu Agencia frontalmente ante el cliente, y nosotros armamos la maquinaria detrás.</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between bg-gray-900 rounded-xl p-6 mb-8 text-white relative overflow-hidden shadow-inner">
                  <div className="text-center z-10 w-full sm:w-auto">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Tú consigues</div>
                    <div className="font-bold text-lg text-blue-300">Cliente Alto Valor</div>
                  </div>
                  <ArrowRight className="text-gray-600 my-2 sm:my-0 z-10 w-6 h-6 hidden sm:block"/>
                  <div className="text-center z-10 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Nosotros Creamos</div>
                    <div className="font-bold text-lg text-purple-300">Ecosistema IA + Web</div>
                  </div>
                  <ArrowRight className="text-gray-600 my-2 sm:my-0 z-10 w-6 h-6 hidden sm:block"/>
                  <div className="text-center z-10 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Tu Agencia cobra</div>
                    <div className="font-bold text-2xl text-green-400">100% Ganancia Inicial</div>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
                  <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex justify-center items-center mr-3 text-sm shadow-md">💰</span> 
                    3 Motores de Facturación Directa:
                  </h4>
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="group/item hover:bg-white p-5 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-xl flex flex-col">
                      <div className="font-bold text-gray-900 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-green-500 mr-1"/> 1. Setup Informático</div>
                      <p className="text-sm text-gray-600 mb-4 flex-1">Marcamos un valor base muy atractivo para ti. Todo el excedente abismal que le cobres al cliente por "Desarrollo Digital IA" entra limpio a tu empresa.</p>
                      <div className="mt-4 text-xs font-mono font-bold bg-green-50 border border-green-200 shadow-inner text-green-800 p-3 flex flex-col gap-1 rounded-lg"><div>Ej: Vendes Proy. $1.000.000</div><div>Nos transfieres $300.000</div><div className="text-sm text-green-600 mt-1">👉 Te ganas libres $700.000.</div></div>
                    </div>
                    <div className="group/item hover:bg-white p-5 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-xl flex flex-col">
                      <div className="font-bold text-gray-900 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-green-500 mr-1"/> 2. Retención SEO y GEO</div>
                      <p className="text-sm text-gray-600 mb-4 flex-1">Te entregamos una web que responde usando Generative Engine Optimization (GEO). Al subir el PageRank, avalas subir tus honorarios mensuales de agencia al cliente.</p>
                    </div>
                    <div className="group/item hover:bg-white p-5 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-xl flex flex-col">
                      <div className="font-bold text-gray-900 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-green-500 mr-1"/> 3. MRR de Mantenimiento</div>
                      <p className="text-sm text-gray-600 mb-4 flex-1">Firma un contrato Retainer de soporte mensual a tu propio precio, usando en secreto nuestra cuenta mayorista que opera el servidor para ti.</p>
                      <div className="mt-4 text-xs font-mono font-bold bg-green-50 border border-green-200 shadow-inner text-green-800 p-3 flex flex-col gap-1 rounded-lg"><div>Ej: Retainer $150.000 cobrado</div><div>Costo Servidor: $28.000</div><div className="text-sm text-green-600 mt-1">👉 Margen MRR: $122k/mes.</div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model 1: Landing Devs */}
            {/* Model 1: Landing Devs */}
            <div className="group relative bg-white border border-gray-200 rounded-3xl p-1 shadow-sm hover:shadow-2xl transition-all duration-500 mt-8">
              <div className="bg-white rounded-[22px] p-8 lg:p-10 relative overflow-hidden h-full z-10 border border-gray-100">
                <div className="absolute top-0 right-0 bg-gray-900 text-white px-6 py-2 font-bold text-sm rounded-bl-2xl shadow-lg">
                   Especialización: Diseño Web
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 mb-8 mt-4">
                  <div className="md:w-1/3">
                    <div className="w-20 h-20 bg-gray-50 ring-1 ring-gray-200 text-gray-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm transform group-hover:rotate-3 transition-transform duration-500">
                      <LayoutDashboard className="w-10 h-10"/>
                    </div>
                    <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">Diseñadores de Sitios (WordPress, Wix, Framer)</h3>
                    <div className="flex gap-2 mt-3">
                       <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">1 Línea de Código</span>
                    </div>
                  </div>
                  <div className="md:w-2/3 space-y-5 text-gray-600 leading-relaxed text-lg pt-2">
                    <p>Si construyes webs estáticas para empresas de servicios, seguro te ha pasado que un par de meses después el cliente se frustra: <em>"La web no me trae gente nueva, nadie me contacta"</em>.</p>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 relative overflow-hidden shadow-sm">
                       <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                      <p className="text-gray-900 font-medium tracking-tight">Cobra muchísimo más caro armando la misma web hermosa de siempre, pero añadiéndole la <strong className="text-blue-600">Línea de Código Mágica</strong>. Inyectas nuestro script en 1 minuto, y tu página web creada se vuelve un agente vivo 24/7 recogiendo y enviando datos directamente al WhatsApp/CRM de tu cliente.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600 rounded-2xl p-1 mb-8 shadow-inner overflow-hidden flex flex-col md:flex-row gap-1">
                  <div className="bg-blue-700/80 p-6 text-white w-full md:w-1/3 flex flex-col justify-center items-center text-center">
                    <span className="text-5xl font-black mb-1 drop-shadow-md">300%</span>
                    <span className="text-xs uppercase font-bold text-blue-200 tracking-widest mt-1 text-center leading-tight">Aumento en<br/>Precio de Venta</span>
                  </div>
                  <div className="bg-white flex-1 p-6 md:p-8 rounded-r-xl flex items-center relative gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                      <div className="h-3 bg-gray-100 rounded-full w-2/3"></div>
                      <div className="h-3 bg-gray-100 rounded-full w-1/2"></div>
                    </div>
                    <div>
                      <div className="bg-blue-50 border border-blue-100 text-blue-800 text-sm font-bold px-4 py-3 rounded-2xl rounded-tr-none shadow-md whitespace-nowrap animate-bounce"><Bot className="w-4 h-4 inline mr-2 text-blue-600"/> "¡Hola! ¿Agendamos?"</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 md:p-8">
                  <h4 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                    <span className="text-blue-600 mr-2"><CheckCircle2 className="w-6 h-6"/></span> 
                    Multiplica tus Ingresos Reales:
                  </h4>
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="group/item hover:bg-white p-5 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200 shadow-sm flex flex-col">
                      <div className="font-bold text-gray-900 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-green-500 mr-1"/> 1. El Doble por "IA Incluida"</div>
                      <p className="text-sm text-gray-600 mb-4 flex-1">Deja de vender commodities. Vende "Hubs Automatizados de Captación". Solo la etiqueta de Inteligencia Artificial engorda tu cotización.</p>
                      <div className="mt-auto text-xs font-mono font-bold bg-green-50 border border-green-200 text-green-800 p-3 flex flex-col gap-1 rounded-lg"><div>Ej: Cotización Base: $600.000</div><div>Presupuestas a: $900.000</div><div className="text-sm text-green-600 mt-1">👉 Bono Directo: +$300k.</div></div>
                    </div>
                    <div className="group/item hover:bg-white p-5 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200 shadow-sm flex flex-col">
                      <div className="font-bold text-gray-900 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-green-500 mr-1"/> 2. Consultoría de Procesos</div>
                      <p className="text-sm text-gray-600 mb-4 flex-1">El bot necesita saber a dónde mandar los datos. Gana un honorario (Setup Fee) solo por configurarle y vincularle los correos y bases a su negocio matriz.</p>
                    </div>
                    <div className="group/item hover:bg-white p-5 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-200 shadow-sm flex flex-col">
                       <div className="font-bold text-gray-900 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-green-500 mr-1"/> 3. Suscripción Eterna</div>
                      <p className="text-sm text-gray-600 mb-4 flex-1">Gana regalías inagotables. Únete con la Opción A, y AIgenciaLab te pagará un porcentaje mensual pasivo mientras tu cliente use su Bot web.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model 2: E-commerce */}
            {/* Model 2: E-commerce */}
            <div className="group relative bg-white border border-gray-200 rounded-3xl p-1 shadow-sm hover:shadow-2xl transition-all duration-500 mt-8">
              <div className="bg-white rounded-[22px] p-8 lg:p-10 relative overflow-hidden h-full z-10 border border-gray-100">
                <div className="absolute top-0 right-0 bg-indigo-600 text-white px-6 py-2 font-bold text-sm rounded-bl-2xl shadow-lg">
                   Especialización: E-Commerce
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 mb-8 mt-4">
                  <div className="md:w-1/3">
                    <div className="w-20 h-20 bg-indigo-50 ring-1 ring-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm transform group-hover:-translate-y-2 transition-transform duration-500">
                      <Bot className="w-10 h-10"/>
                    </div>
                    <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">Agencias de Tiendas Online (Shopify, WooCommerce)</h3>
                    <div className="flex gap-2 mt-3">
                       <span className="bg-red-100/80 border border-red-200 text-red-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Antirrebote de Carrito</span>
                    </div>
                  </div>
                  <div className="md:w-2/3 space-y-5 text-gray-600 leading-relaxed text-lg pt-2">
                    <p>La hemorragia de dinero de tu cliente siempre nace en soporte post-venta: responder "*¿por qué no me ha llegado mi envío por Starken?*" o luchar con devoluciones destruye tiempo valioso.</p>
                    <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 relative overflow-hidden shadow-sm">
                       <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                      <p className="text-gray-900 font-medium">Instala un <strong>Conserje Inteligente de Datos</strong> directo en los códigos de su Shopify. Atiende carritos abandonados instantáneamente y ayuda a decidir tallas en vivo antes de que huyan al competidor.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 rounded-2xl p-8 mb-8 text-white relative overflow-hidden flex flex-col md:flex-row justify-around items-center gap-8 shadow-inner shadow-indigo-950">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Rocket className="w-64 h-64" />
                   </div>
                   <div className="text-center z-10 w-full md:w-auto bg-gray-900/50 p-6 rounded-xl border border-indigo-500/20 shadow-lg">
                     <p className="text-[10px] text-red-300 uppercase tracking-widest font-bold mb-3 flex items-center justify-center"><span className="w-2 h-2 bg-red-400 rounded-full animate-pulse mr-2"></span>Abandono Estándar</p>
                     <p className="text-5xl font-black text-gray-400 line-through decoration-red-500/60 decoration-4">70%</p>
                   </div>
                   <ArrowRight className="w-10 h-10 text-indigo-400 hidden md:block opacity-50 absolute left-1/2 -translate-x-1/2" />
                   <div className="text-center z-10 w-full md:w-auto bg-indigo-600/30 p-6 rounded-xl border border-indigo-400 shadow-lg relative transform hover:scale-105 transition-transform duration-300">
                     <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20"></div>
                     <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-bold mb-3 flex items-center justify-center relative z-10"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></span>Tienda Curada IA</p>
                     <p className="text-4xl sm:text-5xl font-black text-green-300 relative z-10 drop-shadow-md">CRO al +40%</p>
                   </div>
                </div>

                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 md:p-8 mt-4">
                  <h4 className="text-xl font-black text-indigo-950 mb-6 flex items-center">
                    <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex justify-center items-center mr-3 text-sm shadow-md"><Zap className="w-4 h-4"/></span> 
                    El Triángulo de Comisiones E-Commerce:
                  </h4>
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm shadow-indigo-100 hover:shadow-lg transition-all hover:scale-[1.03] flex flex-col">
                      <div className="font-bold text-gray-900 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-green-500 mr-1"/> 1. Módulo "Atención VIP"</div>
                      <p className="text-sm text-gray-600 mb-4 flex-1">Vendes la tienda mucho más cara al incorporar el bloque 'Widget Automatizado de Dudas Múltiples'. El E-commerce eleva su categoría exponencialmente.</p>
                      <div className="mt-auto text-xs font-mono font-bold bg-green-50 border border-green-200 text-green-800 p-3 flex flex-col gap-1 rounded-lg"><div>Ej: Tienda Shopify base de $800k.</div><div>Cierralo en $1.2M.</div><div className="text-sm text-green-600 mt-1">👉 +$400k íntegros al bolsillo.</div></div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm shadow-indigo-100 hover:shadow-lg transition-all hover:scale-[1.03] flex flex-col">
                      <div className="font-bold text-gray-900 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-green-500 mr-1"/> 2. Fee de Catalogación</div>
                      <p className="text-sm text-gray-600 mb-4 flex-1">Los zapatos y ropas cambian. Cobra el honorario por "ingestar" las fotos, links y promociones de temporada en la base de datos de la IA para que aprenda.</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm shadow-indigo-100 hover:shadow-lg transition-all hover:scale-[1.03] flex flex-col">
                      <div className="font-bold text-gray-900 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-green-500 mr-1"/> 3. Upselling Inquebrantable</div>
                      <p className="text-sm text-gray-600 mb-4 flex-1">Aumentando la conversión de compra con este bot, el dueño de la tienda se casa con tus servicios e invalida a tu competencia. Tu retención LTV se vuelve infinita por haberle salvado el negocio.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Model 3: Paid Media */}
            {/* Model 3: Paid Media */}
            <div className="group relative bg-gradient-to-br from-teal-900 via-gray-900 to-indigo-950 rounded-3xl p-1 shadow-xl hover:shadow-[0_0_50px_rgba(45,212,191,0.4)] transition-all duration-500 mt-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-indigo-500 rounded-3xl opacity-0 group-hover:opacity-100 transition duration-1000 blur-sm"></div>
              <div className="bg-gray-900 rounded-[22px] p-8 lg:p-10 relative overflow-hidden h-full z-10 border border-gray-700">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-500 to-teal-400 text-gray-950 px-6 py-2 font-bold text-sm rounded-bl-2xl shadow-lg">
                   Especialización: Tráfico Pago (Ads)
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 mb-8 mt-4">
                  <div className="md:w-1/3">
                    <div className="w-20 h-20 bg-teal-900/50 ring-1 ring-teal-500/50 text-teal-400 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(45,212,191,0.3)] transform group-hover:scale-105 transition-transform duration-500">
                      <Zap className="w-10 h-10"/>
                    </div>
                    <h3 className="text-3xl font-extrabold text-white tracking-tight leading-tight">Agencias Performance, Pauta & Meta Ads</h3>
                    <div className="flex gap-2 mt-3">
                       <span className="bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Acaba la Fuga del ROAS</span>
                    </div>
                  </div>
                  <div className="md:w-2/3 space-y-4 text-gray-400 leading-relaxed text-lg pt-2">
                    <p>La máxima frustración de un Trafficker: Levantas campañas perfectas en Facebook Ads, caen cientos de leads diarios, pero llegan a un WhatsApp de un asesor humano quemado que tarda <span className="text-red-400 line-through">12 horas en responderle</span> al cliente.</p>
                    <p>El prospecto se enfría, no hay cierre, y el cliente final acusa a la agencia de "traer tráfico basura". Tu ROAS se destruye por culpa de su lenta fuerza de ventas humana.</p>
                    <div className="bg-gradient-to-r from-teal-900/40 to-transparent p-5 border-l-4 border-teal-500 rounded-r-lg text-teal-100 shadow-inner mt-4">
                      <p><strong className="text-teal-400 text-xl font-black">Solución Blindada:</strong> Al dar Click en tu Ad, el lead aterriza en el <strong className="text-white">Bot WhatsApp IA</strong>. Lo atiende en 2 segundos clavados en plena madrugada, perfila si tiene para pagar y agenda sin humanos.</p>
                    </div>
                  </div>
                </div>

                {/* Ads Process Visualization */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                   <div className="flex-1 bg-gray-800/80 rounded-xl p-4 border border-gray-700 shadow-sm text-center transform hover:scale-105 transition duration-300">
                      <div className="text-teal-400 mb-2 font-bold uppercase text-[10px] tracking-widest">Paso 1: Ads Master</div>
                      <div className="text-white font-medium text-sm">Tu pauta genera 1K Clicks</div>
                   </div>
                   <div className="flex-1 bg-teal-900/40 rounded-xl p-4 border border-teal-500/30 shadow-sm text-center transform hover:scale-105 transition duration-300 relative">
                     <div className="absolute top-1/2 -left-4 w-4 h-[2px] bg-teal-500 hidden md:block"></div>
                      <div className="text-teal-300 mb-2 font-bold uppercase text-[10px] tracking-widest animate-pulse">Paso 2: Aigencia IA</div>
                      <div className="text-white font-medium text-sm">Respuesta 2 Seg. y Filtro</div>
                   </div>
                   <div className="flex-1 bg-green-900/40 rounded-xl p-4 border border-green-500/40 shadow-inner text-center transform hover:scale-105 transition duration-300 relative">
                      <div className="absolute top-1/2 -left-4 w-4 h-[2px] bg-green-500 hidden md:block"></div>
                      <div className="text-green-400 mb-2 font-bold uppercase text-[10px] tracking-widest">Paso 3: Cierre Total</div>
                      <div className="text-white font-black text-lg">ROAS 5X Real</div>
                   </div>
                </div>

                <div className="bg-gray-800/80 border border-gray-700/80 rounded-2xl p-6 md:p-8 mt-4 shadow-xl">
                  <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Rocket className="w-6 h-6 text-teal-400 mr-2" />
                    El Esquema de Riqueza para Traffickers:
                  </h4>
                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg transform transition-transform hover:-translate-y-2 flex flex-col">
                      <div className="font-bold text-teal-400 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-teal-500 mr-1"/> 1. Venta del Funnel Base</div>
                      <p className="text-sm text-gray-400 mb-4 flex-1">Deja de cobrar la paupérrima tarifa de *"pauta mensual"*. Al Onboarding suma una comisión brutal "por crear el Sistema Receptor".</p>
                      <div className="mt-auto text-xs font-mono font-bold bg-teal-900/40 border border-teal-500/40 text-teal-200 p-3 flex flex-col gap-1 rounded-lg"><div>Integración Ads al Bot IA Cliente.</div><div className="text-sm text-teal-400 mt-1">👉 Cobro Extra Setup: +$500.000.</div></div>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg transform transition-transform hover:-translate-y-2 flex flex-col">
                      <div className="font-bold text-teal-400 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-teal-500 mr-1"/> 2. Retención Avasalladora</div>
                      <p className="text-sm text-gray-400 flex-1">Los dentistas, concesionarias y aseguradoras cerrarán leads como nunca antes en su vida gracias al bot. Ningún competidor podrá robarte a ese cliente. Su LTV se va al techo.</p>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg transform transition-transform hover:-translate-y-2 flex flex-col">
                      <div className="font-bold text-teal-400 mb-2 flex items-center"><DollarSign className="w-5 h-5 text-teal-500 mr-1"/> 3. Renta por Volumen</div>
                      <p className="text-sm text-gray-400 flex-1">Para cuentas masivas, el consumo de API es alto. Usa la Opción A para ganar 30% vitalicio de nuestra facturación gigante generada de forma pasiva por tu equipo de Ads.</p>
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
