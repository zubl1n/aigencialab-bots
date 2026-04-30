'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Building2, Users, MessageSquare, Zap, Shield, Clock } from 'lucide-react';
import { MainLayout } from '@/components/landing/MainLayout';

const CHANNELS = ['WhatsApp', 'Instagram', 'Facebook Messenger', 'Webchat', 'CRM Custom'];
const TEAM_SIZES = ['1–10', '11–50', '51–200', '200+'];

export default function AgendarPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', company: '', phone: '', teamSize: '',
    channels: [] as string[], message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function toggleChannel(ch: string) {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(ch)
        ? prev.channels.filter(c => c !== ch)
        : [...prev.channels, ch],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v2/contact/enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, email: formData.email,
          company: formData.company, phone: formData.phone,
          teamSize: formData.teamSize, channels: formData.channels,
          message: formData.message, planInterest: 'enterprise',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al enviar');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm";

  return (
    <MainLayout>
      <div className="min-h-screen bg-[#f8fafc] pt-20">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-start">

            {/* Left column — value copy */}
            <div className="lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-100 mb-6">
                <Building2 className="w-3.5 h-3.5" /> Plan Enterprise & Proyectos a Medida
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">
                Hablemos de{' '}
                <span className="text-blue-600">tu proyecto</span>
              </h1>
              <p className="text-slate-600 leading-relaxed mb-8 text-lg">
                Nuestro equipo de ingeniería diseñará una solución a la medida de tu operación.
                Sin formularios genéricos — una conversación real con un experto.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  { icon: MessageSquare, title: 'Diagnóstico gratuito', desc: 'Analizamos tu operación actual y te decimos exactamente qué automatizar.' },
                  { icon: Clock, title: 'Propuesta en 48 horas', desc: 'Recibirás un plan detallado con alcance, plazos y costos sin letra chica.' },
                  { icon: Zap, title: 'Piloto sin costo', desc: 'Implementamos un piloto funcional antes de comprometer el proyecto completo.' },
                  { icon: Shield, title: 'SLA contractual', desc: 'Garantía de disponibilidad 99.95% y equipo de ingeniería dedicado.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{title}</div>
                      <div className="text-slate-500 text-sm">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Sectores donde operamos
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Retail', 'E-commerce', 'Clínicas/Salud', 'Educación', 'Inmobiliaria', 'Automotriz', 'Finanzas', 'Hostelería'].map(s => (
                    <span key={s} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column — form */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Solicitud recibida!</h2>
                  <p className="text-slate-600 mb-6">
                    Recibimos tu solicitud. Te contactaremos en menos de 24 horas.
                  </p>
                  <Link href="/" className="text-blue-600 font-semibold hover:underline">
                    ← Volver al inicio
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-slate-900 mb-6">
                    Cuéntanos sobre tu proyecto
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Nombre *</label>
                        <input
                          className={inputClass}
                          placeholder="Tu nombre"
                          value={formData.name}
                          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Email *</label>
                        <input
                          type="email"
                          className={inputClass}
                          placeholder="tu@empresa.cl"
                          value={formData.email}
                          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Empresa *</label>
                        <input
                          className={inputClass}
                          placeholder="Tu empresa"
                          value={formData.company}
                          onChange={e => setFormData(p => ({ ...p, company: e.target.value }))}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1 block">Teléfono *</label>
                        <input
                          className={inputClass}
                          placeholder="+56 9 XXXX XXXX"
                          value={formData.phone}
                          onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-2 block">
                        Tamaño del equipo *
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {TEAM_SIZES.map(size => (
                          <button
                            type="button"
                            key={size}
                            onClick={() => setFormData(p => ({ ...p, teamSize: size }))}
                            className={`py-2 rounded-lg text-sm font-medium border transition-all ${
                              formData.teamSize === size
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-2 block">
                        Canales de interés
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CHANNELS.map(ch => (
                          <button
                            type="button"
                            key={ch}
                            onClick={() => toggleChannel(ch)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              formData.channels.includes(ch)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                            }`}
                          >
                            {ch}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">
                        Contexto del proyecto
                      </label>
                      <textarea
                        className={`${inputClass} resize-none`}
                        rows={4}
                        placeholder="Cuéntanos qué quieres automatizar, qué sistemas usas actualmente, cuáles son tus principales desafíos..."
                        value={formData.message}
                        onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !formData.teamSize}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold transition-all duration-200"
                    >
                      {loading ? 'Enviando...' : 'Enviar solicitud →'}
                    </button>

                    <p className="text-xs text-slate-400 text-center">
                      Te responderemos en menos de 24 horas hábiles.
                      Sin spam, sin compromisos.
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
