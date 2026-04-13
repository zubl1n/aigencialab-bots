'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, Building2, Globe, Mail, User, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    website: '',
    plan: 'Starter'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { fullName, companyName, email, website, plan } = formData;

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-12), // Temporary password or user chooses later
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            company_name: companyName,
            website: website,
            plan: plan
          }
        }
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al registrarse. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center animate-fade-up">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Casi listo!</h2>
          <p className="text-slate-400 mb-6">
            Hemos enviado un enlace de confirmación a <span className="text-primary">{formData.email}</span>. 
            Confirma tu email para comenzar con el onboarding.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition-all"
          >
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple/20 rounded-full blur-[128px]" />
      </div>

      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-primary text-sm font-medium mb-4 animate-fade-up">
            <Bot className="w-4 h-4" />
            <span>AIgenciaLab SaaS Platform</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Crea tu cuenta empresarial
          </h1>
          <p className="text-slate-400 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Activa tu asistente IA en menos de 5 minutos
          </p>
        </div>

        <form 
          onSubmit={handleRegister}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 space-y-5 animate-fade-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" /> Nombre Completo
              </label>
              <input
                required
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Nombre de Empresa
              </label>
              <input
                required
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Ej. Tech Solutions"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" /> Email Corporativo
            </label>
            <input
              required
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="juan@empresa.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Sitio Web
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="https://www.tuempresa.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Plan de Suscripción</label>
            <div className="grid grid-cols-3 gap-3">
              {['Starter', 'Pro', 'Enterprise'].map((plan) => (
                <label 
                  key={plan}
                  className={`
                    relative flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all
                    ${formData.plan === plan 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}
                  `}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan}
                    checked={formData.plan === plan}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold">{plan}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Comenzar Registro <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-center text-slate-500 text-sm">
            ¿Ya tienes una cuenta? <Link href="/login" className="text-primary hover:underline">Inicia Sesión</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
