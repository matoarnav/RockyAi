import { useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { usePanelData } from '../../context/PanelDataContext';
import { CrmDataProvider } from '../../context/CrmDataContext';
import { TOOL_KEYS } from '../../constants';
import { useSlidingIndicator } from '../../hooks/useSlidingIndicator';

const TABS = [
  { to: '.', label: 'Resumen', end: true },
  { to: 'campanas', label: 'Campañas' },
  { to: 'nueva', label: 'Nueva campaña' },
  { to: 'audiencias', label: 'Audiencias' },
  { to: 'templates', label: 'Templates' },
  { to: 'metricas', label: 'Métricas' },
  { to: 'automatizaciones', label: 'Automatizaciones' },
];

export default function EmailCrmLayout() {
  const { activeProjectName, activeProjectId, activeProject } = usePanelData();
  const navigate = useNavigate();
  const location = useLocation();
  const tabbarRef = useRef<HTMLDivElement>(null);
  useSlidingIndicator(tabbarRef, '.tab.active', 'horizontal', [location.pathname]);

  const activeTools = activeProject?.tools?.length ? activeProject.tools : TOOL_KEYS;
  if (!activeTools.includes('email-marketing')) {
    navigate('..', { replace: true });
    return null;
  }

  return (
    <div className="main">
      <button className="back-link" onClick={() => navigate('..')}>
        &larr; Volver al panel
      </button>
      <div className="eyebrow">CRM Email Marketing</div>
      <div className="page-title">{activeProjectName}</div>
      <div className="page-sub">proyectos/{activeProjectId}</div>

      <div className="tabbar" ref={tabbarRef}>
        <div className="slide-indicator slide-indicator-h" />
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
