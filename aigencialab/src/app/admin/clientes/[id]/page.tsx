import { createClient } from '@supabase/supabase-js';
import { PLANS_LIST } from '@/lib/plans';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aigencialab.cl';

/* ── Helpers ─────────────────────────────────────────────── */
function Badge({ children, cls }: { children: React.ReactNode; cls: string }) {
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>{children}</span>;
}
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 font-medium flex-shrink-0 mr-4">{label}</span>
      <span className="text-sm text-gray-900 font-semibold text-right">{value ?? '—'}</span>
    </div>
  );
}
function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><span>{icon}</span> {title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default async function AdminClienteDetalle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ── Query 1: client base data (flat, no nested) ───────────
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .select('id, email, company_name, company, contact_name, plan, status, created_at, trial_ends_at, payment_status, rubro, whatsapp, url, channels')
    .eq('id', id)
    .maybeSingle();

  if (clientErr || !client) {
    console.error('[admin/clientes/[id]] client not found:', id, clientErr?.message);
    notFound();
  }

  // ── Query 2: subscription ─────────────────────────────────
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, plan, trial_ends_at, current_period_end, payment_status')
    .eq('client_id', id)
    .maybeSingle();

  // ── Query 3: bot_config ───────────────────────────────────
  const { data: bot } = await supabase
    .from('bot_configs')
    .select('id, active, bot_name, name, welcome_message, widget_color, language, model, temperature, max_tokens, system_prompt')
    .eq('client_id', id)
    .maybeSingle();

  // ── Query 4: billing profile ──────────────────────────────
  const { data: billing } = await supabase
    .from('billing_profiles')
    .select('payment_status, card_brand, card_last4, mp_customer_id')
    .eq('client_id', id)
    .maybeSingle();

  // ── Query 5: api key ──────────────────────────────────────
  const { data: apiKeyRow } = await supabase
    .from('api_keys')
    .select('id, key, active, created_at')
    .eq('client_id', id)
    .maybeSingle();

  // ── Query 6: leads (last 20) ──────────────────────────────
  const { data: leads } = await supabase
    .from('leads')
    .select('id, contact_name, email, status, created_at')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  // ── Query 7: conversations (last 20) ──────────────────────
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id, channel, contact_name, status, created_at')
    .eq('client_id', id)
    .order('created_at', { ascending: false })
    .limit(20);

  // ── Query 8: audit logs ───────────────────────────────────
  const { data: adminLogs } = await supabase
    .from('audit_logs')
    .select('id, event, created_at, metadata')
    .eq('module', 'admin')
    .contains('metadata', { client_id: id })
    .order('created_at', { ascending: false })
    .limit(20);

  // ── Derived ───────────────────────────────────────────────
  const displayName  = client.company_name || client.company || client.contact_name || client.email?.split('@')[0] || '—';
  const planInfo     = PLANS_LIST.find(p => p.name.toLowerCase() === (client.plan ?? 'starter').toLowerCase());
  const totalConvs   = conversations?.length ?? 0;
  const totalLeads   = leads?.length ?? 0;
  const convRate     = totalConvs > 0 ? Math.round((totalLeads / totalConvs) * 100) : 0;

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <Link href="/admin/clientes" className="text-gray-400 hover:text-gray-600 transition">← Volver</Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
          <p className="text-gray-500 mt-1 text-sm">{client.email} · <span className="font-mono text-xs bg-gray-100 px-1 rounded">{client.id}</span></p>
        </div>
        <Badge cls={bot?.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
          Bot: {bot?.active ? '● Activo' : '○ Inactivo'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── 1. INFO GENERAL ─────────────────────────────── */}
        <SectionCard title="Información General" icon="👤">
          <InfoRow label="Nombre / Empresa" value={displayName} />
          <InfoRow label="Email" value={client.email} />
          <InfoRow label="WhatsApp" value={client.whatsapp ?? '—'} />
          <InfoRow label="Sitio web" value={client.url ? <a href={client.url} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline text-xs">{client.url}</a> : '—'} />
          <InfoRow label="Rubro" value={client.rubro ?? '—'} />
          <InfoRow label="Plan" value={<Badge cls="bg-purple-100 text-purple-700">{client.plan ?? 'Starter'}</Badge>} />
          {planInfo && <InfoRow label="Precio" value={`$${planInfo.monthlyUSD} USD/mes`} />}
          <InfoRow label="Estado Suscripción" value={
            <Badge cls={sub?.status === 'active' ? 'bg-green-100 text-green-700' : sub?.status === 'trialing' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600'}>
              {sub?.status ?? 'sin suscripción'}
            </Badge>
          } />
          <InfoRow label="Trial hasta" value={sub?.trial_ends_at ? new Date(sub.trial_ends_at).toLocaleDateString('es-CL') : (client.trial_ends_at ? new Date(client.trial_ends_at).toLocaleDateString('es-CL') : '—')} />
          <InfoRow label="Registrado" value={new Date(client.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })} />
          <InfoRow label="Pago MP" value={billing?.payment_status ?? client.payment_status ?? '—'} />
          {billing?.card_last4 && <InfoRow label="Tarjeta" value={`${billing.card_brand ?? '••'} ••••${billing.card_last4}`} />}
        </SectionCard>

        {/* ─── 2. AGENTE / BOT ─────────────────────────────── */}
        <SectionCard title="Agente / Bot" icon="🤖">
          <InfoRow label="Estado" value={
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${bot?.active ? 'bg-green-400' : 'bg-red-400'}`} />
              <span>{bot?.active ? 'Activo' : 'Inactivo'}</span>
            </div>
          } />
          <InfoRow label="Nombre" value={bot?.bot_name ?? bot?.name ?? 'Asistente IA'} />
          <InfoRow label="Modelo IA" value={bot?.model ?? 'gpt-4o-mini'} />
          <InfoRow label="Temperatura" value={bot?.temperature ?? 0.7} />
          <InfoRow label="Max Tokens" value={bot?.max_tokens ?? 1024} />
          <InfoRow label="Idioma" value={(bot?.language ?? 'es').toUpperCase()} />
          <InfoRow label="Mensaje bienvenida" value={<span className="text-xs text-gray-600 line-clamp-2">{bot?.welcome_message ?? '—'}</span>} />
          <InfoRow label="Color widget" value={
            bot?.widget_color ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border border-gray-200 inline-block" style={{ background: bot.widget_color }} />
                <span className="font-mono text-xs">{bot.widget_color}</span>
              </div>
            ) : '—'
          } />

          {/* Metrics */}
          <div className="border-t border-gray-100 mt-4 pt-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">📊 Métricas</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{totalConvs}</div>
                <div className="text-xs text-blue-500">Conversaciones</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-emerald-600">{totalLeads}</div>
                <div className="text-xs text-emerald-500">Leads</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{convRate}%</div>
                <div className="text-xs text-purple-500">Conversión</div>
              </div>
            </div>
          </div>

          {/* Toggle */}
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

        {/* ─── 3. ACCIONES ADMIN ───────────────────────────── */}
        <SectionCard title="Acciones Admin" icon="🛡️">
          <div className="space-y-3">
            {/* Cambiar plan */}
            <form action="/api/admin/set-plan" method="POST">
              <input type="hidden" name="client_id" value={client.id} />
              <div className="flex gap-2">
                <select name="plan" defaultValue={client.plan ?? 'Starter'}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="Starter">Starter ($45/mo)</option>
                  <option value="Pro">Pro ($119/mo)</option>
                  <option value="Business">Business ($259/mo)</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
                <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-200 transition">Cambiar Plan</button>
              </div>
            </form>

            {/* Extender trial */}
            <form action="/api/admin/client-actions" method="POST">
              <input type="hidden" name="client_id" value={client.id} />
              <input type="hidden" name="action" value="extend_trial" />
              <div className="flex gap-2">
                <select name="days" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="7">+7 días</option>
                  <option value="14">+14 días</option>
                  <option value="30">+30 días</option>
                </select>
                <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200 transition">Extender Trial</button>
              </div>
            </form>

            {/* Reset API Key */}
            <form action="/api/admin/client-actions" method="POST">
              <input type="hidden" name="client_id" value={client.id} />
              <input type="hidden" name="action" value="reset_api_key" />
              <button className="w-full bg-orange-100 text-orange-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-200 transition">
                🔑 Resetear API Key
              </button>
            </form>

            {/* Suspender/Reactivar */}
            <form action="/api/admin/client-actions" method="POST">
              <input type="hidden" name="client_id" value={client.id} />
              <input type="hidden" name="action" value={client.status === 'suspended' ? 'reactivate' : 'suspend'} />
              <button className={`w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition ${client.status === 'suspended' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                {client.status === 'suspended' ? '✅ Reactivar Cuenta' : '⛔ Suspender Cuenta'}
              </button>
            </form>

            <a href={`mailto:${client.email}?subject=AIgenciaLab%20-%20Administrador`}
              className="block w-full bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition text-center">
              ✉️ Enviar Email
            </a>
          </div>
        </SectionCard>

        {/* ─── 4. API KEY + SNIPPET ────────────────────────── */}
        <SectionCard title="Instalación & API Key" icon="📋">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">API Key del cliente</p>
              {apiKeyRow?.key ? (
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 break-all">{apiKeyRow.key}</div>
              ) : (
                <div className="text-sm text-gray-400 italic">Sin API Key generada</div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Snippet de instalación</p>
              <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs text-green-400 break-all">
                {`<script src="${SITE_URL}/api/widget/${client.id}/script.js"></script>`}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <a href={`${SITE_URL}/api/widget/${client.id}/script.js`} target="_blank" rel="noreferrer"
                className="flex-1 text-center text-xs font-semibold px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                🔗 Ver script.js
              </a>
              <a href={`${SITE_URL}/widget/${client.id}`} target="_blank" rel="noreferrer"
                className="flex-1 text-center text-xs font-semibold px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition">
                👁️ Preview Widget
              </a>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ─── HISTORIAL (full width) ──────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversaciones */}
        <SectionCard title="Últimas Conversaciones" icon="💬">
          {!conversations?.length ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin conversaciones aún</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {conversations.map((c: any) => (
                <div key={c.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.status === 'open' ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{c.contact_name || 'Anónimo'}</div>
                    <div className="text-xs text-gray-400">{c.channel} · {c.status} · {new Date(c.created_at).toLocaleDateString('es-CL')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Leads */}
        <SectionCard title="Leads Generados" icon="🎯">
          {!leads?.length ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin leads generados</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {leads.map((l: any) => (
                <div key={l.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                  <Badge cls={l.status === 'hot' ? 'bg-red-100 text-red-700' : l.status === 'warm' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}>
                    {l.status ?? 'new'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{l.contact_name || '—'}</div>
                    <div className="text-xs text-gray-400">{l.email || '—'} · {new Date(l.created_at).toLocaleDateString('es-CL')}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Admin Log */}
        <SectionCard title="Log Admin" icon="📋">
          {!adminLogs?.length ? (
            <p className="text-sm text-gray-400 text-center py-4">Sin acciones registradas</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {adminLogs.map((log: any) => (
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
    </div>
  );
}
