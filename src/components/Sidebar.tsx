import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePanelData } from '../context/PanelDataContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const { projects, activeProjectId, activeProjectName, setActiveProjectId, addProject, deleteProject } = usePanelData();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  async function commitNewProject() {
    setAdding(false);
    if (newName.trim()) {
      await addProject(newName.trim());
    }
    setNewName('');
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
          <input
            className="add-project-input"
            autoFocus
            placeholder="Nombre del proyecto"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={commitNewProject}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            }}
          />
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
