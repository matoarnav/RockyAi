import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { usePanelData } from '../../context/PanelDataContext';
import { CrmDataProvider } from '../../context/CrmDataContext';

const TABS = [
  { to: '.', label: 'Resumen', end: true },
  { to: 'campanas', label: 'Campañas' },
  { to: 'nueva', label: 'Nueva campaña' },
  { to: 'audiencias', label: 'Audiencias' },
  { to: 'templates', label: 'Templates' },
  { to: 'metricas', label: 'Métricas' },
];

export default function EmailCrmLayout() {
  const { activeProjectName, activeProjectId } = usePanelData();
  const navigate = useNavigate();

  return (
    <div className="main">
      <button className="back-link" onClick={() => navigate('..')}>
        &larr; Volver al panel
      </button>
      <div className="eyebrow">CRM Email Marketing</div>
      <div className="page-title">{activeProjectName}</div>
      <div className="page-sub">proyectos/{activeProjectId}</div>

      <div className="tabbar">
        {TABS.map((t) => (
          <NavLink key={t.label} to={t.to} end={t.end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            {t.label}
          </NavLink>
        ))}
      </div>

      <CrmDataProvider>
        <Outlet />
      </CrmDataProvider>
    </div>
  );
}
