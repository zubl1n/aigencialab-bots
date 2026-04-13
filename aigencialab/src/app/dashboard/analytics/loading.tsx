import React from 'react';

export default function Loading() {
  return (
    <div className="p-8 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-9 w-64 bg-muted rounded-xl"></div>
        <div className="h-4 w-96 bg-muted rounded-lg"></div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-card border border-border"></div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-2xl bg-card border border-border"></div>
        <div className="h-80 rounded-2xl bg-card border border-border"></div>
      </div>
    </div>
  );
}
