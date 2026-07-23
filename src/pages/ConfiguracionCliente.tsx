import { usePanelData } from '../context/PanelDataContext';
import AgentToolToggleCard from '../components/AgentToolToggleCard';

export default function ConfiguracionCliente() {
  const { activeProject, activeProjectName } = usePanelData();

  return (
    <div>
      <div className="page-title">Configuración</div>
      <div className="page-sub">Agentes y herramientas habilitados para {activeProjectName}.</div>

      <div style={{ marginTop: 22, maxWidth: 560 }}>
        {activeProject ? <AgentToolToggleCard project={activeProject} /> : <div className="empty-state">Cargando cliente…</div>}
      </div>
    </div>
  );
}
