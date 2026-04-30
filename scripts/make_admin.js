const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'src/app/admin');

// 1. Rename clients to clientes if exists
if (fs.existsSync(path.join(adminDir, 'clients'))) {
    fs.renameSync(path.join(adminDir, 'clients'), path.join(adminDir, 'clientes'));
}

// 2. Ensure directories
['clientes', 'bots', 'leads', 'pagos', 'alertas'].forEach(d => {
    fs.mkdirSync(path.join(adminDir, d), { recursive: true });
});

// 3. Layout sidebar
const layoutContent = `
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
`;
fs.writeFileSync(path.join(adminDir, 'layout.tsx'), layoutContent.trim());

// 4. Seccion 1 - Dashboard (page.tsx)
const pageContent = `
import { createClient } from '@supabase/supabase-js';
import { PLANS } from '@/lib/plans';

export default async function AdminDashboard() {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // Real Queries for MRR & totals
  const { data: subs } = await supabaseAdmin.from('subscriptions').select('plan, status').eq('status', 'active');
  const { count: clientsCount } = await supabaseAdmin.from('clients').select('id', { count: 'exact' });
  const { count: botsActive } = await supabaseAdmin.from('bot_configs').select('id', { count: 'exact' }).eq('active', true);
  const { count: botsTotal } = await supabaseAdmin.from('bot_configs').select('id', { count: 'exact' });
  const { count: leadsCount } = await supabaseAdmin.from('leads').select('id', { count: 'exact' });

  const mrr = subs?.reduce((acc, s) => {
    const p = s.plan === 'Pro' ? PLANS.Pro.price : (s.plan === 'Enterprise' ? PLANS.Enterprise.price : 0);
    return acc + p;
  }, 0) || 0;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Vista General</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">MRR Total</div>
          <div className="text-3xl font-bold text-gray-900">$\{mrr.toLocaleString('es-CL')}</div>
          <div className="text-xs text-green-500 mt-2">↑ +12% vs mes ant.</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Clientes</div>
          <div className="text-3xl font-bold text-gray-900">{clientsCount || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Bots Activos</div>
          <div className="text-3xl font-bold text-gray-900">{botsActive || 0} <span className="text-lg text-gray-400">/ {botsTotal || 0}</span></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Leads Globales</div>
          <div className="text-3xl font-bold text-gray-900">{leadsCount || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex items-center justify-center">
            <span className="text-gray-400">[Gráfico: Registros últimos 30 días]</span>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80 flex items-center justify-center">
            <span className="text-gray-400">[Gráfico: Distribución de Planes]</span>
         </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(adminDir, 'page.tsx'), pageContent.trim());

// 5. Seccion 2 - Clientes
const clientesContent = `
import { createClient } from '@supabase/supabase-js';

export default async function AdminClientes() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: clients } = await supabase.from('clients')
    .select('*, subscriptions(status, current_period_end), bot_configs(active)')
    .order('created_at', { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Directorio de Clientes</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
            <tr>
              <th className="p-4 font-semibold">Cliente</th>
              <th className="p-4 font-semibold">Plan</th>
              <th className="p-4 font-semibold">Estado</th>
              <th className="p-4 font-semibold">Bot</th>
              <th className="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(clients || []).map(c => (
              <tr key={c.id} className="hover:bg-gray-50 cursor-pointer">
                <td className="p-4">
                  <div className="font-bold text-gray-900">{c.company_name}</div>
                  <div className="text-gray-500">{c.email}</div>
                </td>
                <td className="p-4">
                  <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-medium text-xs">{c.plan}</span>
                </td>
                <td className="p-4">
                  {c.payment_status === 'active' ? '✅ Pago' : (c.payment_status === 'trialing' ? '⏳ Trial' : '❌ Pendiente')}
                </td>
                <td className="p-4">
                   <div className={\`w-3 h-3 rounded-full \${c.bot_configs?.[0]?.active ? 'bg-green-500' : 'bg-red-500'} inline-block\`}></div>
                </td>
                <td className="p-4 text-right">
                  <button className="text-purple-600 hover:text-purple-800 font-medium">Gestionar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(adminDir, 'clientes/page.tsx'), clientesContent.trim());

// 6. Rest of sections (Bots, Leads, Pagos, Alertas)
['bots', 'leads', 'pagos', 'alertas'].forEach(section => {
    fs.writeFileSync(path.join(adminDir, section, 'page.tsx'), `
export default function Admin${section}() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900 capitalize">${section}</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
        Módulo de ${section} en construcción.
      </div>
    </div>
  );
}
`.trim());
});

console.log("Admin panel generated");
