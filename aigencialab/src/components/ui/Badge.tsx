import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary' | 'demo';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
    outline: 'bg-transparent border-border text-foreground',
    secondary: 'bg-secondary text-secondary-foreground border-transparent',
    demo: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
