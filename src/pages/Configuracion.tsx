import { usePanelData } from '../context/PanelDataContext';
import { AGENT_META, AGENT_FUNCTION_KEYS, TOOL_META, TOOL_KEYS, PROJECT_LOGO } from '../constants';
import type { AgentKey, ToolKey } from '../types';
import Reveal from '../components/Reveal';

export default function Configuracion() {
  const { projects, updateProject } = usePanelData();

  function toggleAgent(projectId: string, current: AgentKey[], key: AgentKey) {
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    updateProject(projectId, { agents: next });
  }

  function toggleTool(projectId: string, current: ToolKey[], key: ToolKey) {
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    updateProject(projectId, { tools: next });
  }

  return (
    <div className="main">
      <div className="eyebrow">Panel</div>
      <div className="page-title">Configuración</div>
      <div className="page-sub">
        Controla qué agentes y qué herramientas tiene disponible cada proyecto — se aplica a los actuales y a
        cualquiera que agregues después.
      </div>

      <div className="config-projects-list">
        {projects.map((p, i) => {
          const agents = p.agents?.length ? p.agents : AGENT_FUNCTION_KEYS;
          const tools = p.tools?.length ? p.tools : TOOL_KEYS;
          return (
            <Reveal key={p.id} delay={i * 60}>
              <div className="card config-project-card">
                <div className="config-project-header">
                  {PROJECT_LOGO[p.id] && (
                    <div className="config-project-logo-wrap">
                      <img src={PROJECT_LOGO[p.id]} alt={p.name} className="config-project-logo" />
                    </div>
                  )}
                  <div>
                    <div className="config-project-name">{p.name}</div>
                    <div className="config-project-id tabular">proyectos/{p.id}</div>
                  </div>
                </div>

                <div className="desc-label" style={{ marginTop: 18 }}>
                  Agentes disponibles
                </div>
                <div className="config-chip-row">
                  {AGENT_FUNCTION_KEYS.map((key) => {
                    const meta = AGENT_META[key];
                    const selected = agents.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`config-chip${selected ? ' selected' : ''}`}
                        onClick={() => toggleAgent(p.id, agents, key)}
                      >
                        <span className={`avatar ${meta.cls}`} style={{ width: 22, height: 22, fontSize: 9 }}>
                          {meta.initials}
                        </span>
                        {meta.short}
                      </button>
                    );
                  })}
                </div>

                <div className="desc-label" style={{ marginTop: 18 }}>
                  Herramientas disponibles
                </div>
                <div className="config-chip-row">
                  {TOOL_KEYS.map((key) => {
                    const meta = TOOL_META[key];
                    const selected = tools.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        className={`config-chip${selected ? ' selected' : ''}`}
                        onClick={() => toggleTool(p.id, tools, key)}
                      >
                        <span className="ico">{meta.icon}</span> {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
