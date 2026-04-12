'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { useMemo } from 'react'

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e']

export default function AnalyticsClient({ 
  kpis, 
  totalLeads, 
  auditLeads, 
  hotLeads, 
  convRateInfo,
  totalChats,
  humanChats,
  aiChats,
  timeSeriesData
}: {
  kpis: any[],
  totalLeads: number,
  auditLeads: number,
  hotLeads: number,
  convRateInfo: number,
  totalChats: number,
  humanChats: number,
  aiChats: number,
  timeSeriesData: any[]
}) {

  // Funnel Data
  const funnelData = [
    { name: 'Total Leads', value: totalLeads },
    { name: 'Auditorías', value: auditLeads },
    { name: 'Hot Leads', value: hotLeads }
  ]

  // Pie Data
  const resolutionData = [
    { name: 'Resuelto por IA', value: aiChats },
    { name: 'Escalado a Humano', value: humanChats }
  ]

  // Custom Tooltip for dark mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-xl backdrop-blur-md">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }} className="text-sm font-semibold">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`rounded-2xl p-5 bg-gradient-to-br ${kpi.cls} border ${kpi.border} backdrop-blur-sm shadow-lg`}>
            <div className="flex justify-between items-start mb-2">
              <div className="text-2xl bg-white/5 p-2 rounded-xl">{kpi.icon}</div>
              {kpi.trendDir === 'up' && <span className="text-emerald-400 text-xs font-bold bg-emerald-400/10 px-2 py-1 rounded-full flex items-center">↗ {kpi.trend}</span>}
              {kpi.trendDir === 'down' && <span className="text-red-400 text-xs font-bold bg-red-400/10 px-2 py-1 rounded-full flex items-center">↘ {kpi.trend}</span>}
            </div>
            <div className="text-3xl font-black mb-1 text-white tracking-tight">{kpi.value}</div>
            <div className="text-sm font-medium text-slate-300">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* TIME SERIES: TRAFFIC */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-800 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <span className="text-blue-400">📈</span> Tráfico de Interacciones IA
            </h2>
            <div className="text-xs font-medium bg-slate-800 px-3 py-1 rounded-full text-slate-300 border border-slate-700">Últimos 7 días</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" name="Mensajes" dataKey="messages" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMsgs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FUNNEL & PIE */}
        <div className="flex flex-col gap-6">
          
          {/* FUNNEL CHART */}
          <div className="glass rounded-2xl p-6 border border-slate-800 shadow-xl flex-1">
            <h2 className="font-semibold mb-4 text-emerald-400 flex items-center gap-2">🎯 Pipeline Conversión</h2>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#fff" fontSize={11} width={80} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#1e293b'}} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RESOLUTION PIE */}
          <div className="glass rounded-2xl p-6 border border-slate-800 shadow-xl flex-1 relative overflow-hidden">
            <h2 className="font-semibold mb-2 text-violet-400">🤖 Tasa de Deflexión IA</h2>
            <p className="text-xs text-slate-400 mb-2">Porcentaje de tickets resueltos sin intervención humana.</p>
            <div className="h-[140px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resolutionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="#10b981" /> {/* IA */}
                    <Cell fill="#475569" /> {/* Humano */}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white drop-shadow-md">
                   {totalChats > 0 ? Math.round((aiChats / totalChats) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
