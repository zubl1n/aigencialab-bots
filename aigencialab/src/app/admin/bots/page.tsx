'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Bot, 
  MessageCircle, 
  Target, 
  Activity, 
  Edit3, 
  Terminal, 
  RefreshCcw, 
  ChevronDown, 
  ChevronUp,
  Save,
  Loader2,
  Trash2,
  Code
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { BotWithStats } from '@/types/admin';
import { Badge } from '@/components/ui/Badge';
import { BotConfig } from '@/types/client';

export default function BotsPage() {
  const [bots, setBots] = useState<BotWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBot, setEditingBot] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const supabase = createClient();

  const fetchBots = useCallback(async () => {
    setLoading(true);
    try {
      // Joining bot_configs with clients
      const { data, error } = await supabase
        .from('bot_configs')
        .select(`
          *,
          client:clients (company_name, origin),
          api_keys (key)
        `)
        .order('is_demo', { ascending: true });

      if (error) throw error;

      // In a real scenario, we would call a RPC or separate queries for stats
      // For now, we enhance the transformation
      const transformedData = (data as any[]).map(bot => ({
        ...bot,
        stats: {
          total_conversations: bot.is_demo ? Math.floor(Math.random() * 1000) : Math.floor(Math.random() * 500),
          total_leads: bot.is_demo ? 42 : Math.floor(Math.random() * 100), // Placeholder for real demo_leads count
          response_rate: 95 + Math.floor(Math.random() * 4)
        }
      })) as BotWithStats[];

      setBots(transformedData);
    } catch (error) {
      console.error('Error fetching bots:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  const handleEdit = (bot: BotWithStats) => {
    setEditingBot(bot.id);
    setEditForm({
      bot_name: bot.bot_name,
      language: bot.language,
      widget_color: bot.widget_color,
      system_prompt: bot.llm_config?.system_prompt || '',
      temperature: bot.llm_config?.temperature || 0.7,
      model: bot.llm_config?.model || 'gpt-4o',
      max_tokens: bot.llm_config?.max_tokens || 1000
    });
  };

  const handleSave = async (botId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bot_configs')
        .update({
          bot_name: editForm.bot_name,
          language: editForm.language,
          widget_color: editForm.widget_color,
          llm_config: {
            system_prompt: editForm.system_prompt,
            temperature: editForm.temperature,
            model: editForm.model,
            max_tokens: editForm.max_tokens
          }
        })
        .eq('id', botId);

      if (error) throw error;
      setEditingBot(null);
      fetchBots();
    } catch (error) {
      console.error('Error saving bot:', error);
      alert('Error al guardar cambios');
    } finally {
      setLoading(false);
    }
  };

  const resetApiKey = async (clientId: string) => {
    if (confirm('¿Estás seguro de que quieres resetear la API Key? Los widgets existentes dejarán de funcionar hasta que se actualice la key.')) {
      const { error } = await supabase
        .from('api_keys')
        .update({ key: crypto.randomUUID() })
        .eq('client_id', clientId);
      
      if (!error) {
        alert('API Key reseteada con éxito');
        fetchBots();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestión de Bots</h1>
        <p className="text-muted-foreground">Supervisa y configura el comportamiento de los asistentes IA.</p>
      </div>

      {loading && !bots.length ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {bots.map((bot) => (
            <div key={bot.id} className={`bg-card rounded-3xl border border-border transition-all duration-300 ${editingBot === bot.id ? 'ring-2 ring-primary/20 border-primary' : ''}`}>
              <div className="p-6">
                {/* Bot Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary border border-border flex items-center justify-center">
                      <Bot className={`w-7 h-7 ${bot.active ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground uppercase tracking-tight">{bot.bot_name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        {bot.client.company_name} • <span className="uppercase">{bot.language}</span>
                      </p>
                    </div>
                    <Badge variant={bot.active ? 'success' : 'danger'}>
                      {bot.active ? 'ACTIVO' : 'INACTIVO'}
                    </Badge>
                    {bot.is_demo && (
                      <Badge variant="demo">DEMO</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => editingBot === bot.id ? setEditingBot(null) : handleEdit(bot)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${editingBot === bot.id ? 'bg-primary text-primary-foreground' : 'text-primary bg-primary/5 border border-primary/10 hover:bg-primary/10'}`}
                    >
                      {editingBot === bot.id ? 'Cancelar' : <><Edit3 size={16} /> Editar Config</>}
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Ver Logs"><Terminal size={20} /></button>
                    <button onClick={() => resetApiKey(bot.client_id)} className="p-2 text-muted-foreground hover:text-warning transition-colors" title="Reset API Key"><RefreshCcw size={20} /></button>
                  </div>
                </div>

                {/* Bot Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <StatItem icon={MessageCircle} label="Conversaciones" value={bot.stats.total_conversations} color="text-primary" />
                  <StatItem icon={Target} label="Leads Capturados" value={bot.stats.total_leads} color="text-success" />
                  <StatItem icon={Activity} label="Tasa Respuesta" value={`${bot.stats.response_rate}%`} color="text-accent" />
                </div>

                {/* Edit Form (Expanded) */}
                {editingBot === bot.id && (
                  <div className="pt-6 border-t border-border animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                          <Code size={16} /> Configuración LLM
                        </h4>
                        <div>
                          <label className="text-xs text-muted-foreground mb-1 block">Modelo</label>
                          <select 
                            className="w-full bg-secondary border border-border rounded-xl py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={editForm.model}
                            onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                          >
                            <option value="gpt-4o">GPT-4o (Standard)</option>
                            <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Temperatura ({editForm.temperature})</label>
                            <input 
                              type="range" min="0" max="1" step="0.1" 
                              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                              value={editForm.temperature}
                              onChange={(e) => setEditForm({...editForm, temperature: parseFloat(e.target.value)})}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Max Tokens</label>
                            <input 
                              type="number" 
                              className="w-full bg-secondary border border-border rounded-xl py-2 px-3 text-foreground focus:outline-none"
                              value={editForm.max_tokens}
                              onChange={(e) => setEditForm({...editForm, max_tokens: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                          <Terminal size={16} /> Prompt del Sistema
                        </h4>
                        <textarea 
                          rows={6}
                          className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                          value={editForm.system_prompt}
                          onChange={(e) => setEditForm({...editForm, system_prompt: e.target.value})}
                          placeholder="Instrucciones del bot..."
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleSave(bot.id)}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold tracking-tight transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> Guardar Cambios</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-secondary/50 border border-border p-4 rounded-2xl flex items-center gap-4">
      <div className={`p-2 rounded-xl bg-muted ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}


