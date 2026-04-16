"use client";

import React, { useState } from 'react';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

export default function PartnerForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      agencyName: formData.get('agencyName'),
      website: formData.get('website'),
      message: formData.get('message'),
    };

    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        const errorData = await res.json().catch(() => ({}));
        setErrorMessage(errorData.error || 'Hubo un error del servidor. Revisa los logs de Resend.');
        setStatus('error');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Hubo un problema de red al enviar la solicitud');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-sm text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Solicitud Enviada!</h3>
        <p className="text-gray-600">
          Hemos recibido los datos de tu agencia en nuestro correo. Nuestro equipo revisará tu perfil y un especialista de alianzas se comunicará contigo al correo indicado en las próximas 24 horas. ¡Estamos emocionados de crecer juntos!
        </p>
      </div>
    );
  }

  return (
    <form id="formulario-partner" onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl text-left relative z-20">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Solicitud Oficial de Alianza (Partner)</h3>
      
      {status === 'error' && (
        <div className="bg-red-50 text-red-700 p-4 mb-6 rounded-lg text-sm border border-red-200">
          <p className="font-bold mb-1">El envío falló:</p>
          <p className="font-mono text-xs">{errorMessage}</p>
          <p className="mt-2 text-red-600">Por favor intenta escribiendo directamente a admin@aigencialab.cl</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre Completo *</label>
          <input required type="text" name="name" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 bg-white placeholder-gray-400 font-medium" placeholder="Ej: Juan Pérez" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
          <input required type="email" name="email" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 bg-white placeholder-gray-400 font-medium" placeholder="hola@tuagencia.cl" />
        </div>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tu Agencia o Empresa *</label>
          <input required type="text" name="agencyName" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 bg-white placeholder-gray-400 font-medium" placeholder="Ej: Agencia Creativa Spa" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web / RRSS *</label>
          <input required type="text" name="website" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all text-gray-900 bg-white placeholder-gray-400 font-medium" placeholder="www.tuagencia.cl" />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué tipo de servicios ofrecen actualmente? (Opcional)</label>
        <textarea name="message" rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none text-gray-900 bg-white placeholder-gray-400 font-medium" placeholder="Ej: Hacemos páginas en WordPress y campañas de Meta Ads..."></textarea>
      </div>

      <button disabled={status === 'loading'} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed">
        {status === 'loading' ? (
          <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Enviando solicitud...</>
        ) : (
          <><Mail className="w-5 h-5 mr-3" /> Quiero ser Partner (Enviar Solicitud)</>
        )}
      </button>
      <p className="text-center text-xs text-gray-500 mt-4">
        Tus datos están protegidos y solo se usarán para contactarte sobre nuestro programa de agencias.
      </p>
    </form>
  );
}
