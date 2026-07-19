import { Navigate, Outlet, useParams } from 'react-router-dom';
import { usePanelData } from '../context/PanelDataContext';

export default function ProjectRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  const { activeProjectId, setActiveProjectId, projects, loading } = usePanelData();

  // Sincroniza el contexto desde la URL antes de que las rutas hijas
  // rendericen — evita el flash de "sin proyecto" al entrar directo o
  // refrescar en una URL de proyecto (antes, activeProjectId era solo
  // estado en memoria y se perdía al refrescar).
  if (projectId && projectId !== activeProjectId) {
    setActiveProjectId(projectId);
  }

  // Mientras el estado sigue cargando por primera vez no sabemos aún si
  // el proyecto existe - no redirigir todavía para no botar a alguien
  // que entró directo a una URL de proyecto válida.
  if (!loading && projectId && !projects.some((p) => p.id === projectId)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
