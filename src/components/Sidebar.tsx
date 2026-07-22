import { useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePanelData } from '../context/PanelDataContext';
import { AGENT_META, AGENT_FUNCTION_KEYS, TOOL_META, TOOL_KEYS, PROJECT_LOGO } from '../constants';
import { useSlidingIndicator } from '../hooks/useSlidingIndicator';
import NavBadge from './NavBadge';
import type { AgentKey, ToolKey } from '../types';

export default function Sidebar() {
  const { logout } = useAuth();
  const { projects, activeProjectId, activeProjectName, activeProject, deleteProject, addProject } = usePanelData();
  const navigate = useNavigate();
  const location = useLocation();
  const activeLinksRef = useRef<HTMLDivElement>(null);

  function goHome() {
    navigate('/');
  }
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAgents, setNewAgents] = useState<AgentKey[]>(AGENT_FUNCTION_KEYS);
  const [newTools, setNewTools] = useState<ToolKey[]>(TOOL_KEYS);

  function toggleNewAgent(key: AgentKey) {
    setNewAgents((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function toggleNewTool(key: ToolKey) {
    setNewTools((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function cancelAdding() {
    setAdding(false);
    setNewName('');
    setNewAgents(AGENT_FUNCTION_KEYS);
    setNewTools(TOOL_KEYS);
  }

  async function commitNewProject() {
    if (newName.trim()) {
      await addProject(newName.trim(), newAgents, newTools);
    }
    setAdding(false);
    setNewName('');
    setNewAgents(AGENT_FUNCTION_KEYS);
    setNewTools(TOOL_KEYS);
  }

  const activeTools = activeProject?.tools?.length ? activeProject.tools : TOOL_KEYS;
  useSlidingIndicator(activeLinksRef, '.proj-link.current', 'vertical', [location.pathname, activeProjectId, activeTools.join(',')]);

  return (
    <div className="sidebar">
      <div className="logo-row" onClick={goHome} role="button" tabIndex={0} style={{ cursor: 'pointer' }}>
        <img className="logo-image" src="/rocky-brand-logo.png" alt="RockyAI" />
        <div className="logo-tagline">AI Powered Brand &amp; Execution</div>
      </div>

      <div>
        <div className="nav-label">Proyectos</div>
        {projects.map((p) => (
          <div
            key={p.id}
            className={`proj-item${p.id === activeProjectId ? ' active' : ''}`}
            onClick={() => navigate(`/p/${p.id}`)}
          >
            <span className="proj-dot" />
            {p.name}
            {!p.protected && (
              <span
                className="proj-delete"
                title="Eliminar proyecto"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProject(p.id);
                }}
              >
                ×
              </span>
            )}
          </div>
        ))}
        {adding ? (
          <div className="new-project-form">
            <input
              className="add-project-input"
              autoFocus
              placeholder="Nombre del proyecto"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitNewProject();
                if (e.key === 'Escape') cancelAdding();
              }}
            />
            <div className="new-project-agents-label">Agentes para este proyecto</div>
            <div className="new-project-chips">
              {AGENT_FUNCTION_KEYS.map((key) => {
                const meta = AGENT_META[key];
                const selected = newAgents.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`agent-chip${selected ? ' selected' : ''}`}
                    title={meta.short}
                    onClick={() => toggleNewAgent(key)}
                  >
                    {meta.initials}
                  </button>
                );
              })}
            </div>
            <div className="new-project-agents-label">Herramientas para este proyecto</div>
            <div className="new-project-tools">
              {TOOL_KEYS.map((key) => {
                const meta = TOOL_META[key];
                const selected = newTools.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    className={`tool-chip${selected ? ' selected' : ''}`}
                    onClick={() => toggleNewTool(key)}
                  >
                    <span className="ico">{meta.icon}</span> {meta.label}
                  </button>
                );
              })}
            </div>
            <div className="new-project-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={commitNewProject} disabled={!newName.trim()}>
                Crear
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={cancelAdding}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="add-project" onClick={() => setAdding(true)}>
            <span>+</span> Agregar nuevo proyecto
          </div>
        )}
        <NavLink to="/configuracion" className={({ isActive }) => `config-link${isActive ? ' current' : ''}`}>
          <span className="ico">⚙</span> Configuración
        </NavLink>
      </div>

      <div>
        <div className="nav-label">Herramientas</div>
        <NavLink to="/pms" className={({ isActive }) => `config-link${isActive ? ' current' : ''}`}>
          <span className="ico">⌂</span> PMS · Reservas
          <NavBadge>Nuevo</NavBadge>
        </NavLink>
      </div>

      {activeProjectId ? (
        <div>
          <div className="nav-label">Proyecto activo</div>
          <div className="proj-active-panel">
            {PROJECT_LOGO[activeProjectId] && (
              <div className="proj-active-logo-wrap proj-active-logo-wrap-lg">
                <img className="proj-active-logo proj-active-logo-lg" src={PROJECT_LOGO[activeProjectId]} alt={activeProjectName} />
              </div>
            )}
            <div className="proj-active-label">Trabajando en</div>
            <div className="proj-active-name">{activeProjectName}</div>
            <div className="proj-active-links" ref={activeLinksRef}>
              <div className="slide-indicator slide-indicator-v" />
              <NavLink to={`/p/${activeProjectId}`} end className={({ isActive }) => `proj-link${isActive ? ' current' : ''}`}>
                <span className="ico">◆</span> Resumen
              </NavLink>
              {activeTools.includes('agentes') && (
                <NavLink to={`/p/${activeProjectId}/agentes`} className={({ isActive }) => `proj-link${isActive ? ' current' : ''}`}>
                  <span className="ico">◈</span> Agentes
                </NavLink>
              )}
              {activeTools.includes('email-marketing') && (
                <NavLink to={`/p/${activeProjectId}/email-crm`} className={({ isActive }) => `proj-link${isActive ? ' current' : ''}`}>
                  <span className="ico">✉</span> Email Marketing
                </NavLink>
              )}
              {activeTools.includes('metricas') && (
                <NavLink to={`/p/${activeProjectId}/metricas`} className={({ isActive }) => `proj-link${isActive ? ' current' : ''}`}>
                  <span className="ico">▤</span> Métricas
                </NavLink>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="sidebar-foot">
        Cuenta AWS
        <br />
        chileflyfishing &middot; us-east-2
        <br />
        Gasto del mes: $0 USD
        <div style={{ marginTop: 10 }}>
          <a
            href="#"
            className="logout-link"
            onClick={(e) => {
              e.preventDefault();
              logout();
            }}
          >
            Cerrar sesión
          </a>
        </div>
      </div>
    </div>
  );
}
