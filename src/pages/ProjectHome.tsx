import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanelData } from '../context/PanelDataContext';
import { formatTodayEs } from '../api';
import { AGENT_META, AGENT_FUNCTION_KEYS, DEFAULTS } from '../constants';
import type { HomeSummary } from '../types';
import Reveal from '../components/Reveal';

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

        <div className="mini-dash">
          <Reveal delay={0}>
            <MiniCard
              cls="c-email"
              icon={<img src="/icons/gmail.svg" alt="" width={18} height={18} />}
              label="Envíos este mes"
              value={summary ? summary.email.enviados_mes : summaryError ? '—' : '…'}
              sub="Email Marketing"
              to="email-crm"
            />
          </Reveal>
          <Reveal delay={60}>
            <MiniCard
              cls="c-social"
              icon={<img src="/icons/instagram.svg" alt="" width={18} height={18} />}
              label="Seguidores Instagram"
              value={summary ? (summary.instagram_followers ?? '—') : summaryError ? '—' : '…'}
              sub={summary && summary.instagram_followers === null ? 'Sin datos todavía' : 'Último snapshot'}
              to="agentes/an"
            />
          </Reveal>
          <Reveal delay={120}>
            <MiniCard
              cls="c-seo"
              icon={<img src="/icons/google.svg" alt="" width={18} height={18} />}
              label="Posición SEO actual"
              value={summary ? (summary.seo?.posicion ?? '—') : summaryError ? '—' : '…'}
              sub={summary?.seo ? `"${summary.seo.keyword}"` : 'Sin datos todavía'}
              to="agentes/seo"
            />
          </Reveal>
          <Reveal delay={180}>
            <MiniCard
              cls="c-opens"
              icon={<img src="/icons/youtube.svg" alt="" width={18} height={18} />}
              label="Seguidores YouTube"
              value={summary ? (summary.youtube_followers ?? '—') : summaryError ? '—' : '…'}
              sub="Sin integración conectada todavía"
              to="agentes/an"
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

function MiniCard({
  cls,
  icon,
  label,
  value,
  sub,
  to,
}: {
  cls: string;
  icon: ReactNode;
  label: string;
  value: string | number;
  sub: string;
  to: string;
}) {
  const navigate = useNavigate();
  return (
    <div className={`mini-card ${cls}`}>
      <div className="mini-card-icon">{icon}</div>
      <div className="mini-card-label">{label}</div>
      <div className="mini-card-value tabular">{value}</div>
      <div className="mini-card-sub">{sub}</div>
      <button className="mini-card-cta" onClick={() => navigate(to)}>
        Ver más →
      </button>
    </div>
  );
}
