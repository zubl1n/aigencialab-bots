'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  UserPlus,
  Users,
  BarChart3,
  Plug,
  LifeBuoy,
  Users2,
  FileBarChart,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sun,
  Moon,
  Clock,
  Zap,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Client, BotConfig } from '@/types/client';
import { normalizePlanId, planAtLeast, PLAN_CONFIG, type PlanId } from '@/lib/plans.config';

/* ── Nav configuration — matches Prompt Maestro v3.0 spec ────────── */
interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  showStatus?: boolean;   // show bot status indicator
  showUnread?: boolean;   // show unread badge count
  requiresPlan?: string;  // minimum plan required
  badge?: string;         // plan badge text (e.g., "Pro")
}

const navItems: NavItem[] = [
  { name: 'Inicio',          href: '/dashboard',               icon: LayoutDashboard },
  { name: 'Mi Agente IA',    href: '/dashboard/bot',           icon: Bot,             showStatus: true },
  { name: 'Conversaciones',  href: '/dashboard/conversations', icon: MessageSquare },
  { name: 'Leads',           href: '/dashboard/leads',         icon: UserPlus },
  { name: 'CRM',             href: '/dashboard/crm',           icon: Users,           requiresPlan: 'pro',  badge: 'Pro' },
  { name: 'Analytics',       href: '/dashboard/analytics',     icon: BarChart3 },
  { name: 'Integraciones',   href: '/dashboard/integrations',  icon: Plug },
  { name: 'Tickets',         href: '/dashboard/tickets',       icon: LifeBuoy,        showUnread: true },
  { name: 'Equipo',          href: '/dashboard/team',          icon: Users2,          requiresPlan: 'pro',  badge: 'Pro' },
  { name: 'Reportes',        href: '/dashboard/reports',       icon: FileBarChart,    requiresPlan: 'pro',  badge: 'Pro' },
  { name: 'Ajustes',         href: '/dashboard/settings',      icon: Settings },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [client, setClient] = useState<Client | null>(null);
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
  const [trialExpired, setTrialExpired]   = useState(false);
  const [trialTotalDays, setTrialTotalDays] = useState(14);
  const [unreadTickets, setUnreadTickets] = useState(0);
  const [clientPlan, setClientPlan]       = useState<PlanId>('basic');

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [clientRes, botRes, subRes, ticketsRes] = await Promise.all([
        supabase.from('clients').select('*').eq('id', user.id).single(),
        supabase.from('bot_configs').select('*').eq('client_id', user.id).single(),
        supabase.from('subscriptions').select('trial_ends_at, plan').eq('client_id', user.id).single(),
        supabase.from('tickets')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', user.id)
          .eq('unread_client', true)
          .not('status', 'eq', 'closed'),
      ]);

      if (clientRes.data) setClient(clientRes.data);
      if (botRes.data) setBotConfig(botRes.data);
      if ((ticketsRes.count ?? 0) > 0) setUnreadTickets(ticketsRes.count ?? 0);

      // Set client plan from subscriptions or clients table
      const plan = subRes.data?.plan ?? (clientRes.data as any)?.plan ?? 'basic';
      setClientPlan(normalizePlanId(plan));

      const trialEndStr = subRes.data?.trial_ends_at ?? (clientRes.data as any)?.trial_ends_at;
      if (trialEndStr) {
        const trialEnd  = new Date(trialEndStr).getTime();
        const created   = new Date((clientRes.data as any)?.created_at ?? trialEndStr).getTime();
        const totalDays = Math.max(7, Math.round((trialEnd - created) / 86400000));
        const daysLeft  = Math.ceil((trialEnd - Date.now()) / 86400000);
        setTrialTotalDays(totalDays);
        if (daysLeft <= 0) { setTrialExpired(true); setTrialDaysLeft(0); }
        else               { setTrialDaysLeft(daysLeft); setTrialExpired(false); }
      }


    }
    fetchData();
  }, []);


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
              <div className="w-8 h-8 rounded-lg flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg,#A555EC,#311B92)' }}>
                {client?.logo_url ? (
                  <img src={client.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-white font-black text-xs">AI</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <img src="/logo-aigencialab.svg" alt="AIgenciaLab" className="h-5 w-auto mb-0.5" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">
                  {PLAN_CONFIG[clientPlan]?.name ?? 'Basic'}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#A555EC,#311B92)' }}>
              <span className="text-white font-black text-xs leading-none">AI</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* ─── Trial Badge ───────────────────────────────────────── */}
        {!isCollapsed && (trialDaysLeft !== null || trialExpired) && (
          <div className="mx-2 mb-2">
            {trialExpired ? (
              /* Red: trial expired */
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    Trial vencido
                  </span>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-red-500 hover:bg-red-400 text-white text-[10px] font-extrabold rounded-lg transition-all"
                >
                  <Zap className="w-3 h-3" /> Suscribirse →
                </Link>
              </div>
            ) : (
              /* Amber: trial active */
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">
                    {trialDaysLeft} días de prueba gratuita
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1 bg-white/10 rounded-full mb-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((trialTotalDays - (trialDaysLeft || 0)) / trialTotalDays) * 100)}%` }}

                  />
                </div>
                <Link
                  href="/dashboard/billing"
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-extrabold rounded-lg transition-all"
                >
                  <Zap className="w-3 h-3" /> Suscribirse →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const isLocked = !!(item.requiresPlan && !planAtLeast(clientPlan, item.requiresPlan));

            if (isLocked) {
              return (
                <Link
                  key={item.href}
                  href="/dashboard/billing"
                  title={`Requiere plan ${item.badge ?? item.requiresPlan} o superior`}
                  className={`
                    flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg opacity-40 hover:opacity-60 transition-opacity group relative
                    ${isCollapsed ? 'justify-center' : ''}
                    text-muted-foreground
                  `}
                >
                  <item.icon size={18} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.badge}
                        </span>
                      )}
                      <Lock size={12} className="opacity-60" />
                    </>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-14 invisible group-hover:visible bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-[100]">
                      {item.name} 🔒 Plan {item.badge ?? item.requiresPlan}
                    </div>
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 group relative rounded-lg
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
                  <div className={`w-1.5 h-1.5 rounded-full ${botConfig?.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                )}

                {!isCollapsed && item.showUnread && unreadTickets > 0 && (
                  <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full">
                    {unreadTickets > 9 ? '9+' : unreadTickets}
                  </span>
                )}

                {isCollapsed && (
                  <div className="absolute left-14 invisible group-hover:visible bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-[100]">
                    {item.name}
                    {item.showUnread && unreadTickets > 0 && ` (${unreadTickets})`}
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
              flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors rounded-lg
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            {!isCollapsed && <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors rounded-lg
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
        />
      )}
    </>
  );
}
