import React, { useState } from 'react';
import { 
  Bot, ShieldCheck, Zap, Activity, MessageSquare, 
  Target, ChevronRight, Copy, Check, DollarSign, 
  TrendingUp, BarChart3, Users, Clock, Settings
} from 'lucide-react';

export default function EnhancedDashboardMockup() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-300 p-6 md:p-10 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">
              Buenos días, <span className="text-zinc-500">Miguel</span>
            </h1>
            <p className="text-sm text-zinc-500 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Sistema operando con normalidad conectando a 3 fuentes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium transition-all text-white flex items-center gap-2 shadow-sm">
              <Settings className="w-4 h-4 text-zinc-400" /> Gestionar Perfil
            </button>
            <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Entrenar Agente
            </button>
          </div>
        </header>

        {/* Hero Bot Status - Premium glassmorphism */}
        <div className="relative overflow-hidden rounded-[2rem] border border-zinc-800/60 bg-gradient-to-br from-zinc-900/80 to-[#0c0c0e] p-8 md:p-10 shadow-2xl backdrop-blur-xl group">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 rounded-[1.5rem] bg-gradient-to-tr from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]">
              <Bot className="w-12 h-12 text-indigo-400" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">Agente Activo en Producción</span>
              </div>
              <h2 className="text-3xl font-semibold text-white tracking-tight mb-2">
                Asistente de Ventas Operativo
              </h2>
              <p className="text-zinc-400 max-w-xl text-sm leading-relaxed">
                Tu agente está actualmente monitoreando tu sitio web, capturando leads y calificando prospectos en tiempo real mediante IA conversacional.
              </p>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto flex flex-col gap-3">
              <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/50 backdrop-blur-md w-full md:w-64">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-zinc-500 font-medium tracking-wide">SNIPPET DE INSTALACIÓN</span>
                  <button onClick={handleCopy} className="text-zinc-400 hover:text-white transition-colors">
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="bg-zinc-950 rounded-lg p-2.5 overflow-hidden">
                  <code className="text-xs text-indigo-300/80 break-all font-mono">
                    &lt;script src="...widget.js" defer&gt;&lt;/script&gt;
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid - Minimalist UI */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-400 tracking-wide">RENDIMIENTO ACTUAL</h3>
            <span className="text-xs text-zinc-600 font-mono">Últimos 7 días</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Leads Capturados" value="1,284" icon={Users} trend="+12%" chartColor="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
            <MetricCard title="Conversaciones" value="4,392" icon={MessageSquare} trend="+5.4%" chartColor="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
            <MetricCard title="Tasa de Conversión" value="29.2%" icon={Target} trend="+2.1%" chartColor="text-indigo-400" bg="bg-indigo-500/10" border="border-indigo-500/20" />
            <MetricCard title="Valor Generado" value="$42.5M" icon={DollarSign} trend="+18.5%" chartColor="text-purple-400" bg="bg-purple-500/10" border="border-purple-500/20" />
          </div>
        </div>

        {/* Bottom Section: Charts & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 rounded-3xl border border-zinc-800/60 bg-zinc-900/40 p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-end mb-6">
               <div>
                  <h3 className="text-lg font-medium text-white mb-1">Evolución de Interacciones</h3>
                  <p className="text-sm text-zinc-500">Comparativa de conversaciones vs leads calificados</p>
               </div>
               <div className="flex gap-2">
                 <span className="flex items-center gap-1.5 text-xs text-zinc-400"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Conversaciones</span>
                 <span className="flex items-center gap-1.5 text-xs text-zinc-400"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Leads</span>
               </div>
            </div>
            {/* Minimalist mock chart lines using CSS for demo */}
            <div className="h-64 mt-4 relative w-full border-b border-l border-zinc-800/50 flex items-end px-2 gap-4">
              {[40, 60, 45, 80, 55, 90, 75].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1 group relative">
                    <div className={`w-full max-w-[40px] rounded-t-sm bg-gradient-to-t from-indigo-500/20 to-indigo-500/80 transition-all duration-500 hover:opacity-100 opacity-80`} style={{ height: `${h}%` }}></div>
                    <div className={`w-full max-w-[40px] absolute bottom-0 rounded-t-sm bg-gradient-to-t from-emerald-500/40 to-emerald-400 transition-all duration-500 z-10 opacity-90`} style={{ height: `${h * 0.4}%` }}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/40 p-6 backdrop-blur-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-white">Actividad en Vivo</h3>
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            
            <div className="flex-1 space-y-5 overflow-y-auto pr-2 custom-scrollbar">
              <ActivityItem name="Carlos Santamaría" action="dejó sus datos de contacto" time="Hace 2 min" tag="Lead Calificado" />
              <ActivityItem name="Empresa de Logística" action="inició una conversación" time="Hace 5 min" tag="Consultando Precios" />
              <ActivityItem name="Marcela Figueroa" action="agendó una reunión via IA" time="Hace 12 min" tag="Reunión Agendada" />
              <ActivityItem name="Usuario Anónimo" action="preguntó sobre integraciones" time="Hace 28 min" tag="Soporte" />
            </div>
            
            <button className="w-full mt-4 py-3 rounded-xl border border-zinc-800 hover:bg-zinc-800/50 text-xs font-medium text-zinc-300 transition-colors flex justify-center items-center gap-2">
              Ver registro completo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Subcomponents for the dashboard
function MetricCard({ title, value, icon: Icon, trend, chartColor, bg, border }: any) {
  return (
    <div className="rounded-[1.5rem] bg-zinc-900/40 border border-zinc-800/60 p-5 hover:bg-zinc-800/40 transition-colors group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-white opacity-[0.02] rounded-full blur-xl group-hover:scale-150 transition-transform duration-700`} />
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-xl ${bg} ${border} border`}>
          <Icon className={`w-5 h-5 ${chartColor}`} />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-medium border border-emerald-500/10">
          <TrendingUp className="w-3 h-3" /> {trend}
        </div>
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium mb-1 tracking-wide">{title}</p>
        <p className="text-2xl font-semibold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ActivityItem({ name, action, time, tag }: any) {
  return (
    <div className="flex gap-4 group">
      <div className="relative pt-1 flex flex-col items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-[#0A0A0B] group-hover:bg-indigo-400 transition-colors z-10" />
        <div className="w-[1px] h-full bg-zinc-800/60 mt-1 absolute top-2.5" />
      </div>
      <div className="pb-4">
        <p className="text-sm font-medium text-zinc-200">
          {name} <span className="text-zinc-500 font-normal">{action}</span>
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] text-zinc-600 font-mono">{time}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">{tag}</span>
        </div>
      </div>
    </div>
  );
}
