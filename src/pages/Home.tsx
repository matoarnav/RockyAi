import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanelData } from '../context/PanelDataContext';
import { formatTodayEs } from '../api';
import { AGENT_META, AGENT_FUNCTION_KEYS, DEFAULTS } from '../constants';
import type { HomeSummary } from '../types';
import Reveal from '../components/Reveal';
import WelcomeCard from '../components/WelcomeCard';

export default function Home() {
  const { activeProjectId } = usePanelData();
  return <div className="main">{activeProjectId ? <ProjectDashboard /> : <WelcomeCard />}</div>;
}

function ProjectDashboard() {
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
            icon="✉"
            label="Envíos este mes"
            value={summary ? summary.email.enviados_mes : summaryError ? '—' : '…'}
            sub="Email Marketing"
          />
        </Reveal>
        <Reveal delay={60}>
          <MiniCard
            cls="c-opens"
            icon="◎"
            label="Aperturas totales"
            value={summary ? summary.email.aperturas_totales : summaryError ? '—' : '…'}
            sub="Histórico de campañas"
          />
        </Reveal>
        <Reveal delay={120}>
          <MiniCard
            cls="c-seo"
            icon="▲"
            label="Posición SEO"
            value={summary ? (summary.seo?.posicion ?? '—') : summaryError ? '—' : '…'}
            sub={summary?.seo ? `"${summary.seo.keyword}"` : 'Sin datos todavía'}
          />
        </Reveal>
        <Reveal delay={180}>
          <MiniCard
            cls="c-social"
            icon="◈"
            label="Contenido generado (mes)"
            value={summary ? summary.content_count : summaryError ? '—' : '…'}
            sub="piezas en el calendario"
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
              <div className="service-row" onClick={() => navigate(`/agentes/${key}`)}>
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
  );
}

function MiniCard({ cls, icon, label, value, sub }: { cls: string; icon: string; label: string; value: string | number; sub: string }) {
  return (
    <div className={`mini-card ${cls}`}>
      <div className="mini-card-icon">{icon}</div>
      <div className="mini-card-label">{label}</div>
      <div className="mini-card-value tabular">{value}</div>
      <div className="mini-card-sub">{sub}</div>
    </div>
  );
}
