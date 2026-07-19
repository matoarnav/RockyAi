import { usePanelData } from '../context/PanelDataContext';

export default function WelcomeCard() {
  const { projects, setActiveProjectId } = usePanelData();

  return (
    <div className="welcome-wrap">
      <div className="welcome-content">
        <img className="welcome-logo" src="/rocky-brand-white.png" alt="RockyAI" />
        <h1 className="welcome-title">AI Powered Brand &amp; Execution</h1>
        <ul className="welcome-list">
          <li>
            <strong>Estrategia y Consistencia:</strong> El centro de mando donde la estrategia profunda de marca y la
            consistencia visual se encuentran con la eficiencia de la automatización en la nube.
          </li>
          <li>
            <strong>Procesamiento Inteligente:</strong> La plataforma procesa tu material crudo y activa las mentes
            estratégicas de Dave (Brand) y Jimi (Execution).
          </li>
          <li>
            <strong>Músculo Técnico:</strong> Orquesta el motor profesional de DaVinci Resolve Studio en AWS para
            entregarte Reels listos para impactar.
          </li>
          <li>
            <strong>Nuestra Filosofía:</strong> Menos escritorio, más rodaje.
          </li>
        </ul>

        {projects.length > 0 && (
          <div className="welcome-projects">
            <div className="welcome-projects-label">Proyectos vigentes</div>
            <div className="welcome-projects-row">
              {projects.map((p) => (
                <button key={p.id} type="button" className="welcome-project-btn" onClick={() => setActiveProjectId(p.id)}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="welcome-credit">By Matías Araneda</div>
      </div>
    </div>
  );
}
