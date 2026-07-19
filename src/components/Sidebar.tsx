import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePanelData } from '../context/PanelDataContext';
import { AGENT_META, AGENT_FUNCTION_KEYS } from '../constants';
import type { AgentKey } from '../types';

export default function Sidebar() {
  const { logout } = useAuth();
  const { projects, activeProjectId, activeProjectName, setActiveProjectId, addProject, deleteProject } = usePanelData();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAgents, setNewAgents] = useState<AgentKey[]>(AGENT_FUNCTION_KEYS);

  function toggleNewAgent(key: AgentKey) {
    setNewAgents((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function cancelAdding() {
    setAdding(false);
    setNewName('');
    setNewAgents(AGENT_FUNCTION_KEYS);
  }

  async function commitNewProject() {
    if (newName.trim()) {
      await addProject(newName.trim(), newAgents);
    }
    setAdding(false);
    setNewName('');
    setNewAgents(AGENT_FUNCTION_KEYS);
  }

  return (
    <div className="sidebar">
      <div className="logo-row">
        <img className="logo-image" src="/rocky-brand-logo.png" alt="RockyAI" />
        <div className="logo-tagline">AI Powered Brand &amp; Execution</div>
      </div>

      <div>
        <div className="nav-label">Proyectos</div>
        {projects.map((p) => (
          <div
            key={p.id}
            className={`proj-item${p.id === activeProjectId ? ' active' : ''}`}
            onClick={() => setActiveProjectId(p.id)}
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
      </div>

      <div>
        <div className="nav-label">Proyecto activo</div>
        <div className="proj-active-panel">
          <div className="proj-active-label">Trabajando en</div>
          <div className="proj-active-name">{activeProjectName}</div>
          <div className="proj-active-links">
            <NavLink to="/" end className={({ isActive }) => `proj-link${isActive ? ' current' : ''}`}>
              <span className="ico">◆</span> Resumen
            </NavLink>
            <NavLink to="/agentes" className={({ isActive }) => `proj-link${isActive ? ' current' : ''}`}>
              <span className="ico">◈</span> Agentes
            </NavLink>
          </div>
        </div>
      </div>

      <div className="tools-list">
        <div className="nav-label">Herramientas</div>
        <NavLink to="/email-crm" className={({ isActive }) => `proj-link${isActive ? ' current' : ''}`}>
          <span className="ico">✉</span> Email Marketing
        </NavLink>
        <NavLink to="/metricas" className={({ isActive }) => `proj-link${isActive ? ' current' : ''}`}>
          <span className="ico">▤</span> Métricas
        </NavLink>
      </div>

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
