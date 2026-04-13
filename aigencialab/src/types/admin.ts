import { Client, BotConfig, ClientPlan, ClientStatus } from './client';

export interface AdminMetrics {
  total_clients_active: number;
  total_clients_pending: number;
  total_clients_suspended: number;
  total_bots_active: number;
  total_bots_inactive: number;
  total_bots_configuring: number;
  total_leads_month: number;
  total_conversations_month: number;
  estimated_mrr: number;
}

export interface ClientWithBot extends Client {
    bot_configs: {
        active: boolean;
        bot_name: string;
        language: string;
    } | null;
}

export interface BotWithStats extends BotConfig {
    client: {
        company_name: string;
    };
    stats: {
        total_conversations: number;
        total_leads: number;
        response_rate: number;
    };
}

export interface LeadAdmin {
    id: string;
    created_at: string;
    contact_name: string;
    email: string;
    company: string;
    client_name: string; // From the client table
    status: 'new' | 'contacted' | 'qualified' | 'closed' | 'lost';
}

export interface GlobalSettings {
    plans: {
        name: ClientPlan;
        price: number;
        max_bots: number;
        max_conversations_month: number;
        max_leads_month: number;
    }[];
    email_templates: {
        id: string;
        name: string;
        subject: string;
        body: string;
    }[];
    webhooks: {
        id: string;
        url: string;
        type: 'slack' | 'discord' | 'custom';
        active: boolean;
    }[];
    feature_flags: Record<string, boolean>;
}
