'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Bot, 
  MessageSquare, 
  Target, 
  Download, 
  CreditCard, 
  HelpCircle, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Client, BotConfig } from '@/types/client';

const navItems = [
  { name: 'Inicio', href: '/dashboard', icon: Home },
  { name: 'Mi bot', href: '/dashboard/bot', icon: Bot, showStatus: true },
  { name: 'Conversaciones', href: '/dashboard/conversations', icon: MessageSquare },
  { name: 'Leads capturados', href: '/dashboard/leads', icon: Target },
  { name: 'Instalación', href: '/dashboard/installation', icon: Download },
  { name: 'Facturación', href: '/dashboard/billing', icon: CreditCard },
  { name: 'Soporte', href: '/dashboard/support', icon: HelpCircle },
  { name: 'Configuración', href: '/dashboard/settings', icon: Settings },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // Mobile state
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop state
  const [isDark, setIsDark] = useState(true);
  
  const [client, setClient] = useState<Client | null>(null);
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', user.id)
          .single();
        
        const { data: botData } = await supabase
          .from('bot_configs')
          .select('*')
          .eq('client_id', user.id)
          .single();
        
        if (clientData) setClient(clientData);
        if (botData) setBotConfig(botData);
      }
    }
    fetchData();
  }, [supabase]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-secondary border border-border rounded-lg text-foreground"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out border-r border-border z-50 flex flex-col lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'w-[60px]' : 'w-[240px]'}
        ${isDark ? 'bg-background' : 'bg-secondary'}
      `}>
        {/* Header / Logo */}
        <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
           {!isCollapsed ? (
             <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  {client?.logo_url ? (
                    <img src={client.logo_url} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Bot className="text-primary-foreground w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-bold text-foreground truncate uppercase tracking-tighter">{client?.company_name || 'Mi Empresa'}</h2>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">{client?.plan || 'Starter'}</p>
                </div>
             </div>
           ) : (
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Bot className="text-primary-foreground w-5 h-5" />
             </div>
           )}
           <button 
             onClick={() => setIsCollapsed(!isCollapsed)}
             className="hidden lg:flex p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
           >
             {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
           </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
              >
                <item.icon size={18} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                {!isCollapsed && <span className="flex-1">{item.name}</span>}
                
                {!isCollapsed && item.showStatus && (
                  <div className={`w-1.5 h-1.5 rounded-full ${botConfig?.active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                )}

                {isCollapsed && (
                   <div className="absolute left-14 invisible group-hover:visible bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-[100]">
                      {item.name}
                   </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-border mt-auto space-y-1">
          {!isCollapsed && client && (
            <div className="px-3 py-2 mb-2">
               <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold">
                    {client.company_name?.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-[10px] font-medium text-foreground truncate max-w-[140px]">{client.email}</p>
               </div>
               <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <ShieldCheck size={10} className="text-primary" />
                  <span>Acceso verificado</span>
               </div>
            </div>
          )}

          <button 
            onClick={toggleTheme}
            className={`
              flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {!isCollapsed && <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>}
          </button>

          <button 
            onClick={handleLogout}
            className={`
              flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
