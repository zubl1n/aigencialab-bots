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
  Moon
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Clientes', href: '/admin/clients', icon: Users },
  { name: 'Bots', href: '/admin/bots', icon: Bot },
  { name: 'Leads CRM', href: '/admin/leads', icon: Target },
  { name: 'Configuración', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(true); // Default to dark as per Tech-Noir legacy

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
      {/* Header / Logo */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Bot className="text-primary-foreground w-5 h-5" />
            </div>
            <span className="font-bold text-foreground tracking-tight">AIgenciaLab</span>
          </div>
        )}
        {isCollapsed && (
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
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href}
              href={item.href}
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
              {!isCollapsed && <span>{item.name}</span>}
              
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
  );
}

