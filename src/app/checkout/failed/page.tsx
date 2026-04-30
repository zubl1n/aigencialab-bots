'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';

function FailedContent() {
  const params = useSearchParams();
  const plan = params.get('plan') ?? '';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">El pago no pudo procesarse</h1>
        <p className="text-slate-500 mb-8">
          Tu tarjeta o método de pago no fue aprobado. No se realizó ningún cargo.
          Puedes intentarlo de nuevo o contactarnos si necesitas ayuda.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href={plan ? `/checkout/${plan}` : '/precios'}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" /> Intentar de nuevo
          </Link>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_SALES_NUMBER ?? '56991234567'}`}

            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4" /> Contactar soporte por WhatsApp
          </a>
          <Link href="/precios" className="text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
            Ver todos los planes
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense>
      <FailedContent />
    </Suspense>
  );
}
