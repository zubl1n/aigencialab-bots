import { createAdminSupabase } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const TONES = ['amigable', 'formal', 'técnico', 'entusiasta', 'empático']
const LANGUAGES = [
  { value: 'es', label: '🇪🇸 Español' },
  { value: 'en', label: '🇺🇸 English' },
  { value: 'pt', label: '🇧🇷 Português' },
]
const MODELS = ['gpt-4o-mini', 'gpt-4o', 'claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022']

export default async function BotEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminSupabase()

  const { data: client } = await supabase
    .from('clients')
    .select('id, company_name, company, email')
    .eq('id', id)
    .single()

  if (!client) notFound()

  const { data: bot } = await supabase
    .from('bot_configs')
    .select('*')
    .eq('client_id', id)
    .single()

  const displayName = client.company_name || client.company || client.email

  const defaultBot = {
    name:             bot?.bot_name || bot?.name || 'Asistente IA',
    personality:      bot?.personality || 'amigable',
    system_prompt:    bot?.llm_config?.system_prompt || bot?.instructions || '',
    welcome_message:  bot?.welcome_message || '¡Hola! ¿En qué puedo ayudarte hoy?',
    widget_color:     bot?.widget_color || '#7C3AED',
    language:         bot?.language || 'es',
    model:            bot?.llm_config?.model || bot?.model || 'gpt-4o-mini',
    escalation_kws:   (bot?.escalation_threshold || '').toString(),
    msg_limit:        bot?.msg_limit_monthly ?? 1000,
    temperature:      bot?.llm_config?.temperature ?? 0.7,
  }

  // Estimated token count (rough: 4 chars ≈ 1 token)
  const promptTokens = Math.ceil((defaultBot.system_prompt.length || 0) / 4)

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/admin/clientes/${id}`} className="text-gray-400 hover:text-gray-600 transition">
          ← Volver al detalle
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editor Visual del Bot</h1>
          <p className="text-gray-500 mt-1">{displayName}</p>
        </div>
      </div>

      <form action="/api/admin/update-bot" method="POST" className="space-y-6">
        <input type="hidden" name="client_id" value={id} />
        <input type="hidden" name="bot_id" value={bot?.id ?? ''} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Col 1: Identidad ──────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">🤖 Identidad</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Agente</label>
              <input
                name="bot_name"
                defaultValue={defaultBot.name}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="Ej: Nova, Alex, Asistente…"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tono / Personalidad</label>
              <select name="personality" defaultValue={defaultBot.personality} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                {TONES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Idioma Principal</label>
              <select name="language" defaultValue={defaultBot.language} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Color del Widget</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="widget_color"
                  defaultValue={defaultBot.widget_color}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
                <span className="text-xs text-gray-400 font-mono">{defaultBot.widget_color}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mensaje de Bienvenida</label>
              <textarea
                name="welcome_message"
                defaultValue={defaultBot.welcome_message}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
              />
            </div>
          </div>

          {/* ─── Col 2: System Prompt ──────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">📝 System Prompt</h2>
              <span className="text-xs text-gray-400">~{promptTokens.toLocaleString()} tokens</span>
            </div>

            <textarea
              name="system_prompt"
              defaultValue={defaultBot.system_prompt}
              rows={16}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
              placeholder="Eres un asistente inteligente para {empresa}. Tu objetivo es…"
            />

            <div className="text-xs text-gray-500 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
              💡 <strong>Tip:</strong> Incluye el nombre de la empresa, tono, y qué datos capturar (nombre, WhatsApp) antes de escalar.
            </div>
          </div>

          {/* ─── Col 3: Técnico ────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">⚙️ Parámetros Técnicos</h2>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Modelo LLM</label>
              <select name="model" defaultValue={defaultBot.model} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex justify-between">
                <span>Temperatura</span>
                <span className="text-purple-600 font-bold">{defaultBot.temperature}</span>
              </label>
              <input
                type="range" name="temperature" min="0" max="1" step="0.1"
                defaultValue={defaultBot.temperature}
                className="w-full accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Determinista (0)</span><span>Creativo (1)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Palabras Clave de Escalado</label>
              <input
                name="escalation_keywords"
                defaultValue={defaultBot.escalation_kws}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                placeholder="humano, agente, hablar con persona"
              />
              <p className="text-xs text-gray-400 mt-1">Separadas por coma. Dispara transferencia a humano.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Límite Mensajes/Mes</label>
              <input
                type="number" name="msg_limit" min="100" max="100000"
                defaultValue={defaultBot.msg_limit}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            {/* Preview */}
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Preview Widget</p>
              <div
                className="rounded-2xl overflow-hidden shadow-lg max-w-[200px] mx-auto border border-gray-200"
                style={{ background: '#0A0A0F' }}
              >
                <div className="px-3 py-2 text-center" style={{ background: defaultBot.widget_color }}>
                  <span className="text-white text-xs font-bold">{defaultBot.name}</span>
                </div>
                <div className="p-3">
                  <div className="bg-gray-800 rounded-lg px-3 py-2 text-gray-200 text-[10px]">{defaultBot.welcome_message.slice(0, 60)}…</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500">Todos los cambios quedan registrados en el log admin.</p>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold transition"
          >
            💾 Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  )
}
