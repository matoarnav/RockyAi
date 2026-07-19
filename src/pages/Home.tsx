import { useEffect } from 'react';
import { usePanelData } from '../context/PanelDataContext';
import WelcomeCard from '../components/WelcomeCard';

export default function Home() {
  const { setActiveProjectId } = usePanelData();

  // "/" siempre significa "sin proyecto" — limpia cualquier selección
  // previa (volver acá por el logo, el botón atrás del navegador, etc.)
  useEffect(() => {
    setActiveProjectId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="main">
      <WelcomeCard />
    </div>
  );
}
