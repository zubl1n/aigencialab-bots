export type ClientPlan = 'Starter' | 'Pro' | 'Enterprise';
export type ClientStatus = 'pending' | 'active' | 'suspended';

export interface Client {
  id: string;
  email: string;
  company_name: string;
  website: string;
  plan: ClientPlan;
  status: ClientStatus;
  tenant_id: string;
  created_at: string;
  logo_url?: string;
}

export interface BotConfig {
  id: string;
  client_id: string;
  bot_name: string;
  active: boolean;
  widget_color: string;
  language: string;
  welcome_message?: string;
  is_demo?: boolean;
  llm_config?: {
    system_prompt: string;
    temperature: number;
    model: string;
    max_tokens: number;
  };
  created_at: string;
}

export interface ApiKey {
  id: string;
  client_id: string;
  key: string;
  scope: 'widget' | 'admin';
  created_at: string;
}

export interface OnboardingProgress {
  client_id: string;
  step_completed: number;
  completed_at: string | null;
}
