import { NavLink } from 'react-router-dom';
import { PROJECT_LOGO } from '../constants';
import { formatTodayEs } from '../api';
import type { HealthBadge } from '../types';

// Header compartido de Resumen/Metricas, calcado del Figma: logo grande del
// cliente + pill de estado + campana + fecha, y debajo una barra de tabs
// Resumen/Metricas (redundante con el nav del sidebar a proposito - asi
// esta en el diseño real, y no le quita nada al nav existente).
export default function PageHeader({
  projectId,
  projectName,
  worstTone,
  hasAlert,
}: {
  projectId: string | null;
  projectName: string;
  worstTone: HealthBadge['tone'] | null;
  hasAlert: boolean;
}) {
  return (
    <>
      <div className="page-header">
        <div className="page-header-logo-wrap">
          {projectId && PROJECT_LOGO[projectId] ? (
            <img className="page-header-logo" src={PROJECT_LOGO[projectId]} alt={projectName} />
          ) : (
            <div className="page-header-logo page-header-logo-fallback">{projectName.slice(0, 2).toUpperCase()}</div>
          )}
        </div>
        <div className="page-header-right">
          {worstTone && (
            <span className={`sys-pill sys-pill-${worstTone}`}>
              <span className={`sys-dot sys-dot-${worstTone}`} />
              {worstTone === 'ok' ? 'Operativo' : worstTone === 'warn' ? 'Atención' : worstTone === 'error' ? 'Con errores' : 'Sin datos'}
            </span>
          )}
          <span className={`page-header-bell${hasAlert ? ' page-header-bell-active' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {hasAlert && <span className="page-header-bell-dot" />}
          </span>
          <span className="page-header-date">{formatTodayEs()}</span>
        </div>
      </div>
      <div className="page-tabs">
        <NavLink to={`/p/${projectId}`} end className={({ isActive }) => `page-tab${isActive ? ' active' : ''}`}>
          Resumen
        </NavLink>
        <NavLink to={`/p/${projectId}/metricas`} className={({ isActive }) => `page-tab${isActive ? ' active' : ''}`}>
          Métricas
        </NavLink>
      </div>
    </>
  );
}
