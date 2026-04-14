import Link from 'next/link';
import { ReactNode } from 'react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '🏠' },
  { href: '/admin/clientes', label: 'Clientes', icon: '👥' },
  { href: '/admin/bots', label: 'Bots/Agentes', icon: '🤖' },
  { href: '/admin/leads', label: 'Leads Global', icon: '💬' },
  { href: '/admin/pagos', label: 'Pagos', icon: '💳' },
  { href: '/admin/alertas', label: 'Alertas', icon: '🔔', badgeCount: 3 },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col fixed left-0 top-0 h-full z-50">
        <div className="mb-8 mt-2 px-2 border-b border-slate-700 pb-4">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="bg-purple-600 text-white rounded-md p-1.5 text-sm font-bold">AI</span>
            <span className="font-bold text-lg">genciaLab</span>
            <span className="text-xs text-slate-400 font-normal">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
            >
              <span className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </span>
              {item.badgeCount && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {item.badgeCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-700 pt-4 mt-4 space-y-1">
          <Link href="/" className="block px-4 py-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-sm">
            ← Ver landing
          </Link>
          <Link href="/admin/settings" className="block px-4 py-2.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors text-sm">
            ⚙️ Mi cuenta
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="w-full text-left px-4 py-2.5 text-red-400 hover:text-red-300 rounded-lg hover:bg-slate-800 transition-colors text-sm">
              🚪 Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
