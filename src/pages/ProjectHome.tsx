import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanelData } from '../context/PanelDataContext';
import { formatTodayEs } from '../api';
import { AGENT_META, AGENT_FUNCTION_KEYS, DEFAULTS } from '../constants';
import type { HomeSummary } from '../types';
import Reveal from '../components/Reveal';
import StatCard from '../components/StatCard';
import MetricRadarCard from '../components/MetricRadarCard';

export default function ProjectHome() {
  const { agentConfigs, agentStatus, activeProjectName, activeProject, activeProjectId, scopedAction } = usePanelData();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [summaryError, setSummaryError] = useState(false);

  const projectAgentKeys = activeProject?.agents?.length ? activeProject.agents : AGENT_FUNCTION_KEYS;

  useEffect(() => {
    let cancelled = false;
    setSummary(null);
    setSummaryError(false);
    scopedAction<HomeSummary>('get_home_summary')
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((e) => {
        console.error('Error cargando el resumen del home', e);
        if (!cancelled) setSummaryError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [activeProjectId, scopedAction]);

  const activeCount = projectAgentKeys.filter((key) => {
    const s = agentStatus[key];
    return s && (s.status === 'READY' || s.status === 'PROCESSING');
  }).length;

  const socialCard = (key: 'instagram' | 'facebook' | 'youtube') => summary?.social[key];

  const rankingSub = (() => {
    if (!summary?.seo_keywords) return 'Sin datos todavía';
    const d = summary.seo_keywords_delta;
    if (!d) return 'posición promedio en Google';
    if (d.ranking_delta < 0) return `Mejoró ${Math.abs(d.ranking_delta)} posiciones vs. hace 30 días`;
    if (d.ranking_delta > 0) return `Empeoró ${d.ranking_delta} posiciones vs. hace 30 días`;
    return 'Sin cambio vs. hace 30 días';
  })();

  const top3Sub = (() => {
    if (!summary?.seo_keywords) return 'Sin datos todavía';
    const d = summary.seo_keywords_delta;
    const base = `de ${summary.seo_keywords.total_trackeadas} trackeadas`;
    if (!d) return base;
    if (d.top3_delta > 0) return `${base} · +${d.top3_delta} vs. hace 30 días`;
    if (d.top3_delta < 0) return `${base} · ${d.top3_delta} vs. hace 30 días`;
    return `${base} · sin cambio vs. hace 30 días`;
  })();

  const top10Sub = (() => {
    if (!summary?.seo_keywords) return 'Sin datos todavía';
    const d = summary.seo_keywords_delta;
    const base = `de ${summary.seo_keywords.total_trackeadas} trackeadas`;
    if (!d) return base;
    if (d.top10_delta > 0) return `${base} · +${d.top10_delta} vs. hace 30 días`;
    if (d.top10_delta < 0) return `${base} · ${d.top10_delta} vs. hace 30 días`;
    return `${base} · sin cambio vs. hace 30 días`;
  })();

  return (
    <div className="main">
      <Reveal>
        <div className="eyebrow">Proyecto activo</div>
        <div className="page-title">{activeProjectName}</div>
        <div className="page-date">
          <span>{formatTodayEs()}</span>
          <span className="sep" />
          <span>
            {activeCount || projectAgentKeys.length}/{projectAgentKeys.length} agentes activos
          </span>
        </div>

        <div className="section-head" style={{ marginTop: 22 }}>
          <span className="section-title">Redes Sociales activas</span>
        </div>
        <div className="mini-dash">
          <Reveal delay={0}>
            <MetricRadarCard
              cls="c-facebook"
              icon={<img src="/icons/facebook.svg" alt="" width={18} height={18} />}
              label="Seguidores Facebook"
              primaryValue={summary ? socialCard('facebook')?.followers ?? null : summaryError ? '—' : '…'}
              sub={summary && socialCard('facebook')?.followers == null ? 'Sin datos todavía' : 'vs. hace 7 días'}
              delta={summary && socialCard('facebook')?.followers != null ? { pct: socialCard('facebook')!.delta_7d_pct, periodLabel: '7D' } : undefined}
              sparkline={socialCard('facebook')?.sparkline_30d}
              healthBadge={summary ? socialCard('facebook')?.health : undefined}
              to="agentes/an"
            />
          </Reveal>
          <Reveal delay={60}>
            <MetricRadarCard
              cls="c-social"
              icon={<img src="/icons/instagram.svg" alt="" width={18} height={18} />}
              label="Seguidores Instagram"
              primaryValue={summary ? socialCard('instagram')?.followers ?? null : summaryError ? '—' : '…'}
              sub={summary && socialCard('instagram')?.followers == null ? 'Sin datos todavía' : 'vs. hace 7 días'}
              delta={summary && socialCard('instagram')?.followers != null ? { pct: socialCard('instagram')!.delta_7d_pct, periodLabel: '7D' } : undefined}
              sparkline={socialCard('instagram')?.sparkline_30d}
              healthBadge={summary ? socialCard('instagram')?.health : undefined}
              to="agentes/an"
            />
          </Reveal>
          <Reveal delay={120}>
            <MetricRadarCard
              cls="c-youtube"
              icon={<img src="/icons/youtube.svg" alt="" width={18} height={18} />}
              label="Suscriptores YouTube"
              primaryValue={summary ? socialCard('youtube')?.followers ?? null : summaryError ? '—' : '…'}
              sub={summary && socialCard('youtube')?.followers == null ? 'Sin integración conectada todavía' : 'vs. hace 7 días'}
              delta={summary && socialCard('youtube')?.followers != null ? { pct: socialCard('youtube')!.delta_7d_pct, periodLabel: '7D' } : undefined}
              sparkline={socialCard('youtube')?.sparkline_30d}
              healthBadge={summary ? socialCard('youtube')?.health : undefined}
              to="agentes/an"
            />
          </Reveal>
          <Reveal delay={180}>
            <StatCard
              cls="c-tiktok"
              icon={<img src="/icons/tiktok.svg" alt="" width={18} height={18} />}
              label="Seguidores TikTok"
              value="—"
              sub="Sin conectar todavía"
              disabled
            />
          </Reveal>
        </div>

        <hr className="resumen-section-divider" />

        <div className="section-head" style={{ marginTop: 36 }}>
          <span className="section-title">Email Marketing · Métricas</span>
        </div>
        <div className="mini-dash">
          <Reveal delay={0}>
            <StatCard
              cls="c-email"
              icon={<img src="/icons/gmail.svg" alt="" width={18} height={18} />}
              label="Envíos este mes"
              value={summary ? summary.email.enviados_mes : summaryError ? '—' : '…'}
              sub={summary?.ses_sandbox ? `Sandbox SES: máx ${summary.ses_sandbox.max_24h_send ?? '—'}/día` : 'Email Marketing'}
              to="email-crm"
            />
          </Reveal>
          <Reveal delay={60}>
            <StatCard
              cls="c-opens"
              icon={<img src="/icons/gmail.svg" alt="" width={18} height={18} />}
              label="Tasa de apertura promedio"
              value={summary ? (summary.email.tasa_apertura_pct ?? '—') : summaryError ? '—' : '…'}
              sub={summary && summary.email.tasa_apertura_pct !== null ? '% este mes' : 'Sin envíos este mes todavía'}
              to="email-crm/metricas"
            />
          </Reveal>
          <Reveal delay={120}>
            <StatCard
              cls="c-rebote"
              icon={<img src="/icons/gmail.svg" alt="" width={18} height={18} />}
              label="Tasa de rebote"
              value={summary ? (summary.email.tasa_rebote_pct ?? '—') : summaryError ? '—' : '…'}
              sub={summary && summary.email.tasa_rebote_pct !== null ? '% este mes' : 'Sin envíos este mes todavía'}
              to="email-crm/metricas"
            />
          </Reveal>
          <Reveal delay={180}>
            <StatCard
              cls="c-rebote"
              icon={<img src="/icons/gmail.svg" alt="" width={18} height={18} />}
              label="CTR y quejas"
              value="Sin datos"
              sub="Falta el webhook de eventos SES (no construido todavía)"
              disabled
              to="email-crm/metricas"
            />
          </Reveal>
        </div>

        <hr className="resumen-section-divider" />

        <div className="section-head" style={{ marginTop: 36 }}>
          <span className="section-title">SEO &amp; Tráfico Web</span>
        </div>
        <div className="mini-dash">
          <Reveal delay={0}>
            <MetricRadarCard
              cls="c-seo"
              icon={<img src="/icons/google.svg" alt="" width={18} height={18} />}
              label="Clics orgánicos"
              primaryValue={summary ? (summary.seo_trafico?.clics_organicos ?? null) : summaryError ? '—' : '…'}
              sub={summary?.seo_trafico ? `Search Console · ${summary.seo_trafico.snapshot_fecha}` : 'Sin datos todavía'}
              delta={summary?.seo_trafico ? { pct: summary.seo_trafico_delta_pct, periodLabel: '30D' } : undefined}
              to="agentes/seo"
            />
          </Reveal>
          <Reveal delay={60}>
            <MetricRadarCard
              cls="c-seo"
              icon={<img src="/icons/google.svg" alt="" width={18} height={18} />}
              label="Keywords en Top 3"
              primaryValue={summary ? (summary.seo_keywords?.top3_count ?? null) : summaryError ? '—' : '…'}
              sub={top3Sub}
              to="agentes/seo"
            />
          </Reveal>
          <Reveal delay={120}>
            <MetricRadarCard
              cls="c-seo"
              icon={<img src="/icons/google.svg" alt="" width={18} height={18} />}
              label="Keywords en Top 10"
              primaryValue={summary ? (summary.seo_keywords?.top10_count ?? null) : summaryError ? '—' : '…'}
              sub={top10Sub}
              to="agentes/seo"
            />
          </Reveal>
          <Reveal delay={180}>
            <MetricRadarCard
              cls="c-seo"
              icon={<img src="/icons/google.svg" alt="" width={18} height={18} />}
              label="Ranking promedio actual"
              primaryValue={summary ? (summary.seo_keywords?.ranking_promedio ?? null) : summaryError ? '—' : '…'}
              sub={rankingSub}
              to="agentes/seo"
            />
          </Reveal>
        </div>

        <div className="section-head" style={{ marginTop: 36 }}>
          <span className="section-title">Estado de los agentes</span>
        </div>
        <div className="services-grid">
          {projectAgentKeys.map((key, i) => {
            const meta = AGENT_META[key];
            const config = agentConfigs[key] || DEFAULTS[key];
            const status = agentStatus[key];
            return (
              <Reveal key={key} delay={i * 60}>
                <div className="service-row" onClick={() => navigate(`agentes/${key}`)}>
                  <div className={`avatar ${meta.cls}`} style={{ width: 40, height: 40, fontSize: 12 }}>
                    <div className="avatar-ring" />
                    {meta.initials}
                  </div>
                  <div className="service-info">
                    <div className="service-name">
                      {config.name} · {meta.short}
                    </div>
                    <div className="service-detail">{status?.last_action || 'Todavía no ha corrido'}</div>
                  </div>
                  <div className="service-stat">
                    <div className="service-stat-value tabular">{status?.execution_count_month ?? 0}</div>
                    <div className="service-stat-label">este mes</div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}
