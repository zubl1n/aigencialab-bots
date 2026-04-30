'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  ShoppingCart, TrendingUp, Package, DollarSign, AlertCircle,
  RefreshCw, Plus, ExternalLink, CheckCircle, Clock, XCircle,
  ChevronDown, Zap, Settings, BarChart3,
} from 'lucide-react'

/* ── Types ───────────────────────────────────────── */
interface EcommerceIntegration {
  id: string
  platform: 'shopify' | 'woocommerce'
  store_url: string
  status: 'connected' | 'error' | 'pending'
  last_sync: string | null
}

interface AbandonedCart {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  cart_value: number
  cart_items: { name: string; qty: number; price: number }[]
  abandoned_at: string
  recovery_status: 'pending' | 'in_progress' | 'recovered' | 'lost'
}

interface RecoverySequence {
  id: string
  name: string
  status: 'active' | 'paused'
  stats: { sent: number; recovered: number; revenue: number }
  steps: { delay_h: number; channel: string; message: string; discount?: number }[]
}

/* ── Seed Data ─────────────────────────────────── */
const SEED_INTEGRATION: EcommerceIntegration = {
  id: 'demo', platform: 'shopify', store_url: 'tu-tienda.myshopify.com',
  status: 'connected', last_sync: new Date().toISOString()
}

const SEED_CARTS: AbandonedCart[] = [
  { id:'1', customer_name:'María González',  customer_email:'m.gonzalez@gmail.com',   customer_phone:'+56912345678', cart_value:89990,  cart_items:[{name:'Zapatillas Nike',qty:1,price:79990},{name:'Calcetines',qty:3,price:9990}],   abandoned_at:new Date(Date.now()-2*3600000).toISOString(),   recovery_status:'pending'    },
  { id:'2', customer_name:'Jorge Ramírez',   customer_email:'j.ramirez@outlook.cl',   customer_phone:'+56987654321', cart_value:245000, cart_items:[{name:'Smart TV 55"',qty:1,price:245000}],                                           abandoned_at:new Date(Date.now()-5*3600000).toISOString(),   recovery_status:'in_progress'},
  { id:'3', customer_name:'Camila López',    customer_email:'camila.l@empresa.cl',     customer_phone:'+56911223344', cart_value:34500,  cart_items:[{name:'Libro Python',qty:2,price:14500},{name:'Cuaderno',qty:1,price:5500}],          abandoned_at:new Date(Date.now()-24*3600000).toISOString(),  recovery_status:'recovered'  },
  { id:'4', customer_name:'Pedro Soto',      customer_email:'p.soto@gmail.com',        customer_phone:'+56944556677', cart_value:156000, cart_items:[{name:'Auriculares Sony',qty:1,price:129000},{name:'Estuche',qty:1,price:27000}],     abandoned_at:new Date(Date.now()-48*3600000).toISOString(),  recovery_status:'lost'       },
  { id:'5', customer_name:'Valentina Cruz',  customer_email:'v.cruz@hotmail.com',      customer_phone:'+56977889900', cart_value:67800,  cart_items:[{name:'Perfume Chanel',qty:1,price:67800}],                                          abandoned_at:new Date(Date.now()-72*3600000).toISOString(),  recovery_status:'pending'    },
]

const SEED_SEQUENCE: RecoverySequence = {
  id: '1',
  name: 'Secuencia de Recuperación Estándar',
  status: 'active',
  stats: { sent: 47, recovered: 12, revenue: 1234500 },
  steps: [
    { delay_h: 1,  channel: 'whatsapp', message: 'Hola {{nombre}}, ¿olvidaste algo? Tienes {{items}} en tu carrito por ${{total}}.', },
    { delay_h: 24, channel: 'email',    message: 'Tu carrito sigue esperándote. Aquí está el resumen de lo que seleccionaste.', discount: 10 },
    { delay_h: 72, channel: 'whatsapp', message: 'Última oportunidad: obtén 15% de descuento en tu carrito hoy.', discount: 15 },
  ]
}

/* ── Status Badge ──────────────────────────────── */
const STATUS_STYLE: Record<string, string> = {
  pending:     'bg-amber-500/10 text-amber-400 border-amber-500/30',
  in_progress: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  recovered:   'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  lost:        'bg-red-500/10 text-red-400 border-red-500/30',
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente', in_progress: 'En proceso', recovered: 'Recuperado', lost: 'Perdido'
}

/* ── New Integration Modal ─────────────────────── */
function IntegrationModal({ onClose, onConnect }: { onClose: () => void; onConnect: (data: Partial<EcommerceIntegration>) => void }) {
  const [platform, setPlatform] = useState<'shopify' | 'woocommerce'>('shopify')
  const [storeUrl, setStoreUrl] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    if (!storeUrl || !apiKey || !apiSecret) return
    setConnecting(true)
    await new Promise(r => setTimeout(r, 1800)) // sim connection
    onConnect({ platform, store_url: storeUrl, status: 'connected', last_sync: new Date().toISOString() })
    setConnecting(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-base font-semibold text-white">Conectar Tienda</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            <XCircle size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">Plataforma</label>
            <div className="grid grid-cols-2 gap-3">
              {(['shopify', 'woocommerce'] as const).map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${platform === p ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'}`}>
                  {p === 'shopify' ? '🛍️' : '🛒'} {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">URL de la tienda</label>
            <input value={storeUrl} onChange={e => setStoreUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
              placeholder={platform === 'shopify' ? 'mi-tienda.myshopify.com' : 'https://mi-tienda.cl'} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">API Key</label>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
              placeholder="shpat_xxxxxxxxxxxxxxxx" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">API Secret</label>
            <input type="password" value={apiSecret} onChange={e => setApiSecret(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-white/10">
          <button onClick={onClose} className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-2 rounded-lg text-sm transition-colors hover:bg-white/10">
            Cancelar
          </button>
          <button onClick={handleConnect} disabled={!storeUrl || !apiKey || !apiSecret || connecting}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
            {connecting ? 'Conectando...' : 'Conectar tienda'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────── */
export default function EcommercePage() {
  const supabase = createClient()
  const [integration, setIntegration] = useState<EcommerceIntegration | null>(null)
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [sequence, setSequence] = useState<RecoverySequence>(SEED_SEQUENCE)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'carts' | 'sequence' | 'analytics'>('carts')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: intData } = await supabase.from('ecommerce_integrations').select('*').eq('client_id', user.id).maybeSingle()
          const { data: cartsData } = await supabase.from('abandoned_carts').select('*').eq('client_id', user.id).order('abandoned_at', { ascending: false }).limit(50)
          const { data: seqData } = await supabase.from('recovery_sequences').select('*').eq('client_id', user.id).maybeSingle()

          setIntegration(intData ?? SEED_INTEGRATION)
          setCarts(cartsData?.length ? cartsData : SEED_CARTS)
          if (seqData) setSequence(seqData)
        } else {
          setIntegration(SEED_INTEGRATION)
          setCarts(SEED_CARTS)
        }
      } catch {
        setIntegration(SEED_INTEGRATION)
        setCarts(SEED_CARTS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredCarts = carts.filter(c =>
    !filter || c.customer_name.toLowerCase().includes(filter) || c.customer_email.toLowerCase().includes(filter)
  )

  const stats = {
    total:     carts.length,
    pending:   carts.filter(c => c.recovery_status === 'pending').length,
    recovered: carts.filter(c => c.recovery_status === 'recovered').length,
    revenue:   carts.filter(c => c.recovery_status === 'recovered').reduce((s, c) => s + c.cart_value, 0),
  }

  const recoverCart = (id: string) => {
    setCarts(prev => prev.map(c => c.id === id ? { ...c, recovery_status: 'in_progress' } : c))
  }

  const formatCLP = (v: number) => `$${v.toLocaleString('es-CL')}`
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    if (diff < 3600000) return `${Math.round(diff / 60000)} min`
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h`
    return `${Math.round(diff / 86400000)}d`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart size={20} className="text-indigo-400" />
            Ecommerce — Recuperación de Carritos
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Recupera ventas perdidas con tu agente IA</p>
        </div>
        {!integration?.status || integration.status === 'pending' ? (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm text-white font-semibold transition-colors">
            <Plus size={14} /> Conectar tienda
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
              <CheckCircle size={14} className="text-emerald-400" />
              <span className="text-xs text-emerald-300 font-medium capitalize">{integration.store_url}</span>
            </div>
            <button onClick={() => setShowModal(true)}
              className="p-2 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
              <Settings size={14} />
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Carritos abandonados', value: stats.total, icon: ShoppingCart, color: 'text-white',     bg: 'bg-white/5',         border: 'border-white/10'         },
          { label: 'Pendientes',           value: stats.pending,   icon: Clock,        color: 'text-amber-400', bg: 'bg-amber-500/10',    border: 'border-amber-500/20'    },
          { label: 'Recuperados',          value: stats.recovered, icon: CheckCircle,  color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20'},
          { label: 'Revenue recuperado',   value: formatCLP(stats.revenue), icon: DollarSign, color: 'text-green-400',  bg: 'bg-green-500/10',    border: 'border-green-500/20'    },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        {(['carts', 'sequence', 'analytics'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {tab === 'carts' ? '🛒 Carritos' : tab === 'sequence' ? '🔄 Secuencia' : '📊 Analytics'}
          </button>
        ))}
      </div>

      {/* Carts Tab */}
      {activeTab === 'carts' && (
        <div>
          <div className="mb-4">
            <input value={filter} onChange={e => setFilter(e.target.value.toLowerCase())}
              className="w-full max-w-sm bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
              placeholder="Buscar por nombre o email..." />
          </div>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_2fr_1.5fr_1fr_auto] px-4 py-2.5 border-b border-white/10 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              <span>Cliente</span><span>Valor</span><span>Productos</span><span>Hace</span><span>Estado</span><span></span>
            </div>
            {filteredCarts.map(cart => (
              <div key={cart.id} className="grid grid-cols-[2fr_1fr_2fr_1.5fr_1fr_auto] px-4 py-3.5 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center text-sm">
                <div>
                  <div className="text-white font-medium text-sm">{cart.customer_name}</div>
                  <div className="text-xs text-gray-500">{cart.customer_email}</div>
                </div>
                <div className="font-bold text-emerald-400">{formatCLP(cart.cart_value)}</div>
                <div className="space-y-0.5">
                  {cart.cart_items.slice(0, 2).map((item, i) => (
                    <div key={i} className="text-xs text-gray-400 truncate">{item.qty}x {item.name}</div>
                  ))}
                  {cart.cart_items.length > 2 && <div className="text-xs text-gray-600">+{cart.cart_items.length - 2} más</div>}
                </div>
                <div className="text-xs text-gray-500">{timeAgo(cart.abandoned_at)}</div>
                <span className={`inline-flex text-[11px] font-medium px-2 py-1 rounded-full border ${STATUS_STYLE[cart.recovery_status]}`}>
                  {STATUS_LABEL[cart.recovery_status]}
                </span>
                <div>
                  {cart.recovery_status === 'pending' && (
                    <button onClick={() => recoverCart(cart.id)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-lg text-xs text-indigo-400 transition-colors">
                      <Zap size={11} /> Recuperar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sequence Tab */}
      {activeTab === 'sequence' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">{sequence.name}</h3>
              <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${sequence.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-gray-500/10 text-gray-400 border-gray-500/30'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${sequence.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                {sequence.status === 'active' ? 'Activa' : 'Pausada'}
              </div>
            </div>
            <div className="space-y-4">
              {sequence.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">{i + 1}</div>
                    {i < sequence.steps.length - 1 && <div className="w-px h-8 bg-white/10 mt-1" />}
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-indigo-400 font-medium">
                        {step.delay_h < 24 ? `${step.delay_h}h después` : `${step.delay_h / 24}d después`}
                      </span>
                      <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full capitalize">{step.channel}</span>
                      {step.discount && <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{step.discount}% off</span>}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{step.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-3">Estadísticas</h3>
              {[
                { label: 'Mensajes enviados', value: sequence.stats.sent, color: 'text-white' },
                { label: 'Recuperados',       value: sequence.stats.recovered, color: 'text-emerald-400' },
                { label: 'Revenue total',     value: formatCLP(sequence.stats.revenue), color: 'text-green-400' },
                { label: 'Tasa de éxito',     value: `${sequence.stats.sent ? Math.round((sequence.stats.recovered / sequence.stats.sent) * 100) : 0}%`, color: 'text-indigo-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className={`text-sm font-bold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
            <button className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-sm text-indigo-300 font-semibold transition-colors">
              <Plus size={14} /> Agregar paso
            </button>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Distribución por estado</h3>
            {(['pending','in_progress','recovered','lost'] as const).map(status => {
              const count = carts.filter(c => c.recovery_status === status).length
              const pct = carts.length ? (count / carts.length) * 100 : 0
              return (
                <div key={status} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{STATUS_LABEL[status]}</span>
                    <span className="text-white font-medium">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: status === 'recovered' ? '#10b981' : status === 'pending' ? '#f59e0b' : status === 'in_progress' ? '#6366f1' : '#ef4444' }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-3xl font-bold text-white mb-1">{formatCLP(stats.revenue)}</div>
              <p className="text-sm text-gray-400">Revenue recuperado por el agente IA</p>
            </div>
            <div className="text-xs text-indigo-300">
              {stats.recovered} de {stats.total} carritos recuperados — {stats.total ? Math.round((stats.recovered / stats.total) * 100) : 0}% de éxito
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <IntegrationModal
          onClose={() => setShowModal(false)}
          onConnect={data => setIntegration({ ...SEED_INTEGRATION, ...data } as EcommerceIntegration)}
        />
      )}
    </div>
  )
}
