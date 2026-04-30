import Link from 'next/link';
import { ReactNode } from 'react';
import {
  LayoutDashboard, Users, Bot, MessageSquare, CreditCard,
  TicketIcon, Bell, ClipboardList, Settings, LogOut,
  Target, ChevronRight, Zap,
} from 'lucide-react';

const navItems = [
  { href: '/admin',            label: 'Dashboard',   icon: LayoutDashboard, group: 'main' },
  { href: '/admin/clientes',   label: 'Clientes',    icon: Users,           group: 'main' },
  { href: '/admin/bots',       label: 'Bots / IA',   icon: Bot,             group: 'main' },
  { href: '/admin/leads',      label: 'Leads Global',icon: Target,          group: 'main' },
  { href: '/admin/pagos',      label: 'Pagos',       icon: CreditCard,      group: 'main' },
  { href: '/admin/tickets',    label: 'Tickets',     icon: TicketIcon,      group: 'ops'  },
  { href: '/admin/alertas',    label: 'Alertas',     icon: Bell,            group: 'ops'  },
  { href: '/admin/auditorias', label: 'Auditorías',  icon: ClipboardList,   group: 'ops'  },
  { href: '/admin/settings',   label: 'Configuración', icon: Settings,       group: 'sys'  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(135deg, #07070f 0%, #0d0b1a 50%, #07070f 100%)',
      fontFamily: "'Inter', 'system-ui', sans-serif",
    }}>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="w-[220px] shrink-0 fixed left-0 top-0 h-full flex flex-col z-50"
        style={{
          background: 'rgba(10,9,20,0.95)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-purple-900/50">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white font-black text-sm tracking-tight leading-none">AIgenciaLab</div>
              <div className="text-[10px] bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-bold uppercase tracking-widest mt-0.5">Admin</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">

          {/* Main group */}
          <div className="mb-3">
            <div className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 px-3 mb-1.5">Principal</div>
            {navItems.filter(i => i.group === 'main').map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all group"
              >
                <Icon className="w-4 h-4 flex-shrink-0 group-hover:text-[#A78BFA] transition-colors" />
                <span className="flex-1">{label}</span>
              </Link>
            ))}
          </div>

          {/* Ops group */}
          <div className="mb-3">
            <div className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 px-3 mb-1.5">Operaciones</div>
            {navItems.filter(i => i.group === 'ops').map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all group"
              >
                <Icon className="w-4 h-4 flex-shrink-0 group-hover:text-[#A78BFA] transition-colors" />
                <span className="flex-1">{label}</span>
              </Link>
            ))}
          </div>

          {/* System group */}
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.15em] text-white/20 px-3 mb-1.5">Sistema</div>
            {navItems.filter(i => i.group === 'sys').map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all group"
              >
                <Icon className="w-4 h-4 flex-shrink-0 group-hover:text-[#A78BFA] transition-colors" />
                <span className="flex-1">{label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 pb-5 border-t border-white/[0.06] pt-3 space-y-0.5">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Ver landing
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.06] transition"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────── */}
      <main className="flex-1 ml-[220px] min-h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
