'use client';

import React from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  CreditCard, 
  Trash2, 
  Save, 
  Mail, 
  Lock, 
  Globe, 
  Smartphone,
  CheckCircle2,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function ClientSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Configuración de Cuenta</h1>
          <p className="text-[var(--muted)]">Gestiona tus preferencias personales y seguridad.</p>
        </div>
        <button className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold tracking-tight transition-all shadow-lg shadow-blue-500/20">
           <Save className="w-5 h-5" /> Guardar Cambios
        </button>
      </div>

      <div className="flex gap-8">
         <div className="w-64 space-y-2 shrink-0">
            <SettingsTab icon={User} label="Perfil Público" active />
            <SettingsTab icon={Shield} label="Seguridad & Password" />
            <SettingsTab icon={Bell} label="Notificaciones" />
            <SettingsTab icon={Globe} label="Conexiones & API" />
            <div className="pt-8 mt-8 border-t border-[var(--border)]">
               <button className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-500/5 rounded-2xl transition-all font-bold text-xs uppercase tracking-widest">
                  <Trash2 className="w-4 h-4" /> Eliminar Cuenta
               </button>
            </div>
         </div>

         <div className="flex-1 space-y-8">
            <div className="glass rounded-[40px] p-10 border border-[var(--border)] space-y-8">
               <div className="flex items-center gap-6 mb-2">
                  <div className="w-20 h-20 rounded-[24px] bg-[var(--bg3)] border border-white/5 flex items-center justify-center text-3xl font-bold text-blue-400">
                     E
                  </div>
                  <div>
                     <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Imagen de Perfil</h3>
                     <p className="text-xs text-[var(--muted)] mb-4 font-medium max-w-[200px]">Se recomienda un logo de al menos 400x400px en formato PNG o JPG.</p>
                     <div className="flex gap-3">
                        <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all">Subir Nueva</button>
                        <button className="px-5 py-2.5 bg-white/5 text-[var(--muted)] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">Eliminar</button>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/5">
                  <InputGroup label="Nombre de Empresa" value="E-Commerce Solutions SpA" />
                  <InputGroup label="Sitio Web" value="https://ecommerce-solutions.cl" />
                  <InputGroup label="Email de Contacto" value="contacto@ecommerce.cl" />
                  <InputGroup label="Región / Zona Horaria" value="Santiago (CL) - GMT-4" />
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest block px-1">Biografía de Empresa (Contexto para IA)</label>
                  <textarea 
                    rows={4}
                    className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
                    defaultValue="Somos una empresa líder en soluciones de comercio electrónico para el mercado chileno, con más de 10 años de experiencia..."
                  />
               </div>
            </div>

            <div className="glass rounded-[40px] p-10 border border-[var(--border)] space-y-6">
               <h3 className="text-xl font-bold text-white flex items-center gap-3 mb-2">
                  <Shield className="text-blue-400" /> Seguridad de Acceso
               </h3>
               <div className="space-y-4">
                  <SecurityCard title="Autenticación de Dos Factores (2FA)" status="Desactivado" action="Configurar" />
                  <SecurityCard title="Alertas de Inicio de Sesión" status="Activado" action="Gestionar" />
                  <SecurityCard title="Direcciones IP Permitidas" status="Cualquiera" action="Restringir" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function SettingsTab({ icon: Icon, label, active }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={`flex items-center justify-between px-6 py-4 w-full rounded-2xl transition-all font-bold text-xs uppercase tracking-widest border ${
      active 
      ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' 
      : 'text-[var(--muted)] border-transparent hover:bg-white/5 hover:text-white'
    }`}>
       <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : 'text-[var(--muted)]'}`} />
          {label}
       </div>
       {active && <ChevronRight className="w-4 h-4" />}
    </button>
  );
}

function InputGroup({ label, value }: { label: string, value: string }) {
  return (
    <div className="space-y-2">
       <label className="text-[10px] uppercase font-bold text-[var(--muted)] tracking-widest block px-1">{label}</label>
       <input 
         type="text" 
         className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-blue-500/50"
         defaultValue={value}
       />
    </div>
  );
}

function SecurityCard({ title, status, action }: { title: string, status: string, action: string }) {
  return (
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between">
       <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-1">{title}</h4>
          <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">Estado: <span className={status === 'Activado' ? 'text-emerald-500' : 'text-red-500'}>{status}</span></p>
       </div>
       <button className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all">{action}</button>
    </div>
  );
}
