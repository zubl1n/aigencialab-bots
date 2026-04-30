'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Clock, Mail, Home } from 'lucide-react';

function PendingContent() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-100">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Tu pago está siendo verificado
        </h1>
        <p className="text-slate-500 mb-8">
          MercadoPago está verificando tu pago. Este proceso puede tardar hasta 24 horas.
          Te notificaremos por email cuando se confirme.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
          <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-1">
            <Mail className="w-4 h-4" />
            Recibirás una notificación
          </div>
          <p className="text-amber-600 text-sm">
            Cuando el pago se confirme, recibirás un email con los próximos pasos
            para comenzar tu proceso de implementación.
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition-all duration-200"
        >
          <Home className="w-4 h-4" /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutPendingPage() {
  return (
    <Suspense>
      <PendingContent />
    </Suspense>
  );
}
