'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Bot,
  Code2,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Globe,
  Copy,
  ExternalLink,
  Users,
  Target,
  HelpCircle,
  Zap,
  MessageSquare,
  ArrowRight,
  Check
} from 'lucide-react';

// ─── Goal options (Step 2) ────────────────────────────────────────────────────
const GOALS = [
  {
    id: 'capture',
    icon: Target,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    selectedColor: 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10',
    title: 'Capturar datos de contacto',
    desc: 'Recolecta nombre, email y teléfono de cada visitante automáticamente.',
    benefits: ['Lead scoring automático', 'CRM integrado', 'Sin formularios manuales']
  },
  {
    id: 'profile',
    icon: Users,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    selectedColor: 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10',
    title: 'Perfilar contactos',
    desc: 'Califica y segmenta prospectos antes de pasarlos a tu equipo de ventas.',
    benefits: ['Preguntas de calificación', 'Segmentación por intención', 'Alertas en tiempo real']
  },
  {
    id: 'faq',
    icon: HelpCircle,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    selectedColor: 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10',
    title: 'Responder preguntas',
    desc: 'Resuelve dudas frecuentes 24/7 sin intervención humana.',
    benefits: ['Base de conocimiento IA', 'Escalado automático a humanos', 'Soporte multicanal']
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [botConfig, setBotConfig] = useState<any>(null);

  // Step 1
  const [companyForm, setCompanyForm] = useState({ companyName: '', website: '', logoUrl: '' });
  // Step 2
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUser(user);

      const [clientRes, progressRes, apiKeyRes, botRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', user.id).single(),
        supabase.from('onboarding_progress').select('*').eq('client_id', user.id).single(),
        supabase.from('api_keys').select('key').eq('client_id', user.id).limit(1).single(),
        supabase.from('bot_configs').select('*').eq('client_id', user.id).single()
      ]);

      if (clientRes.data) {
        setClientData(clientRes.data);
        setCompanyForm({
          companyName: clientRes.data.company_name || '',
          website: clientRes.data.website || '',
          logoUrl: clientRes.data.logo_url || ''
        });
      }
      if (apiKeyRes.data?.key) setApiKey(apiKeyRes.data.key);
      if (botRes.data) setBotConfig(botRes.data);

      if (progressRes.data) {
        if (progressRes.data.step_completed >= 3) {
          router.push('/dashboard');
          return;
        } else {
          setStep(progressRes.data.step_completed + 1);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  const handleNext = async () => {
    setSaving(true);
    try {
      if (step === 1) {
        await supabase.from('clients').update({
          company_name: companyForm.companyName,
          website: companyForm.website,
          logo_url: companyForm.logoUrl
        }).eq('id', user.id);

        await supabase.from('onboarding_progress').upsert({
          client_id: user.id, step_completed: 1
        }, { onConflict: 'client_id' });

        // FASE 2: full-screen purple transition to Step 2
        setSaving(false);
        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
          setStep(2);
        }, 1500);
        return;
      }

      if (step === 2) {
        await supabase.from('bot_configs').update({
          goals: selectedGoals
        }).eq('client_id', user.id);

        await supabase.from('onboarding_progress').upsert({
          client_id: user.id, step_completed: 2
        }, { onConflict: 'client_id' });

        setSaving(false);
        // FASE 2: purple transition to Step 3
        setShowTransition(true);
        setTimeout(() => {
          setShowTransition(false);
          setStep(3);
        }, 1500);
        return;
      }

      if (step === 3) {
        await supabase.from('onboarding_progress').upsert({
          client_id: user.id, step_completed: 3, completed_at: new Date().toISOString()
        }, { onConflict: 'client_id' });
        router.push('/dashboard?onboarding=complete');
        return;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/logo.${fileExt}`;
    try {
      setSaving(true);
      await supabase.storage.from('logos').upload(filePath, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(filePath);
      setCompanyForm(prev => ({ ...prev, logoUrl: publicUrl }));
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const snippet = `<!-- AIgenciaLab Widget -->
<script 
  src="https://aigencialab.cl/widget/widget.js" 
  data-api-key="${apiKey || 'LOADING...'}"
  defer>
</script>`;

  const steps = [
    { title: 'Empresa', icon: Building2 },
    { title: 'Objetivos', icon: Target },
    { title: 'Instalación', icon: Code2 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center relative">

      {/* ─── FASE 2: Purple Transition Overlay (#7F77DD) ─────────────────── */}
      {showTransition && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300"
          style={{ backgroundColor: '#7F77DD' }}
        >
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-2xl">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3 tracking-tight text-center">
            Estamos creando tu chatbot
          </h2>
          <p className="text-white/80 text-base font-medium text-center max-w-sm">
            En instantes podrás editarlo, probarlo e instalarlo
          </p>
          <div className="mt-8 flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-white animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Progress Header ──────────────────────────────────────────────── */}
      <div className="w-full bg-slate-900/50 border-b border-white/5 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Bot className="w-8 h-8 text-primary" />
              Onboarding AIgenciaLab
            </h1>
            <div className="text-slate-400 text-sm font-medium">Paso {step} de 3</div>
          </div>

          <div className="relative flex justify-between">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -translate-y-1/2 -z-10" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 -z-10"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
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
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500'}
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

      {/* ─── Content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-4xl p-6 md:p-12 mb-28">

        {/* Step 1: Company */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Configura el perfil de tu empresa</h2>
              <p className="text-slate-400">Esta información personalizará la identidad de tu bot.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Nombre de la Empresa</label>
                  <input
                    type="text"
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
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
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="https://tudominio.com"
                  />
                </div>
              </div>
              <div
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 group hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => document.getElementById('logo-upload')?.click()}
              >
                {companyForm.logoUrl ? (
                  <div className="relative w-32 h-32 mb-4">
                    <img src={companyForm.logoUrl} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setCompanyForm({ ...companyForm, logoUrl: '' }); }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full text-xs w-6 h-6 flex items-center justify-center"
                    >×</button>
                  </div>
                ) : (
                  <Upload className="w-12 h-12 text-slate-500 mb-4 group-hover:text-primary transition-all" />
                )}
                <span className="text-primary font-semibold hover:underline">Sube tu logo</span>
                <input id="logo-upload" type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                <p className="text-xs text-slate-500 mt-2 text-center">PNG o JPG (máx. 2MB)</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 2: Goals — FASE 2: 2-column cards ──────────────────── */}
        {step === 2 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">¿Cuál es el objetivo de tu bot?</h2>
              <p className="text-slate-400">Selecciona uno o más objetivos para personalizar el comportamiento de tu asistente.</p>
            </div>

            {/* 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {GOALS.map(goal => {
                const Icon = goal.icon;
                const isSelected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={`
                      relative text-left p-7 rounded-2xl border-2 transition-all duration-200
                      ${isSelected ? goal.selectedColor : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'}
                    `}
                  >
                    {/* Selected checkmark */}
                    {isSelected && (
                      <div className="absolute top-5 right-5 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Large icon */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border ${goal.color}`}>
                      <Icon className="w-7 h-7" />
                    </div>

                    {/* Title */}
                    <h3 className={`text-lg font-bold mb-2 ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                      {goal.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">{goal.desc}</p>

                    {/* 3 benefit bullets */}
                    <ul className="space-y-2">
                      {goal.benefits.map(b => (
                        <li key={b} className="flex items-center gap-2.5 text-sm">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-white' : 'bg-slate-600'}`} />
                          <span className={isSelected ? 'text-white/80' : 'text-slate-500'}>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}

              {/* Third card, centered if odd */}
              {/* Already handled — 3rd card renders in col-1 on md */}
            </div>

            {selectedGoals.length === 0 && (
              <p className="text-center text-sm text-slate-500">Selecciona al menos un objetivo para continuar.</p>
            )}
          </div>
        )}

        {/* ─── Step 3: Installation — FASE 2: 50/50 split ──────────────── */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT: Live widget preview */}
            <div className="space-y-5">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Instala tu Bot</h2>
                <p className="text-slate-400">Copia este snippet en el &lt;head&gt; de tu sitio web.</p>
              </div>

              {/* Snippet */}
              <div className="relative group">
                <pre className="bg-slate-900 border border-white/10 rounded-2xl p-5 text-sm text-emerald-400 font-mono overflow-x-auto whitespace-pre-wrap">
                  <code>{snippet}</code>
                </pre>
                <button
                  id="copy-snippet-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(snippet);
                    const btn = document.getElementById('copy-snippet-btn');
                    if (btn) {
                      btn.textContent = '✓ Copiado';
                      setTimeout(() => { if (btn) btn.innerHTML = '<svg class="w-4 h-4 inline-block mr-1">...</svg> Copiar'; }, 2000);
                    }
                  }}
                  className="absolute top-4 right-4 flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                >
                  <Copy className="w-4 h-4" /> Copiar
                </button>
              </div>

              {!apiKey && (
                <p className="text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                  ⚠ Tu API Key se está generando. Recarga si no aparece en 10 segundos.
                </p>
              )}

              {/* Live preview mock */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center mb-4">Vista previa del widget</p>
                <div className="flex gap-3 items-end">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-slate-300 max-w-[80%]">
                    {botConfig?.welcome_message || '¡Hola! ¿En qué puedo ayudarte hoy? 👋'}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: 2 action cards */}
            <div className="flex flex-col gap-5 pt-2">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Próximos pasos</div>

              {/* Card A: Mejorar conversación */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/bot')}
                className="text-left p-7 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-600/10 border border-primary/20 hover:border-primary/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Mejorar mi conversación</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Personaliza el tono, preguntas clave y respuestas de tu bot para maximizar conversiones.
                </p>
                <span className="text-primary text-xs font-bold underline underline-offset-2">
                  → editar conversación
                </span>
              </button>

              {/* Card B: Conectar chatbot */}
              <button
                type="button"
                onClick={() => router.push('/dashboard/settings')}
                className="text-left p-7 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 text-slate-300 flex items-center justify-center">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Conectar mi chatbot</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-4">
                  Integra WhatsApp, Instagram o Facebook Messenger para atender clientes en sus canales favoritos.
                </p>
                <span className="text-slate-400 text-xs font-bold underline underline-offset-2">
                  → conectar canales
                </span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* ─── Footer Controls ──────────────────────────────────────────────── */}
      <footer className="fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-lg border-t border-white/5 py-6 px-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1 || saving}
            className="flex items-center gap-2 text-slate-400 hover:text-white disabled:opacity-30 transition-colors font-medium"
          >
            <ChevronLeft className="w-5 h-5" /> Anterior
          </button>

          <button
            id="onboarding-next-btn"
            onClick={handleNext}
            disabled={saving || (step === 2 && selectedGoals.length === 0)}
            className="bg-primary hover:bg-primary/80 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 group shadow-lg shadow-primary/20"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {step === 3 ? 'Ir al Dashboard' : 'Siguiente Paso'}
                {step < 3 && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                {step === 3 && <CheckCircle2 className="w-5 h-5" />}
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
