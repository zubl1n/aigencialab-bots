'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  Eye,
  ChevronLeft,
  ChevronRight,
  Bot,
  Mail,
  Calendar,
  Shield,
  Loader2,
  Users,
  UserCheck,
  UserX
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ClientWithBot } from '@/types/admin';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableCell, 
  TableHead 
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedClient, setSelectedClient] = useState<ClientWithBot | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const pageSize = 20;
  const supabase = createClient();

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('clients')
        .select(`
          *,
          bot_configs (id, active, bot_name, language)
        `, { count: 'exact' });

      if (searchTerm) {
        query = query.or(`company_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (planFilter !== 'all') {
        query = query.eq('plan', planFilter);
      }

      const { data, count, error } = await query
        .range(page * pageSize, (page + 1) * pageSize - 1)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to ensure bot_configs is a single object (if multiple exist for some reason, we take the first)
      const transformedData = (data as any[]).map(client => ({
        ...client,
        bot_configs: Array.isArray(client.bot_configs) ? client.bot_configs[0] : client.bot_configs
      })) as ClientWithBot[];

      setClients(transformedData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, planFilter, supabase]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleAction = async (action: string, client: ClientWithBot) => {
    if (action === 'activate') {
      const { error } = await supabase
        .from('bot_configs')
        .update({ active: true })
        .eq('client_id', client.id);
      
      if (!error) {
        // Trigger email notification
        try {
          await fetch('/api/admin/notify-activation', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId: client.id }) 
          });
        } catch (err) {
          console.error('Error sending activation email:', err);
        }
        
        fetchClients();
      }
    } else if (action === 'suspend') {
      const { error } = await supabase
        .from('clients')
        .update({ status: 'suspended' })
        .eq('id', client.id);
      
      if (!error) {
        await supabase.from('bot_configs').update({ active: false }).eq('client_id', client.id);
        alert(`Cliente ${client.company_name} suspendido.`);
        fetchClients();
      }
    } else if (action === 'impersonate') {
      alert('Generando token de acceso temporal (Solo lectura)...');
      // Logic for impersonation: generate a short-lived session and redirect
    }
  };

  const statusColors: any = {
    active: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    pending: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    suspended: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Administra cuentas, estados y configuraciones de bots.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-sm">
          <Plus size={18} />
          Nuevo Cliente
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-card rounded-2xl p-4 border border-border flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por empresa o email..." 
            className="w-full bg-secondary border border-border rounded-xl py-2 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-muted-foreground" />
          <select 
            className="bg-secondary border border-border rounded-xl py-2 px-4 text-foreground focus:outline-none text-sm font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="pending">Pendientes</option>
            <option value="suspended">Suspendidos</option>
          </select>

          <select 
            className="bg-secondary border border-border rounded-xl py-2 px-4 text-foreground focus:outline-none text-sm font-medium"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="all">Todos los planes</option>
            <option value="Starter">Starter</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Empresa / Email</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Bot</TableHead>
            <TableHead>Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
              </TableCell>
            </TableRow>
          ) : clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                No se encontraron clientes.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{client.company_name}</span>
                    <span className="text-xs text-muted-foreground">{client.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{client.plan}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={client.status === 'active' ? 'success' : client.status === 'suspended' ? 'danger' : 'warning'}>
                    {client.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${client.bot_configs?.active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-medium text-foreground/70">
                      {client.bot_configs?.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(client.created_at), 'dd MMM, yyyy', { locale: es })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <button 
                      onClick={() => { setSelectedClient(client); setIsSheetOpen(true); }}
                      className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors" title="Ver Detalle"
                    >
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => handleAction('activate', client)}
                      className="p-1.5 hover:bg-success/10 text-success rounded-lg transition-colors" title="Activar Bot"
                    >
                      <UserCheck size={18} />
                    </button>
                    <button 
                      onClick={() => handleAction('suspend', client)}
                      className="p-1.5 hover:bg-danger/10 text-danger rounded-lg transition-colors" title="Suspender"
                    >
                      <UserX size={18} />
                    </button>
                    <button 
                      onClick={() => handleAction('impersonate', client)}
                      className="p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors" title="Impersonar"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 text-sm text-muted-foreground">
        <span>Mostrando {clients.length} de {totalCount} clientes</span>
        <div className="flex items-center gap-4">
          <button 
            disabled={page === 0}
            onClick={() => setPage(p => p - 1)}
            className="p-1 hover:text-primary disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-foreground">Página {page + 1}</span>
          <button 
            disabled={(page + 1) * pageSize >= totalCount}
            onClick={() => setPage(p => p + 1)}
            className="p-1 hover:text-primary disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Side Sheet (Detail View) */}
      {isSheetOpen && selectedClient && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSheetOpen(false)}></div>
          <div className="relative w-full max-w-xl h-screen bg-[var(--bg2)] border-l border-[var(--border)] shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
            <div className="p-8 space-y-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--bg3)] border border-[var(--border)] flex items-center justify-center overflow-hidden">
                    {selectedClient.logo_url ? (
                      <img src={selectedClient.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Users className="w-8 h-8 text-[var(--muted)]" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{selectedClient.company_name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[selectedClient.status]}`}>
                      {selectedClient.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button onClick={() => setIsSheetOpen(false)} className="text-[var(--muted)] hover:text-white p-2">
                   <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <DetailCard icon={Mail} label="Email de contacto" value={selectedClient.email} />
                <DetailCard icon={Calendar} label="Fecha de registro" value={format(new Date(selectedClient.created_at), 'dd LLL yyyy')} />
                <DetailCard icon={Shield} label="Plan Actual" value={selectedClient.plan} color="text-blue-400" />
                <DetailCard icon={Bot} label="Bot Activo" value={selectedClient.bot_configs?.active ? 'SÍ' : 'NO'} color={selectedClient.bot_configs?.active ? 'text-emerald-400' : 'text-red-400'} />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Configuración del Bot</h3>
                <div className="glass p-6 rounded-2xl space-y-4 border border-[var(--border)]">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--muted)]">Nombre del Bot:</span>
                    <span className="text-white font-medium">{selectedClient.bot_configs?.bot_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--muted)]">Idioma:</span>
                    <span className="text-white font-medium uppercase">{selectedClient.bot_configs?.language || 'es'}</span>
                  </div>
                  <div className="pt-4 border-t border-[var(--border)]">
                    <button 
                      onClick={() => handleAction('activate', selectedClient)}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors"
                    >
                      {selectedClient.bot_configs?.active ? 'Forzar Reactivación' : 'Activar Bot Ahora'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Acciones de Gestión</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleAction('impersonate', selectedClient)} className="py-3 px-4 bg-[var(--bg3)] hover:bg-[var(--bg2)] text-white rounded-xl text-sm font-medium border border-[var(--border)] transition-colors flex items-center justify-center gap-2">
                    <ExternalLink className="w-4 h-4" /> Impersonar
                  </button>
                  <button onClick={() => handleAction('suspend', selectedClient)} className="py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-medium border border-red-500/20 transition-colors flex items-center justify-center gap-2">
                    <UserX className="w-4 h-4" /> Suspender Cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailCard({ icon: Icon, label, value, color = 'text-white' }: any) {
  return (
    <div className="glass p-4 rounded-2xl border border-[var(--border)]">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-[var(--muted)]" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--muted)]">{label}</span>
      </div>
      <p className={`font-semibold truncate ${color}`}>{value}</p>
    </div>
  );
}
