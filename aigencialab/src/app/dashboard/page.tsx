import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import DashboardContent from './DashboardContent';
import ChartSkeleton from '@/components/dashboard/ChartSkeleton';

// Recharts must be client-side only (SSR: false)
// Recharts data
const chartData = [
  { date: '01 Abr', conversations: 12 },
  { date: '02 Abr', conversations: 18 },
  { date: '03 Abr', conversations: 15 },
  { date: '04 Abr', conversations: 25 },
  { date: '05 Abr', conversations: 32 },
  { date: '06 Abr', conversations: 28 },
  { date: '07 Abr', conversations: 35 },
];

export default function DashboardPage() {
  return <DashboardContent data={chartData} />;
}
