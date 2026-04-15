import { createClient } from '@supabase/supabase-js';
import { PLANS, formatPrice } from '@/lib/plans';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl'

/* ── Reusable Badge ────────────────────────────────────────── */
function Badge({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{children}</span>;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 font-medium">{label}</span>
      <span className="text-sm text-gray-900 font-semibold text-right max-w-[60%]">{value ?? '—'}</span>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>{icon}</span> {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────── */

export default async function AdminClienteDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch all client data
  const { data: client, error } = await supabase
    .from('clients')
    .select(`
      *,
      subscriptions(*),
      bot_configs(*),
      billing_profiles(*),
      api_keys(id, key, active, created_at),
      leads(id, contact_name, email, status, created_at)
    `)
    .eq('id', id)
    .single();

  if (error || !client) {
    notFound();
  }

  // Fetch conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, channel, contact_name, status, created_at')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  // Fetch admin action logs
  const { data: adminLogs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('module', 'admin')
    .contains('metadata', { client_id: id })
    .order('created_at', { ascending: false })
    .limit(20);

  // Derived data
  const sub = Array.isArray(client.subscriptions) ? client.subscriptions[0] : client.subscriptions;
  const bot = Array.isArray(client.bot_configs) ? client.bot_configs[0] : client.bot_configs;
  const billing = Array.isArray(client.billing_profiles) ? client.billing_profiles[0] : client.billing_profiles;
  const apiKey = Array.isArray(client.api_keys) ? client.api_keys[0] : client.api_keys;
  const leads = (client.leads as any[]) ?? [];
  const convs = conversations ?? [];
  const logs = adminLogs ?? [];
  const displayName = client.company_name || client.company || client.full_name || client.contact_name || '—';
  const plan = PLANS[client.plan as keyof typeof PLANS];
  const totalConvs = convs.length;
  const totalLeads = leads.length;
  const conversionRate = totalConvs > 0 ? Math.round((totalLeads / totalConvs) * 100) : 0;

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <Link href="/admin/clientes" className="text-gray-400 hover:text-gray-600 transition">
          ← Volver
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
          <p className="text-gray-500 mt-1">{client.email} · ID: <span className="font-mono text-xs">{client.id}</span></p>
        </div>
        <Link
          href={`/admin/clientes/${client.id}/bot-editor`}
          className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          ✏️ Editar Bot
        </Link>
        <Badge cls={bot?.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
          Bot: {bot?.active ? 'Activo' : 'Inactivo'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── 1. INFO GENERAL ──────────────────────────── */}
        <SectionCard title="Información General" icon="👤">
          <InfoRow label="Nombre / Empresa" value={displayName} />
          <InfoRow label="Email" value={client.email} />
          <InfoRow label="Teléfono" value={client.phone || client.whatsapp || '—'} />
          <InfoRow label="Sitio web" value={client.url || client.website || '—'} />
          <InfoRow label="Rubro" value={client.rubro || '—'} />
          <InfoRow label="Plan Activo" value={
            <Badge cls="bg-purple-100 text-purple-700">{client.plan ?? 'Starter'}</Badge>
          } />
          <InfoRow label="Precio" value={plan ? formatPrice(plan.price) : '—'} />
          <InfoRow label="Estado Suscripción" value={
            <Badge cls={sub?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
              {sub?.status ?? 'Sin suscripción'}
            </Badge>
          } />
          <InfoRow label="Billing Cycle" value={sub?.current_period_end ? `hasta ${new Date(sub.current_period_end).toLocaleDateString('es-CL')}` : '—'} />
          <InfoRow label="Trial" value={sub?.trial_ends_at ? new Date(sub.trial_ends_at).toLocaleDateString('es-CL') : '—'} />
          <InfoRow label="Fecha Registro" value={new Date(client.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })} />
        </SectionCard>

        {/* ─── 2. AGENTE / BOT ─────────────────────────── */}
        <SectionCard title="Agente / Bot" icon="🤖">
          <InfoRow label="Estado" value={
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${bot?.active ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>{bot?.active ? 'Activo' : 'Inactivo'}</span>
            </div>
          } />
          <InfoRow label="Nombre" value={bot?.bot_name || bot?.name || 'Asistente IA'} />
          <InfoRow label="Modelo" value={bot?.llm_config?.model || bot?.model || 'gpt-4o-mini'} />
          <InfoRow label="Idioma" value={(bot?.language || 'es').toUpperCase()} />
          <InfoRow label="Prompt Base" value={
            <span className="text-xs text-gray-600 line-clamp-2">{bot?.llm_config?.system_prompt || bot?.instructions || '(por defecto)'}</span>
          } />
          <div className="border-t border-gray-100 mt-4 pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">📊 Métricas</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalConvs}</div>
                <div className="text-xs text-blue-500">Conversaciones</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{totalLeads}</div>
                <div className="text-xs text-emerald-500">Leads</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{conversionRate}%</div>
                <div className="text-xs text-purple-500">Conversión</div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <form action="/api/admin/toggle-bot" method="POST">
              <input type="hidden" name="client_id" value={client.id} />
              <input type="hidden" name="active" value={bot?.active ? 'false' : 'true'} />
              <button className={`w-full text-sm font-semibold px-4 py-2.5 rounded-lg transition ${bot?.active ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}>
                {bot?.active ? '⏸ Desactivar Bot' : '▶ Activar Bot'}
              </button>
            </form>
          </div>
        </SectionCard>

        {/* ─── 3. CONFIGURACIÓN AVANZADA ─────────────── */}
        <SectionCard title="Configuración Avanzada" icon="⚙️">
          <InfoRow label="System Prompt" value={
            <span className="text-xs text-gray-600 line-clamp-3">{bot?.llm_config?.system_prompt || bot?.instructions || '(por defecto)'}</span>
          } />
          <InfoRow label="Temperatura" value={bot?.llm_config?.temperature ?? 0.7} />
          <InfoRow label="Max Tokens" value={bot?.llm_config?.max_tokens ?? 2048} />
          <InfoRow label="Umbral Escalado Humano" value={bot?.escalation_threshold ?? 'No configurado'} />
          <InfoRow label="Color Widget" value={
            bot?.widget_color ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-gray-200" style={{ background: bot.widget_color }} />
                <span className="font-mono text-xs">{bot.widget_color}</span>
              </div>
            ) : '—'
          } />
          <InfoRow label="Mensaje Bienvenida" value={bot?.welcome_message ?? '(por defecto)'} />
          <InfoRow label="Integraciones" value={
            <div className="flex flex-wrap gap-1">
              {client.channels?.whatsapp && <Badge cls="bg-green-100 text-green-700">WhatsApp</Badge>}
              {client.channels?.web && <Badge cls="bg-blue-100 text-blue-700">Web</Badge>}
              {client.channels?.email && <Badge cls="bg-yellow-100 text-yellow-700">Email</Badge>}
              {!client.channels?.whatsapp && !client.channels?.web && !client.channels?.email && <span className="text-gray-400 text-xs">Ninguna</span>}
            </div>
          } />
          <InfoRow label="Límite Mensajes/Mes" value={plan?.limits?.conversations ?? '—'} />
          <InfoRow label="API Key" value={apiKey?.key ? (
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{String(apiKey.key).slice(0, 12)}…</span>
          ) : '—'} />
        </SectionCard>

        {/* ─── 5. ACCIONES ADMIN ───────────────────────── */}
        <SectionCard title="Acciones Admin" icon="🛡️">
          <div className="space-y-3">
            <form action="/api/admin/client-actions" method="POST">
              <input type="hidden" name="client_id" value={client.id} />
              <input type="hidden" name="action" value="change_plan" />
              <div className="flex gap-2">
                <select name="new_plan" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="Starter">Starter ($45/mo)</option>
                  <option value="Pro">Pro ($119/mo)</option>
                  <option value="Business">Business ($259/mo)</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
                <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-200 transition">
                  Cambiar Plan
                </button>
              </div>
            </form>

            <form action="/api/admin/client-actions" method="POST">
              <input type="hidden" name="client_id" value={client.id} />
              <input type="hidden" name="action" value="extend_trial" />
              <div className="flex gap-2">
                <select name="days" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="7">+7 días</option>
                  <option value="14">+14 días</option>
                  <option value="30">+30 días</option>
                </select>
                <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200 transition">
                  Extender Trial
                </button>
              </div>
            </form>

            <form action="/api/admin/client-actions" method="POST">
              <input type="hidden" name="client_id" value={client.id} />
              <input type="hidden" name="action" value="reset_api_key" />
              <button className="w-full bg-orange-100 text-orange-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-200 transition">
                🔑 Resetear API Key
              </button>
            </form>

            <form action="/api/admin/client-actions" method="POST">
              <input type="hidden" name="client_id" value={client.id} />
              <input type="hidden" name="action" value={client.status === 'suspended' ? 'reactivate' : 'suspend'} />
              <button className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition ${client.status === 'suspended' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                {client.status === 'suspended' ? '✅ Reactivar Cuenta' : '⛔ Suspender Cuenta'}
              </button>
            </form>

            <a
              href={`mailto:${client.email}?subject=AIgenciaLab%20-%20Mensaje%20de%20tu%20administrador`}
              className="block w-full bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition text-center"
            >
              ✉️ Enviar Email Directo
            </a>
            <Link
              href={`/admin/clientes/${client.id}/bot-editor`}
              className="block w-full bg-blue-100 text-blue-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-200 transition text-center"
            >
              ✏️ Editor Visual del Bot
            </Link>
          </div>
        </SectionCard>
      </div>

      {/* ─── 4. HISTORIAL (Full Width) ─────────────────── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations */}
        <SectionCard title="Últimas Conversaciones" icon="💬">
          {convs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin conversaciones aún</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {convs.map((conv: any) => (
                <div key={conv.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${conv.status === 'open' ? 'bg-green-400' : conv.status === 'needs_human' ? 'bg-orange-400' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{conv.contact_name || 'Anónimo'}</div>
                    <div className="text-xs text-gray-400">{conv.channel} · {conv.status} · {new Date(conv.created_at).toLocaleDateString('es-CL')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Leads */}
        <SectionCard title="Leads Generados" icon="🎯">
          {leads.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin leads generados</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {leads.slice(0, 20).map((lead: any) => (
                <div key={lead.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                  <Badge cls={lead.status === 'hot' ? 'bg-red-100 text-red-700' : lead.status === 'warm' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}>
                    {lead.status ?? 'new'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{lead.contact_name || '—'}</div>
                    <div className="text-xs text-gray-400">{lead.email || '—'} · {new Date(lead.created_at).toLocaleDateString('es-CL')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Admin Logs */}
        <SectionCard title="Log Admin" icon="📋">
          {logs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin acciones registradas</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log: any) => (
                <div key={log.id} className="p-3 rounded-lg hover:bg-gray-50 transition">
                  <div className="text-sm font-medium text-gray-900">{log.event}</div>
                  <div className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString('es-CL')}</div>
                  {log.metadata && (
                    <div className="text-xs text-gray-500 mt-1 font-mono bg-gray-50 rounded px-2 py-1">
                      {JSON.stringify(log.metadata).slice(0, 100)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ─── WIDGET INSTALLATION (Full Width) ──────────── */}
      <div className="mt-6">
        <SectionCard title="Instalación del Widget" icon="📋">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Copia este snippet y pégalo antes del cierre de <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">&lt;/body&gt;</code> en el sitio del cliente:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <code className="text-green-400 text-xs block font-mono leading-relaxed break-all">
                  {`<script src="${SITE_URL}/api/widget/${client.id}/script.js"></script>`}
                </code>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                El widget se actualiza automáticamente al cambiar la configuración del bot.
              </p>
            </div>
            <div className="space-y-3">
              <a
                href={`${SITE_URL}/api/widget/${client.id}/script.js`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition text-center"
              >
                🔗 Ver script.js
              </a>
              <a
                href={`${SITE_URL}/widget/${client.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-purple-100 text-purple-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-purple-200 transition text-center"
              >
                👁️ Preview del Chat Widget
              </a>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
