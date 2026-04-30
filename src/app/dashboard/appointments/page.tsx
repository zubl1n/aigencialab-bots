'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar, Clock, Search, Filter, Download, Plus,
  CheckCircle2, XCircle, AlertCircle, MessageSquare,
  ChevronLeft, ChevronRight, Phone, Mail, Globe, RefreshCw,
  Edit2, Trash2, Check, X
} from 'lucide-react'

/* ── Types ─────────────────────────────────────── */
interface Appointment {
  id: string
  client_id: string
  contact_name: string
  contact_email?: string
  contact_phone?: string
  service: string
  appointment_date: string
  appointment_time: string
  duration_min: number
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  channel: string
  notes?: string
  created_at: string
}

const STATUS_MAP = {
  confirmed:  { label: 'Confirmada',  color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  pending:    { label: 'Pendiente',   color: 'bg-amber-500/10  text-amber-400  border-amber-500/30',    dot: 'bg-amber-400'   },
  cancelled:  { label: 'Cancelada',  color: 'bg-red-500/10    text-red-400    border-red-500/30',      dot: 'bg-red-400'     },
  completed:  { label: 'Completada', color: 'bg-blue-500/10   text-blue-400   border-blue-500/30',     dot: 'bg-blue-400'    },
}

const CHANNEL_ICONS: Record<string, string> = {
  'chat_web':   '💬',
  'whatsapp':   '📱',
  'instagram':  '📸',
  'email':      '📧',
  'phone':      '📞',
}

/* ── Seed data (visible cuando Supabase no tiene datos) ─────── */
const SEED_APPOINTMENTS: Appointment[] = [
  { id:'1', client_id:'demo', contact_name:'Valentina Rojas',   contact_email:'v.rojas@gmail.com',    contact_phone:'+56 9 1234 5678', service:'Consulta inicial',       appointment_date:'2026-04-21', appointment_time:'14:30', duration_min:30, status:'confirmed', channel:'chat_web',  created_at: new Date().toISOString() },
  { id:'2', client_id:'demo', contact_name:'Matías Fernández',  contact_email:'m.fdz@empresa.cl',     contact_phone:'+56 9 8765 4321', service:'Demo producto',           appointment_date:'2026-04-21', appointment_time:'16:00', duration_min:45, status:'confirmed', channel:'whatsapp',  created_at: new Date().toISOString() },
  { id:'3', client_id:'demo', contact_name:'Sofía Contreras',   contact_email:'scontreras@cl.com',    contact_phone:'+56 9 1111 2222', service:'Seguimiento',             appointment_date:'2026-04-22', appointment_time:'10:00', duration_min:20, status:'pending',   channel:'chat_web',  created_at: new Date().toISOString() },
  { id:'4', client_id:'demo', contact_name:'Rodrigo Muñoz',     contact_email:'r.munoz@gmail.com',    contact_phone:'+56 9 3333 4444', service:'Presentación propuesta',  appointment_date:'2026-04-22', appointment_time:'11:30', duration_min:60, status:'confirmed', channel:'instagram', created_at: new Date().toISOString() },
  { id:'5', client_id:'demo', contact_name:'Andrea Silva',      contact_email:'a.silva@firma.cl',     contact_phone:'+56 9 5555 6666', service:'Consulta inicial',         appointment_date:'2026-04-22', appointment_time:'15:00', duration_min:30, status:'confirmed', channel:'whatsapp',  created_at: new Date().toISOString() },
  { id:'6', client_id:'demo', contact_name:'Carlos Vega',       contact_email:'cvega@outlook.com',    contact_phone:'+56 9 7777 8888', service:'Revisión contrato',        appointment_date:'2026-04-23', appointment_time:'09:00', duration_min:45, status:'pending',   channel:'chat_web',  created_at: new Date().toISOString() },
  { id:'7', client_id:'demo', contact_name:'Paula Torres',      contact_email:'p.torres@cl.net',      contact_phone:'+56 9 9999 0000', service:'Demo producto',            appointment_date:'2026-04-23', appointment_time:'10:30', duration_min:30, status:'cancelled', channel:'whatsapp',  created_at: new Date().toISOString() },
  { id:'8', client_id:'demo', contact_name:'Ignacio Paz',       contact_email:'ipaz@empresa.com',     contact_phone:'+56 9 1212 3434', service:'Cierre de venta',          appointment_date:'2026-04-23', appointment_time:'14:00', duration_min:60, status:'confirmed', channel:'chat_web',  created_at: new Date().toISOString() },
  { id:'9', client_id:'demo', contact_name:'Daniela Ruiz',      contact_email:'d.ruiz@gmail.com',     contact_phone:'+56 9 5656 7878', service:'Consulta inicial',         appointment_date:'2026-04-24', appointment_time:'09:30', duration_min:30, status:'pending',   channel:'instagram', created_at: new Date().toISOString() },
  { id:'10',client_id:'demo', contact_name:'Héctor Leal',       contact_email:'hleal@empresa.cl',     contact_phone:'+56 9 9090 1212', service:'Seguimiento',              appointment_date:'2026-04-24', appointment_time:'11:00', duration_min:20, status:'confirmed', channel:'whatsapp',  created_at: new Date().toISOString() },
]

/* ── Modal de Nueva Cita ────────────────────────── */
function NewAppointmentModal({ onClose, onSave }: { onClose: () => void; onSave: (data: Partial<Appointment>) => void }) {
  const [form, setForm] = useState({
    contact_name: '', contact_email: '', contact_phone: '',
    service: '', appointment_date: '', appointment_time: '',
    duration_min: 30, channel: 'chat_web', notes: '', status: 'pending' as const,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.contact_name || !form.service || !form.appointment_date || !form.appointment_time) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-base font-semibold text-white">Nueva Cita</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre *</label>
              <input value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none" placeholder="Nombre del cliente" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Servicio *</label>
              <input value={form.service} onChange={e => setForm({...form, service: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none" placeholder="Tipo de servicio" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <input type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none" placeholder="email@ejemplo.com" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Teléfono</label>
              <input value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none" placeholder="+56 9 xxxx xxxx" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Fecha *</label>
              <input type="date" value={form.appointment_date} onChange={e => setForm({...form, appointment_date: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hora *</label>
              <input type="time" value={form.appointment_time} onChange={e => setForm({...form, appointment_time: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Duración (min)</label>
              <select value={form.duration_min} onChange={e => setForm({...form, duration_min: Number(e.target.value)})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
                {[15,20,30,45,60,90,120].map(m => <option key={m} value={m}>{m} min</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Canal</label>
              <select value={form.channel} onChange={e => setForm({...form, channel: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
                <option value="chat_web">💬 Chat Web</option>
                <option value="whatsapp">📱 WhatsApp</option>
                <option value="instagram">📸 Instagram</option>
                <option value="phone">📞 Teléfono</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Estado</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none">
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Notas</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none resize-none" rows={2} placeholder="Notas adicionales..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
              Guardar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Main Page ──────────────────────────────────── */
export default function AppointmentsPage() {
  const supabase = createClient()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [usingSeedData, setUsingSeedData] = useState(false)
  const PER_PAGE = 10

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAppointments(SEED_APPOINTMENTS); setUsingSeedData(true); return }

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('client_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

      if (error || !data || data.length === 0) {
        setAppointments(SEED_APPOINTMENTS)
        setUsingSeedData(true)
      } else {
        setAppointments(data)
        setUsingSeedData(false)
      }
    } catch {
      setAppointments(SEED_APPOINTMENTS)
      setUsingSeedData(true)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  /* ── Derived State ─────────────────────────────── */
  const filtered = appointments.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q || a.contact_name.toLowerCase().includes(q) ||
      (a.contact_email?.toLowerCase().includes(q) ?? false) ||
      a.service.toLowerCase().includes(q)
    const matchS = !statusFilter || a.status === statusFilter
    const matchC = !channelFilter || a.channel === channelFilter
    return matchQ && matchS && matchC
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const stats = {
    total:     appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  /* ── Upcoming (next 4 within 7 days) ──────────── */
  const upcoming = appointments
    .filter(a => {
      const d = new Date(`${a.appointment_date}T${a.appointment_time}`)
      const now = new Date()
      return d >= now && a.status !== 'cancelled' && (d.getTime() - now.getTime()) < 7 * 86400000
    })
    .slice(0, 4)

  /* ── Update Status ─────────────────────────────── */
  const updateStatus = async (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    if (!usingSeedData) {
      await supabase.from('appointments').update({ status }).eq('id', id)
    }
  }

  /* ── Save New ──────────────────────────────────── */
  const saveAppointment = async (data: Partial<Appointment>) => {
    const { data: { user } } = await supabase.auth.getUser()
    const newAppt: Appointment = {
      id: Date.now().toString(),
      client_id: user?.id ?? 'demo',
      contact_name: data.contact_name!,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      service: data.service!,
      appointment_date: data.appointment_date!,
      appointment_time: data.appointment_time!,
      duration_min: data.duration_min ?? 30,
      status: (data.status as Appointment['status']) || 'pending',
      channel: data.channel ?? 'chat_web',
      notes: data.notes,
      created_at: new Date().toISOString(),
    }

    setAppointments(prev => [...prev, newAppt])
    setShowModal(false)

    if (!usingSeedData && user) {
      await supabase.from('appointments').insert({ ...newAppt, id: undefined })
    }
  }

  /* ── Export CSV ────────────────────────────────── */
  const exportCSV = () => {
    const headers = ['Nombre,Email,Teléfono,Servicio,Fecha,Hora,Duración,Canal,Estado']
    const rows = filtered.map(a =>
      `"${a.contact_name}","${a.contact_email ?? ''}","${a.contact_phone ?? ''}","${a.service}","${a.appointment_date}","${a.appointment_time}","${a.duration_min} min","${a.channel}","${STATUS_MAP[a.status]?.label ?? a.status}"`
    )
    const blob = new Blob([[...headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = `agendamientos-${new Date().toISOString().slice(0, 10)}.csv`
    link.click(); URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={20} className="text-indigo-400" />
            Agendamientos
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {appointments.length} citas este período
            {usingSeedData && <span className="ml-2 text-xs text-amber-400/80">(datos de demostración)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchAppointments}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors">
            <RefreshCw size={13} /> Actualizar
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors">
            <Download size={13} /> Exportar CSV
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs text-white font-semibold transition-colors shadow-lg shadow-indigo-900/40">
            <Plus size={14} /> Nueva cita
          </button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total,     icon: Calendar,     color: 'text-indigo-400',  bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
          { label: 'Confirmadas', value: stats.confirmed, icon: CheckCircle2, color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20' },
          { label: 'Pendientes', value: stats.pending,   icon: AlertCircle,  color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'   },
          { label: 'Canceladas', value: stats.cancelled, icon: XCircle,      color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'     },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400 font-medium">{label}</span>
              <div className={`${bg} border ${border} rounded-lg p-1.5`}>
                <Icon size={14} className={color} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700`}
                style={{ width: `${stats.total ? (value / stats.total) * 100 : 0}%`, background: 'currentColor' }} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6 flex-col xl:flex-row">
        {/* ── Main Table ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                placeholder="Buscar por nombre, email o servicio..." />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-indigo-500 focus:outline-none">
              <option value="">Todos los estados</option>
              <option value="confirmed">Confirmada</option>
              <option value="pending">Pendiente</option>
              <option value="cancelled">Cancelada</option>
              <option value="completed">Completada</option>
            </select>
            <select value={channelFilter} onChange={e => { setChannelFilter(e.target.value); setPage(1) }}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:border-indigo-500 focus:outline-none">
              <option value="">Todos los canales</option>
              <option value="chat_web">💬 Chat Web</option>
              <option value="whatsapp">📱 WhatsApp</option>
              <option value="instagram">📸 Instagram</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="text-sm font-medium text-white">Lista de citas</span>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{filtered.length} registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Cliente', 'Servicio', 'Fecha & Hora', 'Canal', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-4 py-3"><div className="h-4 bg-white/5 rounded animate-pulse" /></td>
                        ))}
                      </tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-16 text-center">
                        <Calendar size={32} className="mx-auto text-gray-600 mb-3" />
                        <p className="text-sm text-gray-500">No se encontraron citas</p>
                      </td>
                    </tr>
                  ) : paginated.map(appt => {
                    const statusInfo = STATUS_MAP[appt.status] ?? STATUS_MAP.pending
                    const dateObj = new Date(`${appt.appointment_date}T${appt.appointment_time}`)
                    const isToday = new Date().toDateString() === dateObj.toDateString()

                    return (
                      <tr key={appt.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                        <td className="px-4 py-3">
                          <div>
                            <div className="text-sm font-medium text-white">{appt.contact_name}</div>
                            {appt.contact_email && (
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <Mail size={10} /> {appt.contact_email}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-300">{appt.service}</span>
                          <div className="text-xs text-gray-500">{appt.duration_min} min</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`text-sm font-medium ${isToday ? 'text-indigo-400' : 'text-white'}`}>
                            {isToday ? 'Hoy' : appt.appointment_date}
                          </div>
                          <div className="text-xs text-indigo-400 flex items-center gap-1">
                            <Clock size={10} /> {appt.appointment_time} hrs
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">{CHANNEL_ICONS[appt.channel] ?? '💬'} {appt.channel.replace('_', ' ')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={appt.status}
                            onChange={e => updateStatus(appt.id, e.target.value as Appointment['status'])}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer ${statusInfo.color} bg-transparent focus:outline-none`}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmada</option>
                            <option value="completed">Completada</option>
                            <option value="cancelled">Cancelada</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => updateStatus(appt.id, 'confirmed')}
                              title="Confirmar" className="p-1.5 hover:bg-emerald-500/10 rounded-lg text-gray-400 hover:text-emerald-400 transition-colors">
                              <Check size={14} />
                            </button>
                            <button onClick={() => updateStatus(appt.id, 'cancelled')}
                              title="Cancelar" className="p-1.5 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors">
                              <X size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
                <span className="text-xs text-gray-500">
                  Mostrando {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-30 transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    const p = i + 1
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-7 h-7 text-xs rounded-lg transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'hover:bg-white/10 text-gray-400'}`}>
                        {p}
                      </button>
                    )
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 disabled:opacity-30 transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Upcoming Panel ──────────────────────────── */}
        <div className="w-full xl:w-64 flex-shrink-0 space-y-4">
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Próximas Citas</h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-gray-600 text-center py-4">Sin citas próximas</p>
            ) : upcoming.map(appt => {
              const isToday = new Date().toDateString() === new Date(`${appt.appointment_date}`).toDateString()
              return (
                <div key={appt.id} className="mb-3 last:mb-0 bg-indigo-500/5 border border-indigo-500/10 rounded-lg p-3">
                  <div className="text-xs text-indigo-400 font-medium mb-1">
                    {isToday ? 'Hoy' : appt.appointment_date} — {appt.appointment_time} hrs
                  </div>
                  <div className="text-sm font-medium text-white mb-0.5">{appt.contact_name}</div>
                  <div className="text-xs text-gray-500">{appt.service} · {appt.duration_min} min</div>
                </div>
              )
            })}
          </div>

          {/* Mini Stats */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">Resumen de Hoy</h3>
            {[
              { label: 'Citas hoy',   value: appointments.filter(a => a.appointment_date === new Date().toISOString().slice(0,10)).length, color: 'text-white' },
              { label: 'Confirmadas', value: stats.confirmed, color: 'text-emerald-400' },
              { label: 'Pendientes',  value: stats.pending,   color: 'text-amber-400'   },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                <span className="text-xs text-gray-500">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-xl p-4 text-center">
            <MessageSquare size={20} className="mx-auto text-indigo-400 mb-2" />
            <p className="text-xs text-gray-400 mb-3">Tu agente toma citas automáticamente por chat</p>
            <button onClick={() => setShowModal(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
              Nueva cita manual
            </button>
          </div>
        </div>
      </div>

      {showModal && <NewAppointmentModal onClose={() => setShowModal(false)} onSave={saveAppointment} />}
    </div>
  )
}
