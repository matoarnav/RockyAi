export type AgentKey = 'ad' | 'an' | 'seo' | 'strategist';

export interface AgentConfig {
  name: string;
  desc: string;
  avatarUrl: string;
}

export interface TimelineEntry {
  status: string;
  action: string;
  at: string;
}

export interface AgentStatus {
  status: 'PROCESSING' | 'READY' | 'ERROR' | 'NUNCA_EJECUTADO' | string;
  last_action: string;
  execution_count: number;
  updated_at: string;
  timeline: TimelineEntry[];
  tokens_month?: string;
  tokens_input_total?: number;
  tokens_output_total?: number;
  tokens_thinking_total?: number;
}

export interface ContentPiece {
  fecha: string;
  dia_sugerido?: string;
  canal: string;
  formato: string;
  pilar?: string;
  headline: string;
  copy: string;
  hashtags: string[];
  objetivo_estrategico: string;
  nota_visual_para_art_director: string;
  notas_produccion: string;
  contraste_competitivo_implicito?: boolean;
}

export interface ContentGrid {
  mes: string;
  pilares_narrativos: string[];
  calendario_semanal: { piezas: ContentPiece[] }[];
}

export interface Project {
  id: string;
  name: string;
  protected: boolean;
}

export interface PanelState {
  agentConfigs?: Record<AgentKey, AgentConfig>;
  agentStatus?: Record<AgentKey, AgentStatus>;
  contentGrid?: ContentGrid | null;
  projects?: Project[];
  [key: string]: unknown;
}

export interface EmailContact {
  client_id: string;
  email: string;
  name: string;
  status: 'subscribed' | 'unsubscribed' | 'bounced';
  tags: string[];
  created_at?: string;
  unsub_reason?: string;
}

export interface EmailTemplate {
  client_id: string;
  template_id: string;
  name: string;
  subject: string;
  html_body: string;
  updated_at: string;
}

export interface CampaignStats {
  enviados: number;
  aperturas: number;
  clics: number;
  rebotes: number;
  quejas: number;
}

export interface EmailCampaign {
  client_id: string;
  campaign_id: string;
  name: string;
  subject: string;
  html_body: string;
  template_id: string;
  segment: { type: string; value?: string };
  status: 'draft' | 'sending' | 'sent';
  created_at: string;
  sent_at: string;
  stats: CampaignStats;
}

export interface HomeSummary {
  email: { enviados_mes: number; aperturas_totales: number };
  seo: { keyword: string; posicion: number } | null;
  content_count: number;
}
