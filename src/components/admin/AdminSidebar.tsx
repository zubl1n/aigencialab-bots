'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Bot,
  Target,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  CreditCard,
  Bell,
  BarChart2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { name: 'Dashboard',    href: '/admin',           icon: LayoutDashboard },
  { name: 'Clientes',     href: '/admin/clientes',  icon: Users },
  { name: 'Bots',         href: '/admin/bots',      icon: Bot },
  { name: 'Leads CRM',    href: '/admin/leads',     icon: Target },
  { name: 'Pagos',        href: '/admin/pagos',     icon: CreditCard },
  { name: 'Alertas',      href: '/admin/alertas',   icon: Bell },
  { name: 'Analytics',    href: '/dashboard/analytics', icon: BarChart2 },
  { name: 'Configuración',href: '/admin/settings',  icon: Settings },
];

export function AdminSidebar() {
  const pathname  = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark]           = useState(true);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out border-r border-border z-50 flex flex-col
        ${isCollapsed ? 'w-[60px]' : 'w-[240px]'}
        ${isDark ? 'bg-background' : 'bg-secondary'}
      `}
    >
      {/* Logo */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <Link href="/admin" className="flex-1 overflow-hidden">
            <img
              src="/logo-aigencialab.svg"
              alt="AIgenciaLab"
              className="h-8 w-auto max-w-[160px] object-left"
            />
          </Link>
        )}
        {isCollapsed && (
          <Link href="/admin" title="AIgenciaLab Admin">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#A555EC,#311B92)' }}>
              <span className="text-white font-black text-xs leading-none">AI</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-150 group relative rounded-lg
                ${isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <item.icon
                size={18}
                className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}
              />
              {!isCollapsed && <span>{item.name}</span>}

              {isCollapsed && (
                <div className="absolute left-14 invisible group-hover:visible bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap z-[100] pointer-events-none">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border mt-auto space-y-0.5">
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
  );
}
