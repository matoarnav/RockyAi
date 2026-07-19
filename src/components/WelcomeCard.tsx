export default function WelcomeCard() {
  return (
    <div className="welcome-wrap">
      <div className="welcome-card">
        <img className="welcome-logo" src="/rocky-brand-logo.png" alt="RockyAI" />
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
        <div className="welcome-credit">By Matías Araneda</div>
      </div>
    </div>
  );
}
