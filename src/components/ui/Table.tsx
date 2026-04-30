import React from 'react';

export function Table({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative w-full overflow-auto rounded-xl border border-border bg-card ${className}`}>
      <table className="w-full text-sm text-left border-collapse">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="bg-muted/30 text-muted-foreground border-b border-border">
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <tbody className={`divide-y divide-border/50 ${className}`}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <tr className={`hover:bg-accent/5 transition-colors group even:bg-muted/5 ${className}`}>
      {children}
    </tr>
  );
}

interface CellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function TableCell({ children, className = '', colSpan }: CellProps) {
  return (
    <td 
      colSpan={colSpan} 
      className={`px-4 py-3.5 align-middle text-foreground/80 ${className}`}
    >
      {children}
    </td>
  );
}

export function TableHead({ children, className = '', colSpan }: CellProps) {
  return (
    <th 
      colSpan={colSpan}
      className={`px-4 py-3 h-12 text-left align-middle font-medium text-muted-foreground uppercase text-[11px] tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}
