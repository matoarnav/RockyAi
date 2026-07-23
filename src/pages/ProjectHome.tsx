import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanelData } from '../context/PanelDataContext';
import { formatTodayEs } from '../api';
import { AGENT_META, AGENT_FUNCTION_KEYS, DEFAULTS } from '../constants';
import type { HomeSummary } from '../types';
import Reveal from '../components/Reveal';
import StatCard from '../components/StatCard';

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
            <StatCard
              cls="c-facebook"
              icon={<img src="/icons/facebook.svg" alt="" width={18} height={18} />}
              label="Seguidores Facebook"
              value={summary ? summary.facebook_followers : summaryError ? '—' : '…'}
              sub={summary && summary.facebook_followers === null ? 'Sin datos todavía' : 'Último snapshot'}
              to="agentes/an"
            />
          </Reveal>
          <Reveal delay={60}>
            <StatCard
              cls="c-social"
              icon={<img src="/icons/instagram.svg" alt="" width={18} height={18} />}
              label="Seguidores Instagram"
              value={summary ? summary.instagram_followers : summaryError ? '—' : '…'}
              sub={summary && summary.instagram_followers === null ? 'Sin datos todavía' : 'Último snapshot'}
              to="agentes/an"
            />
          </Reveal>
          <Reveal delay={120}>
            <StatCard
              cls="c-youtube"
              icon={<img src="/icons/youtube.svg" alt="" width={18} height={18} />}
              label="Suscriptores YouTube"
              value={summary ? summary.youtube_followers : summaryError ? '—' : '…'}
              sub={summary && summary.youtube_followers === null ? 'Sin integración conectada todavía' : 'Último snapshot'}
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
              sub="Email Marketing"
              to="email-crm"
            />
          </Reveal>
          <Reveal delay={60}>
            <StatCard
              cls="c-rebote"
              icon={<img src="/icons/gmail.svg" alt="" width={18} height={18} />}
              label="Desuscritos este mes"
              value={summary ? summary.unsubscribed_mes : summaryError ? '—' : '…'}
              sub="Email Marketing"
              to="email-crm/audiencias"
            />
          </Reveal>
          <Reveal delay={120}>
            <StatCard
              cls="c-opens"
              icon={<img src="/icons/gmail.svg" alt="" width={18} height={18} />}
              label="Tasa de apertura promedio"
              value={summary ? (summary.email.tasa_apertura_pct ?? '—') : summaryError ? '—' : '…'}
              sub={summary && summary.email.tasa_apertura_pct !== null ? '% este mes' : 'Sin envíos este mes todavía'}
              to="email-crm/metricas"
            />
          </Reveal>
          <Reveal delay={180}>
            <StatCard
              cls="c-rebote"
              icon={<img src="/icons/gmail.svg" alt="" width={18} height={18} />}
              label="Tasa de rebote"
              value={summary ? (summary.email.tasa_rebote_pct ?? '—') : summaryError ? '—' : '…'}
              sub={summary && summary.email.tasa_rebote_pct !== null ? '% este mes' : 'Sin envíos este mes todavía'}
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
            <StatCard
              cls="c-seo"
              icon={<img src="/icons/google.svg" alt="" width={18} height={18} />}
              label="Clics orgánicos este mes"
              value={summary ? (summary.seo_trafico?.clics_organicos ?? '—') : summaryError ? '—' : '…'}
              sub={summary?.seo_trafico ? `Search Console · ${summary.seo_trafico.snapshot_fecha}` : 'Sin datos todavía'}
              to="agentes/seo"
            />
          </Reveal>
          <Reveal delay={60}>
            <StatCard
              cls="c-seo"
              icon={<img src="/icons/google.svg" alt="" width={18} height={18} />}
              label="Keywords en Top 3"
              value={summary ? (summary.seo_keywords?.top3_count ?? '—') : summaryError ? '—' : '…'}
              sub={summary?.seo_keywords ? `de ${summary.seo_keywords.total_trackeadas} trackeadas` : 'Sin datos todavía'}
              to="agentes/seo"
            />
          </Reveal>
          <Reveal delay={120}>
            <StatCard
              cls="c-seo"
              icon={<img src="/icons/google.svg" alt="" width={18} height={18} />}
              label="Keywords en Top 10"
              value={summary ? (summary.seo_keywords?.top10_count ?? '—') : summaryError ? '—' : '…'}
              sub={summary?.seo_keywords ? `de ${summary.seo_keywords.total_trackeadas} trackeadas` : 'Sin datos todavía'}
              to="agentes/seo"
            />
          </Reveal>
          <Reveal delay={180}>
            <StatCard
              cls="c-seo"
              icon={<img src="/icons/google.svg" alt="" width={18} height={18} />}
              label="Ranking promedio actual"
              value={summary ? (summary.seo_keywords?.ranking_promedio ?? '—') : summaryError ? '—' : '…'}
              sub={summary?.seo_keywords ? 'posición promedio en Google' : 'Sin datos todavía'}
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
                    <div className="service-stat-value tabular">{status?.execution_count || 0}</div>
                    <div className="service-stat-label">ejecuciones</div>
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
