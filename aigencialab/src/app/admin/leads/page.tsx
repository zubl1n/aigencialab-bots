'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  LayoutGrid, 
  List, 
  Calendar, 
  User, 
  Building2, 
  Tag,
  Loader2,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';

interface Lead {
  id: string;
  contact_name: string;
  email: string;
  company: string;
  status: LeadStatus;
  created_at: string;
  client_id: string;
  client?: { company_name: string };
}

const statusOptions: { label: string, value: LeadStatus, color: string }[] = [
  { label: 'Nuevo', value: 'new', color: 'bg-blue-500' },
  { label: 'Contactado', value: 'contacted', color: 'bg-orange-500' },
  { label: 'Calificado', value: 'qualified', color: 'bg-purple-500' },
  { label: 'Cerrado', value: 'closed', color: 'bg-emerald-500' },
  { label: 'Perdido', value: 'lost', color: 'bg-red-500' },
];

export default function LeadsCRM() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30d');
  const supabase = createClient();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('leads')
        .select(`
          *,
          client:clients (company_name)
        `);

      if (searchTerm) {
        query = query.or(`contact_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data as unknown as Lead[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, supabase]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', leadId);
    
    if (!error) fetchLeads();
  };

  const exportToCSV = () => {
    const headers = ['Nombre', 'Email', 'Empresa', 'Cliente AIgenciaLab', 'Fecha', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...leads.map(l => [
        l.contact_name,
        l.email,
        l.company,
        l.client?.company_name || 'N/A',
        format(new Date(l.created_at), 'yyyy-MM-dd'),
        l.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_aigencialab_${format(new Date(), 'yyyyMMdd')}.csv`;
    link.click();
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'closed': return 'success';
      case 'lost': return 'danger';
      case 'qualified': return 'primary';
      case 'contacted': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM de Leads</h1>
          <p className="text-muted-foreground">Vista unificada de todos los leads capturados por el ecosistema.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-secondary p-1 rounded-xl border border-border">
            <button 
              onClick={() => setView('table')}
              className={`p-2 rounded-lg transition-colors ${view === 'table' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={`p-2 rounded-lg transition-colors ${view === 'kanban' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid size={18} />
            </button>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-foreground border border-border hover:bg-muted transition-colors font-medium text-sm"
          >
            <Download size={16} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-4 border border-border flex flex-wrap gap-4 items-center shadow-sm">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar leads por nombre, email o empresa..." 
            className="w-full bg-secondary border border-border rounded-xl py-2 pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-secondary border border-border rounded-xl py-2 px-4 text-foreground text-sm font-medium focus:outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <select className="bg-secondary border border-border rounded-xl py-2 px-4 text-foreground text-sm font-medium focus:outline-none">
          <option value="30d">Últimos 30 días</option>
          <option value="90d">Últimos 90 días</option>
          <option value="all">Siempre</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : view === 'table' ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lead</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Cliente Captura</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map(lead => (
              <TableRow key={lead.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{lead.contact_name}</span>
                    <span className="text-xs text-muted-foreground">{lead.email}</span>
                  </div>
                </TableCell>
                <TableCell className="text-foreground/80 font-medium">{lead.company}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                     <Building2 size={14} className="text-primary" />
                     <span className="text-sm text-foreground/90 uppercase tracking-tight font-bold">{lead.client?.company_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <select 
                    value={lead.status}
                    onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                    className="bg-transparent text-foreground focus:outline-none cursor-pointer"
                  >
                    {statusOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-popover text-popover-foreground">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(lead.created_at), 'dd MMM yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <button className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 h-[calc(100vh-350px)] overflow-x-auto pb-4">
          {statusOptions.map(col => (
             <div key={col.value} className="flex flex-col gap-4 min-w-[280px]">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
                    <h3 className="font-bold text-white uppercase text-xs tracking-widest">{col.label}</h3>
                  </div>
                  <span className="text-xs font-bold text-[var(--muted)] bg-white/5 px-2 py-0.5 rounded-md">
                    {leads.filter(l => l.status === col.value).length}
                  </span>
                </div>
                
                <div className="flex-1 space-y-3 p-2 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl border border-dashed border-white/5 overflow-y-auto">
                    {leads.filter(l => l.status === col.value).map(lead => (
                      <div key={lead.id} className="glass p-4 rounded-2xl border border-border hover:border-blue-500/50 transition-all cursor-grab active:cursor-grabbing group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors uppercase tracking-tight">{lead.contact_name}</h4>
                          <button className="text-[var(--muted)] hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
                        </div>
                        <p className="text-[10px] text-[var(--muted)] mb-3 flex items-center gap-1"><Tag className="w-3 h-3" /> {lead.company}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[var(--muted)]" />
                            <span className="text-[9px] font-bold text-[var(--sub)] uppercase">{lead.client?.company_name}</span>
                          </div>
                          <button 
                            onClick={() => {
                               const currentIndex = statusOptions.findIndex(o => o.value === col.value);
                               if (currentIndex < statusOptions.length - 1) {
                                 updateLeadStatus(lead.id, statusOptions[currentIndex + 1].value);
                               }
                            }}
                            className="p-1 hover:bg-blue-500/10 text-[var(--muted)] hover:text-blue-400 rounded-md transition-colors"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {leads.filter(l => l.status === col.value).length === 0 && (
                      <div className="h-20 flex items-center justify-center text-[var(--muted)] text-[10px] uppercase font-bold tracking-widest opacity-30">Vacío</div>
                    )}
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
