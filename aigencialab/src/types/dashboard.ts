import { Client, BotConfig, ClientPlan } from './client';
import { LeadAdmin } from './admin';

export interface ClientDashboardMetrics {
    total_conversations_month: number;
    captured_leads_month: number;
    response_rate: number;
    uptime_percentage: number;
}

export interface DailyConversation {
    date: string;
    count: number;
}

export interface ActivityFeedItem {
    id: string;
    type: 'conversation' | 'lead' | 'system';
    title: string;
    description: string;
    timestamp: string;
    metadata?: any;
}

export interface ClientLead extends LeadAdmin {
    conversation_summary?: string;
}

export interface Invoice {
    id: string;
    number: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    date: string;
    pdf_url: string;
}

export interface PlanLimit {
    name: string;
    current: number;
    limit: number;
}

export interface BillingInfo {
    current_plan: ClientPlan;
    limits: {
        conversations: PlanLimit;
        leads: PlanLimit;
        bots: PlanLimit;
    };
    invoice_history: Invoice[];
}
