export type LeadTier = 'cold' | 'warm' | 'hot'
export type LeadSource = 'audit' | 'manual' | 'whatsapp' | 'landing'
export type ClientPlan = 'starter' | 'advanced' | 'enterprise'
export type ClientStatus = 'active' | 'onboarding' | 'paused' | 'churned'
export type TicketPriority = 'critico' | 'alto' | 'medio' | 'bajo'
export type TicketStatus = 'Abierto' | 'En progreso' | 'Esperando cliente' | 'Resuelto'
export type ConvChannel = 'whatsapp' | 'web' | 'email'
export type ConvStatus = 'open' | 'resolved' | 'needs_human'

export interface Lead {
  id: string
  company: string | null
  contact_name: string | null
  url: string | null
  rubro: string | null
  whatsapp: string | null
  email: string | null
  score: number
  tier: LeadTier
  prob: number
  psi_data: Record<string, unknown> | null
  seo_data: Record<string, unknown> | null
  notes: string | null
  source: LeadSource
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  company: string
  rubro: string | null
  contact_name: string | null
  whatsapp: string | null
  email: string | null
  url: string | null
  logo_url: string | null
  faqs: FAQ[]
  products: Product[]
  channels: { whatsapp: boolean; web: boolean; email: boolean }
  plan: ClientPlan
  status: ClientStatus
  wa_phone_id: string | null
  config: AgentConfig
  created_at: string
  updated_at: string
}

export interface FAQ { q: string; a: string }
export interface Product { name: string; price?: number; stock?: number; description?: string }

export interface AgentConfig {
  agent_name?: string
  tone?: 'formal' | 'amigable' | 'tecnico'
  escalate_keyword?: string
  welcome_msg?: string
}

export interface Conversation {
  id: string
  client_id: string
  channel: ConvChannel
  contact_wa: string | null
  contact_name: string | null
  status: ConvStatus
  created_at: string
  updated_at: string
  messages?: Message[]
}

export interface Message {
  id: string
  conversation_id: string
  direction: 'in' | 'out'
  content: string
  wa_message_id: string | null
  read: boolean
  metadata: Record<string, unknown>
  timestamp: string
}

export interface Ticket {
  id: string
  client_id: string | null
  ticket_num: string
  company: string | null
  issue: string
  priority: TicketPriority
  status: TicketStatus
  assigned_to: string | null
  channel: string
  notes: string | null
  sla_deadline: string | null
  created_at: string
  updated_at: string
}

export interface AuditResult {
  score: number
  tier: string
  tierColor: string
  metrics: AuditMetric[]
  issues: AuditIssue[]
  opportunities: AuditOpportunity[]
  savingsMin: number
  savingsMax: number
  rubroName: string
  speedScore: number
  seoScore: number
  uxScore: number
  atencScore: number
  psi: PSIData | null
  seo: SEOData | null
  realData: boolean
}

export interface AuditMetric {
  label: string
  value: string
  score: number
  color: string
  status: string
  detail?: string | null
}

export interface AuditIssue {
  sev: 'critical' | 'warning' | 'info'
  icon: string
  title: string
  desc: string
}

export interface AuditOpportunity {
  icon: string
  title: string
  desc: string
  impact: string
}

export interface PSIData {
  perfScore: number | null
  seoScore: number | null
  a11yScore: number | null
  bpScore: number | null
  lcp: string | null
  cls: string | null
  tti: string | null
  fcp: string | null
  tbt: string | null
  si: string | null
}

export interface SEOData {
  title: string
  titleLen: number
  hasMetaDesc: boolean
  metaDescLen: number
  h1Count: number
  h1Text: string
  totalImgs: number
  imgsNoAlt: number
  hasWhatsApp: boolean
  hasChatbot: boolean
  hasCart: boolean
  hasSSL: boolean
  hasGTM: boolean
  hasOgImage: boolean
  hasCanonical: boolean
  hasMobileViewport: boolean
}
