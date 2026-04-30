import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* SIDEBAR ADMIN */}
      <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col fixed left-0 top-0 h-full">
        <div className="font-bold text-xl mb-8 mt-2 px-2 border-b border-slate-700 pb-4">
          <span className="bg-purple-600 text-white rounded-md p-1 mr-2 text-sm">AI</span>
          AigenciaLab <span className="text-xs text-slate-400 font-normal">ADMIN</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/admin" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">🏠 Dashboard</Link>
          <Link href="/admin/clientes" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">👥 Clientes</Link>
          <Link href="/admin/bots" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">🤖 Bots/Agentes</Link>
          <Link href="/admin/leads" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">💬 Leads Global</Link>
          <Link href="/admin/pagos" className="block px-4 py-2 hover:bg-slate-800 rounded-lg">💳 Pagos</Link>
          <Link href="/admin/alertas" className="flex justify-between items-center px-4 py-2 hover:bg-slate-800 rounded-lg">
            <span>🔔 Alertas</span>
            <span className="bg-red-500 text-xs px-2 py-0.5 rounded-full">3</span>
          </Link>
        </nav>
        
        <div className="border-t border-slate-700 pt-4 mt-4 space-y-2">
          <Link href="/admin/settings" className="block px-4 py-2 text-slate-400 hover:text-white">⚙️ Mi cuenta</Link>
          <button className="block w-full text-left px-4 py-2 text-red-400 hover:text-red-300">Cerrar sesión</button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}