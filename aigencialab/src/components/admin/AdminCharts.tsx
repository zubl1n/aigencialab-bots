'use client'

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const COLORS = ['#7C3AED', '#C084FC', '#A855F7', '#6D28D9']

interface AdminChartsProps {
  weeklySignups: { week: string; clients: number }[]
  mrrHistory:    { month: string; mrr: number }[]
  planDist:      { name: string; value: number }[]
}

export function AdminCharts({ weeklySignups, mrrHistory, planDist }: AdminChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
      {/* MRR Area Chart */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-1">MRR — Últimos 6 meses</h3>
        <p className="text-xs text-gray-400 mb-4">Ingreso mensual recurrente en USD</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={mrrHistory} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7C3AED" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f5" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B6480' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6B6480' }} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={(v: number) => [`$${v}`, 'MRR']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="mrr" stroke="#7C3AED" strokeWidth={2} fill="url(#mrrGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Plan Distribution Pie */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-1">Distribución de Planes</h3>
        <p className="text-xs text-gray-400 mb-4">Clientes activos por plan</p>
        {planDist.every(d => d.value === 0) ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sin clientes activos</div>
        ) : (
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={planDist} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                dataKey="value" paddingAngle={3}>
                {planDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [v, 'clientes']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weekly Signups Bar Chart */}
      <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-1">Nuevos Clientes por Semana</h3>
        <p className="text-xs text-gray-400 mb-4">Últimas 8 semanas</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklySignups} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f5" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6B6480' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6B6480' }} allowDecimals={false} />
            <Tooltip formatter={(v: number) => [v, 'clientes']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="clients" fill="#7C3AED" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
