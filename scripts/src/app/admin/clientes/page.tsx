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
                   <div className={`w-3 h-3 rounded-full ${c.bot_configs?.[0]?.active ? 'bg-green-500' : 'bg-red-500'} inline-block`}></div>
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