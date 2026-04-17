'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Check, ArrowRight, Clock, Bot, Zap } from 'lucide-react';

function SuccessContent() {
  const params = useSearchParams();
  const plan = params.get('plan') ?? '';
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);

  const steps = [
    { day: 'Hoy', title: 'Acceso a tu dashboard', desc: 'Tu cuenta está activa. Explora el panel y el video de bienvenida.', icon: Zap, color: 'blue' },
    { day: 'Próximas 48h', title: 'Tu ingeniero asignado te contacta', desc: 'Uno de nuestros ingenieros te escribirá por WhatsApp para coordinar el onboarding.', icon: Bot, color: 'violet' },
    { day: 'Días 1–14', title: 'Implementación y entrenamiento', desc: 'Configuramos y entrenamos tu agente IA con el conocimiento de tu negocio.', icon: Clock, color: 'amber' },
    { day: 'Días 15–60', title: 'Ajustes y optimización (sin cobro)', desc: 'Período de activación y ajuste. Tu agente se optimiza sin costo mensual.', icon: Check, color: 'emerald' },
    { day: 'Día 61+', title: 'Tu agente opera de forma autónoma', desc: 'Comienza la suscripción mensual recurrente. Tu agente trabaja 24/7 para ti.', icon: ArrowRight, color: 'slate' },
  ];

  const colorMap: Record<string, string> = {
    blue:    'bg-blue-50 text-blue-600 border-blue-100',
    violet:  'bg-violet-50 text-violet-600 border-violet-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    slate:   'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full">
        {/* Animated check */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-[0_0_40px_rgba(16,185,129,0.3)] animate-in zoom-in-50 duration-500">
            <Check className="w-10 h-10 text-white stroke-[3]" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
            ¡Bienvenido a AIgenciaLab!
          </h1>
          {planName && (
            <div className="bg-blue-50 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full border border-blue-100">
              Plan {planName} activado
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-900">Tus próximos pasos</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {steps.map(({ day, title, desc, icon: Icon, color }) => (
              <div key={day} className="flex items-start gap-4 px-6 py-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorMap[color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{day}</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{title}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-sm text-slate-500 mb-8">
          Recibirás un email de confirmación en los próximos minutos.
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-3.5 rounded-xl font-bold transition-all duration-200"
          >
            Ir al Dashboard →
          </Link>
          <Link
            href="/"
            className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-center text-slate-700 py-3.5 rounded-xl font-semibold transition-all duration-200"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8fafc] flex items-center justify-center"><div className="text-slate-400">Cargando...</div></div>}>
      <SuccessContent />
    </Suspense>
  );
}
