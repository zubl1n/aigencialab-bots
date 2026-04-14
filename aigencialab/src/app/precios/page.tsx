'use client';
import { MainLayout } from '@/components/landing/MainLayout';
import { PLANS } from '@/lib/plans';
import Link from 'next/link';
import { useState } from 'react';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <MainLayout>
      <div className="bg-white min-h-screen text-gray-900 pb-20 pt-16">
        <div className="max-w-6xl mx-auto px-6 text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Precios simples y transparentes</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Elige el plan ideal para escalar las ventas y el soporte de tu empresa con IA.
          </p>

          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!isAnnual ? 'font-bold text-gray-900' : 'text-gray-500'}`}>Mensual</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-purple-600 transition-colors focus:outline-none"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm ${isAnnual ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
              Anual <span className="ml-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">-20%</span>
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 mb-20">
          {/* STARTER */}
          <div className="border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col bg-white">
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Starter</h3>
            <p className="text-gray-500 text-sm mb-6">{PLANS.Starter.description}</p>
            <div className="text-4xl font-bold mb-2">$0</div>
            <div className="text-gray-400 text-sm mb-8">CLP / gratis</div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> {PLANS.Starter.conversationsLimit} conversaciones/mes</li>
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> {PLANS.Starter.leadsLimit} leads calificados</li>
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> {PLANS.Starter.botsLimit} Agente de IA</li>
              <li className="flex items-center gap-3 text-sm text-gray-400">✗ Soporte personalizado</li>
            </ul>
            <Link href="/register" className="w-full py-4 text-center border-2 border-gray-900 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition">
              Empezar gratis
            </Link>
          </div>

          {/* PRO */}
          <div className="border-2 border-purple-600 rounded-2xl p-8 shadow-xl flex flex-col bg-white relative transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Más elegido
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Pro</h3>
            <p className="text-gray-500 text-sm mb-6">{PLANS.Pro.description}</p>
            <div className="text-4xl font-bold mb-2 text-purple-700">
              ${isAnnual ? (PLANS.Pro.price * 0.8).toLocaleString('es-CL') : PLANS.Pro.price.toLocaleString('es-CL')}
            </div>
            <div className="text-gray-400 text-sm mb-8">CLP / mes {isAnnual && '(facturado anualmente)'}</div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> {PLANS.Pro.conversationsLimit} conversaciones/mes</li>
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> {PLANS.Pro.leadsLimit} leads calificados</li>
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> {PLANS.Pro.botsLimit} Agentes de IA</li>
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> Dashboard completo</li>
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> Soporte prioritario email</li>
            </ul>
            <Link href={`/register?plan=pro`} className="w-full py-4 text-center bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition shadow-lg shadow-purple-200">
              Probar 14 días gratis
            </Link>
          </div>

          {/* ENTERPRISE */}
          <div className="border border-gray-200 rounded-2xl p-8 shadow-sm flex flex-col bg-white">
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Enterprise</h3>
            <p className="text-gray-500 text-sm mb-6">{PLANS.Enterprise.description}</p>
            <div className="text-4xl font-bold mb-2">
               ${isAnnual ? (PLANS.Enterprise.price * 0.8).toLocaleString('es-CL') : PLANS.Enterprise.price.toLocaleString('es-CL')}
            </div>
            <div className="text-gray-400 text-sm mb-8">CLP / mes</div>
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> {PLANS.Enterprise.conversationsLimit}+ conversaciones</li>
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> {PLANS.Enterprise.leadsLimit} leads</li>
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> Agentes ilimitados</li>
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> CRM personalizado</li>
              <li className="flex items-center gap-3 text-sm text-gray-600"><span className="text-green-500 font-bold">✓</span> Ejecutivo de cuenta</li>
            </ul>
            <Link href="/contacto" className="w-full py-4 text-center border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition">
              Contactar ventas
            </Link>
          </div>
        </div>

        {/* COMPREHENSIVE FEATURES TABLE */}
        <div className="max-w-6xl mx-auto px-6 mb-24 overflow-x-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Compara todas las características</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-4 border-b border-gray-200 w-1/4"></th>
                <th className="py-4 border-b border-gray-200 font-bold text-lg text-center w-1/4">Starter</th>
                <th className="py-4 border-b border-gray-200 font-bold text-lg text-center text-purple-600 w-1/4">Pro</th>
                <th className="py-4 border-b border-gray-200 font-bold text-lg text-center w-1/4">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan={4} className="py-4 font-bold text-gray-900 bg-gray-50 px-4 mt-4">Interacciones y Agentes</td></tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-600">Límites de conversaciones</td>
                <td className="py-4 text-center text-gray-900">{PLANS.Starter.conversationsLimit}/m</td>
                <td className="py-4 text-center font-bold text-purple-600">{PLANS.Pro.conversationsLimit}/m</td>
                <td className="py-4 text-center text-gray-900">{PLANS.Enterprise.conversationsLimit}+/m</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-600">Captura de Leads</td>
                <td className="py-4 text-center text-gray-900">{PLANS.Starter.leadsLimit}</td>
                <td className="py-4 text-center font-bold text-purple-600">{PLANS.Pro.leadsLimit}</td>
                <td className="py-4 text-center text-gray-900">Ilimitado</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-600">Cantidad de Bots</td>
                <td className="py-4 text-center text-gray-900">1</td>
                <td className="py-4 text-center font-bold text-purple-600">Hasta 3</td>
                <td className="py-4 text-center text-gray-900">Ilimitado</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-600">Widget web instalable</td>
                <td className="py-4 text-center"><span className="text-green-500 font-bold">✓</span></td>
                <td className="py-4 text-center"><span className="text-green-500 font-bold">✓</span></td>
                <td className="py-4 text-center"><span className="text-green-500 font-bold">✓</span></td>
              </tr>

              <tr><td colSpan={4} className="py-4 font-bold text-gray-900 bg-gray-50 px-4">Integraciones & Analytics</td></tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-600">Dashboard y analíticas</td>
                <td className="py-4 text-center">Básico</td>
                <td className="py-4 text-center font-bold text-purple-600">Avanzado</td>
                <td className="py-4 text-center">Personalizado</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-600">CRM Nativo (Leads)</td>
                <td className="py-4 text-center"><span className="text-green-500 font-bold">✓</span></td>
                <td className="py-4 text-center"><span className="text-green-500 font-bold">✓</span></td>
                <td className="py-4 text-center"><span className="text-green-500 font-bold">✓</span></td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-600">Exportar Leads (CSV)</td>
                <td className="py-4 text-center text-gray-400">✗</td>
                <td className="py-4 text-center"><span className="text-green-500 font-bold">✓</span></td>
                <td className="py-4 text-center"><span className="text-green-500 font-bold">✓</span></td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-600">API Webhooks</td>
                <td className="py-4 text-center text-gray-400">✗</td>
                <td className="py-4 text-center text-gray-400">✗</td>
                <td className="py-4 text-center"><span className="text-green-500 font-bold">✓</span></td>
              </tr>

              <tr><td colSpan={4} className="py-4 font-bold text-gray-900 bg-gray-50 px-4">Soporte y Seguridad</td></tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-600">Soporte Técnico</td>
                <td className="py-4 text-center text-gray-900">Email</td>
                <td className="py-4 text-center font-bold text-purple-600">Prioritario Email/Chat</td>
                <td className="py-4 text-center text-gray-900">Account Manager 24/7</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-600">Onboarding</td>
                <td className="py-4 text-center text-gray-900">Automático</td>
                <td className="py-4 text-center text-purple-600">Consultoría inicial</td>
                <td className="py-4 text-center text-gray-900">Ejecutivo dedicado</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-gray-600">SLA Garantizado</td>
                <td className="py-4 text-center text-gray-400">✗</td>
                <td className="py-4 text-center text-gray-400">✗</td>
                <td className="py-4 text-center"><span className="text-green-500 font-bold">✓</span> (99.9%)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Preguntas Frecuentes</h2>
          <div className="space-y-6">
            {[
              { q: '¿Necesito ingresar mi tarjeta para probar?', a: 'Depende del plan. El plan Starter es gratis para siempre. Para probar el Plan Pro durante 14 días requerimos la tarjeta, pero no se cobrará nada hasta terminar el periodo de prueba o tú lo decidas cancelar.' },
              { q: '¿Qué pasa si excedo mi límite de conversaciones?', a: 'Te notificaremos al llegar al 80% y 100%. El widget seguirá activo pero pausará nuevas conversaciones hasta el inicio del próximo mes o hasta que subas de plan.' },
              { q: '¿Puedo cambiar de plan después?', a: 'Sí, puedes actualizar a un plan superior (upgrade) en cualquier momento y se te cobrará la diferencia prorrateada o degradarlo (downgrade) al final del mes.' },
              { q: '¿Los precios incluyen impuestos?', a: 'Los precios expresados en CLP ya llevan integrados los impuestos correspondientes en Chile para pagos nacionales.' },
              { q: '¿Cuántas páginas web puedo conectar?', a: 'El widget es instalable en cualquier cantidad de subdominios y dominios que te pertenezcan. Los límites aplican sobre el volumen de conversaciones.' }
            ].map((faq, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                <h4 className="font-bold text-lg mb-2 text-gray-900">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
