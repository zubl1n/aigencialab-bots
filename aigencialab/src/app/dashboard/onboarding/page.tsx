'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Bot, 
  Settings2, 
  Code2, 
  PlayCircle, 
  CheckCircle2, 
  Loader2, 
  ChevronRight, 
  ChevronLeft,
  Upload,
  Globe,
  Palette,
  Languages,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [botConfig, setBotConfig] = useState<any>(null);
  const [onboardingProgress, setOnboardingProgress] = useState<any>(null);

  // Form states
  const [companyForm, setCompanyForm] = useState({ companyName: '', website: '', logoUrl: '' });
  const [botForm, setBotForm] = useState({ botName: 'Asistente IA', welcomeMessage: '¡Hola!', widgetColor: '#0066CC', language: 'es' });

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // Fetch initial data
      const [clientRes, botRes, progressRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', user.id).single(),
        supabase.from('bot_configs').select('*').eq('client_id', user.id).single(),
        supabase.from('onboarding_progress').select('*').eq('client_id', user.id).single()
      ]);

      if (clientRes.data) {
        setClientData(clientRes.data);
        setCompanyForm({
          companyName: clientRes.data.company_name || '',
          website: clientRes.data.website || '',
          logoUrl: clientRes.data.logo_url || ''
        });
      }

      if (botRes.data) {
        setBotConfig(botRes.data);
        setBotForm({
          botName: botRes.data.bot_name || 'Asistente IA',
          welcomeMessage: botRes.data.welcome_message || '¡Hola!',
          widgetColor: botRes.data.widget_color || '#0066CC',
          language: botRes.data.language || 'es'
        });
      }

      if (progressRes.data) {
        setOnboardingProgress(progressRes.data);
        if (progressRes.data.step_completed >= 4) {
          router.push('/dashboard');
        } else {
          setStep(progressRes.data.step_completed + 1);
        }
      }

      setLoading(false);
    }
    init();
  }, [supabase, router]);

  const updateProgress = async (completedStep: number) => {
    const { error } = await supabase
      .from('onboarding_progress')
      .update({ 
        step_completed: completedStep,
        completed_at: completedStep === 4 ? new Date().toISOString() : null 
      })
      .eq('client_id', user.id);
    
    if (error) console.error(error);
  };

  const handleNext = async () => {
    setSaving(true);
    try {
      if (step === 1) {
        await supabase.from('clients').update({ 
          company_name: companyForm.companyName, 
          website: companyForm.website,
          logo_url: companyForm.logoUrl
        }).eq('id', user.id);
      } else if (step === 2) {
        await supabase.from('bot_configs').update({
          bot_name: botForm.botName,
          welcome_message: botForm.welcomeMessage,
          widget_color: botForm.widgetColor,
          language: botForm.language
        }).eq('client_id', user.id);
      } else if (step === 4) {
        // Finalize
        await supabase.from('bot_configs').update({ active: false }).eq('client_id', user.id);
        
        // Trigger notification logic (Edge Function)
        await supabase.functions.invoke('send-email', {
          body: {
            to: user.email,
            subject: 'Configuración de Bot Enviada - AIgenciaLab',
            type: 'onboarding_complete',
            data: {
              company_name: companyForm.companyName,
              bot_name: botForm.botName
            }
          }
        });

        router.push('/dashboard?onboarding=complete');
        return;
      }

      await updateProgress(step);
      setStep(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => setStep(prev => Math.max(1, prev - 1));

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/logo.${fileExt}`;

    try {
      setSaving(true);
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);
      setCompanyForm(prev => ({ ...prev, logoUrl: publicUrl }));
    } catch (err) {
      console.error('Error uploading logo:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  const steps = [
    { title: 'Empresa', icon: Building2 },
    { title: 'Bot', icon: Bot },
    { title: 'Instalación', icon: Code2 },
    { title: 'Prueba', icon: PlayCircle }
  ];

  const apiKey = clientData?.id || 'API-KEY-PENDING'; // Or fetch from api_keys table

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      {/* Progress Header */}
      <div className="w-full bg-slate-900/50 border-b border-white/5 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Bot className="w-8 h-8 text-primary" />
              Onboarding AIgenciaLab
            </h1>
            <div className="text-slate-400 text-sm font-medium">
              Paso {step} de 4
            </div>
          </div>

          <div className="relative flex justify-between">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 -z-10" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 -z-10" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === i + 1;
              const isCompleted = step > i + 1;

              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/30' : 
                      isCompleted ? 'bg-accent text-white' : 'bg-slate-800 text-slate-500'}
                  `}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content Container */}
      <main className="flex-1 w-full max-w-4xl p-6 md:p-12 mb-20 animate-fade-up">
        
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Configura el perfil de tu empresa</h2>
              <p className="text-slate-400">Esta información se usará para personalizar la identidad de tu bot.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nombre de la Empresa</label>
                  <input 
                    type="text" 
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({...companyForm, companyName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Ej. Mi Agencia IA"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" /> Sitio Web
                  </label>
                  <input 
                    type="url" 
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({...companyForm, website: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="https://tudominio.com"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 group hover:border-primary/50 transition-all">
                {companyForm.logoUrl ? (
                  <div className="relative w-32 h-32 mb-4">
                    <img src={companyForm.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                    <button 
                      onClick={() => setCompanyForm({...companyForm, logoUrl: ''})}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <Upload className="w-12 h-12 text-slate-500 mb-4 group-hover:text-primary transition-all" />
                )}
                <label className="cursor-pointer">
                  <span className="text-primary font-semibold hover:underline">Sube tu logo</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
                <p className="text-xs text-slate-500 mt-2 text-center">PNG o JPG (máx. 2MB)</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Personaliza tu Asistente IA</h2>
              <p className="text-slate-400">Dale personalidad y estilo a tu bot.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nombre del Bot</label>
                  <input 
                    type="text" 
                    value={botForm.botName}
                    onChange={(e) => setBotForm({...botForm, botName: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Ej. Soporte AIgencia"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Mensaje de Bienvenida</label>
                  <textarea 
                    rows={3}
                    value={botForm.welcomeMessage}
                    onChange={(e) => setBotForm({...botForm, welcomeMessage: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Palette className="w-4 h-4" /> Color Widget
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={botForm.widgetColor}
                        onChange={(e) => setBotForm({...botForm, widgetColor: e.target.value})}
                        className="w-12 h-12 bg-transparent border-none rounded-full cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={botForm.widgetColor}
                        onChange={(e) => setBotForm({...botForm, widgetColor: e.target.value})}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 text-sm text-white focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Languages className="w-4 h-4" /> Idioma
                    </label>
                    <select 
                      value={botForm.language}
                      onChange={(e) => setBotForm({...botForm, language: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="hidden md:flex flex-col items-center justify-center">
                <div className="text-xs font-semibold text-slate-500 mb-4 uppercase tracking-widest">Vista Previa Widget</div>
                <div className="w-80 bg-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden aspect-[9/16] relative flex flex-col">
                  <div className="p-4 flex items-center gap-3 border-b border-white/5" style={{ backgroundColor: botForm.widgetColor }}>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">{botForm.botName}</div>
                      <div className="text-white/70 text-[10px]">En línea</div>
                    </div>
                  </div>
                  <div className="flex-1 p-4 space-y-4 bg-slate-950">
                    <div className="bg-slate-800 rounded-2xl rounded-tl-none p-3 text-white text-xs max-w-[85%] animate-fade-up">
                      {botForm.welcomeMessage}
                    </div>
                  </div>
                  <div className="p-4 border-t border-white/5 bg-slate-900 mt-auto">
                    <div className="bg-slate-800 rounded-full px-4 py-2 text-slate-400 text-xs text-left">
                      Escribe un mensaje...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">Instala tu Bot</h2>
              <p className="text-slate-400">Copia y pega este código en la cabecera (header) de tu sitio web.</p>
            </div>

            <div className="relative group">
              <pre className="bg-slate-900 border border-white/10 rounded-2xl p-6 text-sm text-primary font-mono overflow-x-auto">
                <code>{`<!-- AIgenciaLab Widget -->
<script 
  src="https://aigencialab.cl/widget/widget.js" 
  data-api-key="${apiKey}"
  defer>
</script>
<!-- End AIgenciaLab Widget -->`}</code>
              </pre>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`<script src="https://cdn.aigencialab.com/widget.js" data-key="${apiKey}" defer></script>`);
                  alert('Snipped copiado!');
                }}
                className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 text-white p-2 rounded-xl transition-all"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" /> Wordpress
                </h3>
                <p className="text-sm text-slate-400">Instala nuestro plugin oficial y pega tu API Key en los ajustes.</p>
                <button className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 mt-auto">
                  Ver guía <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-3">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" /> React / Next.js
                </h3>
                <p className="text-sm text-slate-400">Usa nuestro paquete npm `@aigencialab/react` para una integración nativa.</p>
                <button className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 mt-auto">
                  Ver docs <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 flex flex-col items-center">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">¡Todo listo para la prueba final!</h2>
              <p className="text-slate-400">Prueba tu bot aquí mismo antes de que un administrador lo active permanentemente.</p>
            </div>

            <div className="w-full max-w-lg aspect-square bg-slate-900 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
              {/* This would be an iframe to the widget preview */}
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm z-10 group-hover:opacity-0 transition-opacity">
                 <div className="text-center space-y-4">
                    <PlayCircle className="w-16 h-16 text-primary mx-auto animate-pulse" />
                    <span className="text-white font-medium">Haz clic para interactuar</span>
                 </div>
              </div>
              <iframe 
                src={`https://preview.aigencialab.com/chat?key=${apiKey}&preview=true`}
                className="w-full h-full border-none"
                title="Bot Preview"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex items-start gap-4 max-w-xl">
              <Settings2 className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h4 className="text-white font-bold mb-1">Casi activo</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Al hacer clic en "Finalizar", notificaremos a nuestro equipo técnico. 
                  Tu bot será revisado y activado en un plazo máximo de 24 horas.
                </p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Sticky Footer Controls */}
      <footer className="fixed bottom-0 left-0 w-full bg-slate-950/80 backdrop-blur-lg border-t border-white/5 py-6 px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button 
            onClick={handleBack}
            disabled={step === 1 || saving}
            className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5" /> Anterior
          </button>
          
          <button 
            onClick={handleNext}
            disabled={saving}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 group shadow-lg shadow-primary/20"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 4 ? 'Finalizar Configuración' : 'Siguiente Paso'}
                {step < 4 && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                {step === 4 && <CheckCircle2 className="w-5 h-5" />}
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
