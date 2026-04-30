'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Ticket, CreditCard, Zap, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Notif {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  read: boolean;
  created_at: string;
  link?: string;
}

const TYPE_ICON: Record<string, { icon: React.ReactNode; color: string }> = {
  critical:  { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-400' },
  payment:   { icon: <CreditCard className="w-4 h-4" />, color: 'text-emerald-400' },
  ticket:    { icon: <Ticket className="w-4 h-4" />,     color: 'text-yellow-400' },
  upgrade:   { icon: <Zap className="w-4 h-4" />,        color: 'text-purple-400' },
  info:      { icon: <Info className="w-4 h-4" />,       color: 'text-blue-400' },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))} min`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} h`;
  return `${Math.floor(diff / 86_400_000)} d`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const unread = notifs.filter(n => !n.read).length;

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('alerts')
      .select('id, type, title, detail, read, created_at')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    setNotifs((data ?? []).map(n => ({
      id:         n.id,
      type:       n.type ?? 'info',
      title:      n.title ?? '',
      detail:     n.detail ?? null,
      read:       n.read ?? false,
      created_at: n.created_at,
    })));
    setLoading(false);
  }, []);

  // Load on mount + poll every 60s
  useEffect(() => {
    load();
    const iv = setInterval(load, 60_000);
    return () => clearInterval(iv);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const markRead = async (id: string) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    await supabase.from('alerts').update({ read: true }).eq('id', id);
  };

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('alerts').update({ read: true }).eq('client_id', user.id).eq('read', false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) load(); }}
        className="relative p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/8 transition-all"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-gray-400" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Drawer panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] max-h-[520px] bg-[#0d0d18] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 flex flex-col z-[200] animate-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-white text-sm">Notificaciones</h3>
              {unread > 0 && (
                <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-red-500/20">
                  {unread} nuevas
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 px-2 py-1 rounded-lg hover:bg-purple-500/10 transition font-bold"
                >
                  <CheckCheck className="w-3 h-3" /> Leídas
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/5 rounded-lg transition text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {loading && notifs.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-600">Cargando…</div>
            ) : notifs.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
                <Bell className="w-8 h-8 text-gray-700" />
                <p className="text-sm text-gray-600 font-medium">Sin notificaciones</p>
                <p className="text-xs text-gray-700">Las alertas de pago, tickets y sistema aparecerán aquí</p>
              </div>
            ) : notifs.map(n => {
              const { icon, color } = TYPE_ICON[n.type] ?? TYPE_ICON.info;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-5 py-4 hover:bg-white/[0.02] transition cursor-pointer ${!n.read ? 'bg-purple-500/[0.04]' : ''}`}
                  onClick={() => markRead(n.id)}
                >
                  <div className={`mt-0.5 flex-shrink-0 ${color}`}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm leading-tight ${n.read ? 'text-gray-400' : 'text-white font-medium'}`}>
                        {!n.read && <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5 mb-0.5 align-middle" />}
                        {n.title}
                      </p>
                      <span className="text-[9px] text-gray-700 flex-shrink-0 mt-0.5">{timeAgo(n.created_at)}</span>
                    </div>
                    {n.detail && <p className="text-xs text-gray-600 mt-0.5 line-clamp-2 leading-relaxed">{n.detail}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/5">
            <Link
              href="/dashboard/tickets"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between text-xs text-gray-500 hover:text-purple-400 transition font-medium"
            >
              Ver todos los tickets de soporte <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
