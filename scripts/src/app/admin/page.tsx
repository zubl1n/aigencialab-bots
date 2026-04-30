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
          <div className="text-3xl font-bold text-gray-900">${mrr.toLocaleString('es-CL')}</div>
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