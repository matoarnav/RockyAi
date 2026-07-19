import type { AgentConfig, AgentKey, Project } from './types';

export const DEFAULTS: Record<AgentKey, AgentConfig> = {
  ad: {
    name: 'Jimi',
    desc: 'Art Director & Visual Concept Creator. La Guitarra Líder y la Estética Psicodélica. Guardián de la identidad visual; toma las partituras de Dave y las traduce en composiciones visuales, paletas de colores y encuadres brutales para exprimir el material de la Sony A7III.',
    avatarUrl: '',
  },
  an: {
    name: 'Neil',
    desc: 'Performance & Data Analytics Specialist. El Baterista Cronométrico de la Banda. Cerebro matemático que audita métricas de conversión, mide el impacto real y procesa el consumo de tokens en DynamoDB para garantizar un tempo perfecto y bajo costo.',
    avatarUrl: '',
  },
  seo: {
    name: 'Slash',
    desc: 'Search, Geographic & AI Engine Optimization Expert. El Virtuoso de los Riffs de Destacado. Se asegura de que la banda domine los motores de búsqueda tradicionales (SEO), brille en geolocalización (GEO) y lidere los nuevos motores de respuesta de Inteligencia Artificial (AEO).',
    avatarUrl: '',
  },
  strategist: {
    name: 'Dave',
    desc: 'Content & Social Media Strategist. El Frontman y Compositor de la Banda. Define el ritmo del show; analiza el engagement de los líderes de la industria para componer la parrilla mensual de contenidos, posicionando a la Patagonia Chilena (Coyhaique) como destino de clase mundial.',
    avatarUrl: '',
  },
};

export const AGENT_META: Record<AgentKey, { cls: string; initials: string; role: string; short: string }> = {
  ad: { cls: 'ad', initials: 'JI', role: 'Art Director & Visual Concept Creator', short: 'Art Director' },
  an: { cls: 'an', initials: 'NE', role: 'Performance & Data Analytics Specialist', short: 'Analytics' },
  seo: { cls: 'seo', initials: 'SL', role: 'Search, Geographic & AI Engine Optimization Expert', short: 'SEO / GEO / AEO' },
  strategist: { cls: 'strategist', initials: 'DA', role: 'Content & Social Media Strategist', short: 'Content Strategist' },
};

export const AGENT_FUNCTION_KEYS: AgentKey[] = ['ad', 'an', 'seo', 'strategist'];

export const STATUS_META: Record<string, { label: string; cls: string }> = {
  PROCESSING: { label: 'Procesando', cls: 'processing' },
  READY: { label: 'Listo', cls: 'ready' },
  ERROR: { label: 'Error', cls: 'error' },
  NUNCA_EJECUTADO: { label: 'Nunca ejecutado', cls: 'never' },
};

export function statusMeta(status?: string) {
  return STATUS_META[status || ''] || { label: status || 'Desconocido', cls: 'never' };
}

export const DEFAULT_PROJECTS: Project[] = [
  { id: 'chile-fly-fishing', name: 'Chile Fly Fishing', protected: true, agents: AGENT_FUNCTION_KEYS },
  { id: 'alto-castillo', name: 'Alto Castillo', protected: false, agents: AGENT_FUNCTION_KEYS },
];

export const DOW_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
