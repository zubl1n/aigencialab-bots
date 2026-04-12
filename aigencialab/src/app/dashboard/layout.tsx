import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard — AigenciaLab.cl' }

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const navItems = [
    { href: '/dashboard',         icon: '📊', label: 'Overview' },
    { href: '/dashboard/leads',   icon: '🎯', label: 'Leads / Pipeline' },
    { href: '/dashboard/clients', icon: '🏢', label: 'Clientes' },
    { href: '/dashboard/chats',   icon: '💬', label: 'Conversaciones' },
    { href: '/dashboard/analytics', icon: '📈', label: 'BI Analytics' },
    { href: '/dashboard/agents',  icon: '🤖', label: 'Agentes IA' },
    { href: '/dashboard/tickets', icon: '🎫', label: 'Soporte & Tickets' },
  ]

  return (
    <div className="flex min-h-screen" style={{background:'#080a12'}}>
      {/* ── SIDEBAR ── */}
      <aside className="w-64 shrink-0 border-r border-white/5 flex flex-col" style={{background:'#0a0c16'}}>
        <div className="h-16 border-b border-white/5 flex items-center px-6">
          <Link href="/" className="font-bold text-lg">Aigencia<span className="text-gradient">Lab</span></Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-600 px-3 mb-2">Principal</div>
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm group">
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="text-xs font-semibold uppercase tracking-widest text-slate-600 px-3 mb-2 mt-6">Configuración</div>
          <Link href="/dashboard/onboarding" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm">
            <span>⚙️</span><span>Nuevo Cliente</span>
          </Link>
          <Link href="/audit" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm">
            <span>🔍</span><span>Auditoría</span>
          </Link>
        </nav>

        {/* User info */}
        <div className="border-t border-white/5 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-xs font-bold">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-300 truncate">{user.email}</div>
              <div className="text-xs text-slate-600">Admin</div>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST" className="mt-3">
            <button className="w-full text-left text-xs text-slate-600 hover:text-red-400 transition-colors px-1 py-1">Cerrar sesión</button>
          </form>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
