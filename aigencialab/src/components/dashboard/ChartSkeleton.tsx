'use client';

import React from 'react';

export default function ChartSkeleton() {
  return (
    <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-[32px] border border-white/10 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <div className="text-[var(--muted)] text-xs font-bold uppercase tracking-widest animate-pulse">
        Cargando Analytics...
      </div>
    </div>
  );
}
