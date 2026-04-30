'use client';

import React from 'react';
import { 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface AdminAnalyticsChartProps {
  data: Array<{ week: string; count: number }>;
}

export default function AdminAnalyticsChart({ data }: AdminAnalyticsChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="week" stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
          <YAxis stroke="var(--muted)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              borderRadius: '16px', 
              color: '#fff',
              backdropFilter: 'blur(8px)'
            }}
            itemStyle={{ color: '#6366f1' }}
            labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
          />
          <Bar 
            dataKey="count" 
            name="Clientes"
            fill="#6366f1"
            radius={[8, 8, 0, 0]}
            opacity={0.85}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
