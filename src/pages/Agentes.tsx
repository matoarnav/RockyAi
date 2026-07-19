import { useNavigate } from 'react-router-dom';
import { usePanelData } from '../context/PanelDataContext';
import { AGENT_META, AGENT_FUNCTION_KEYS, DEFAULTS, statusMeta } from '../constants';
import Reveal from '../components/Reveal';

export default function Agentes() {
  const { agentConfigs, agentStatus, activeProjectId, activeProject } = usePanelData();
  const navigate = useNavigate();

  const projectAgentKeys = activeProject?.agents?.length ? activeProject.agents : AGENT_FUNCTION_KEYS;

  return (
    <div className="main">
      <div className="eyebrow">Proyecto activo</div>
      <div className="page-title">Agentes</div>
      <div className="page-sub">
        proyectos/{activeProjectId} &middot; {projectAgentKeys.length} agente{projectAgentKeys.length === 1 ? '' : 's'} asignado
        {projectAgentKeys.length === 1 ? '' : 's'}
      </div>

      <div className="section-head" style={{ marginTop: 32 }}>
        <span className="section-title">Agentes</span>
      </div>

      {!projectAgentKeys.length && (
        <div className="card empty-state">Este proyecto no tiene agentes asignados todavía.</div>
      )}

      <div className="agents-grid">
        {projectAgentKeys.map((key, i) => {
          const meta = AGENT_META[key];
          const config = agentConfigs[key] || DEFAULTS[key];
          const status = agentStatus[key] || { status: 'NUNCA_EJECUTADO', last_action: '', execution_count: 0 };
          const sMeta = statusMeta(status.status);
          return (
            <Reveal key={key} delay={i * 70}>
              <div className="agent-card" onClick={() => navigate(key)}>
                <div className="agent-top">
                  <div className={`avatar ${meta.cls}`}>
                    <div className="avatar-ring" />
                    {meta.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="name-fixed">{config.name}</div>
                    <div className="role-fixed">{meta.role}</div>
                  </div>
                </div>
                <div className="status">
                  <span className={`status-dot ${sMeta.cls}`} />
                  {sMeta.label}
                  {status.execution_count ? (
                    <span className="exec-count">
                      &middot; {status.execution_count} ejecucion{status.execution_count === 1 ? '' : 'es'}
                    </span>
                  ) : null}
                </div>
                <div>
                  <div className="desc-label">Descripción</div>
                  <div className="week-summary-text">{config.desc}</div>
                </div>
                <div className="agent-detail">
                  <div className="desc-label">Lo que hizo esta semana</div>
                  <div className="week-summary-text">{status.last_action || 'Todavía no ha corrido.'}</div>
                </div>
                <div>
                  <button
                    className="enter-agent-btn"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(key);
                    }}
                  >
                    Entrar →
                  </button>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="footnote">
        Cada agente se invoca manualmente desde su página de detalle — todavía no hay automatización por horario
        (EventBridge) ni flujo de aprobación por email. Nombre y descripción de cada agente son personalizables y se
        guardan automáticamente en este panel. El estado de cada tarjeta (Procesando / Listo / Error) y "lo que hizo
        esta semana" se actualizan solos cada vez que el agente corre para este proyecto.
      </div>
    </div>
  );
}
