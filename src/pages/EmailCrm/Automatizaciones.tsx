import { useState } from 'react';
import { useCrmData } from '../../context/CrmDataContext';

const TRACK_LABELS: Record<string, string> = {
  captacion: 'Captación',
  long_term_nurture: 'Nutrición de largo plazo',
  reserva_abandonada: 'Reserva abandonada',
  operaciones: 'Operaciones (pre-viaje)',
  fidelizacion: 'Fidelización (post-viaje)',
  reactivacion_inactivos: 'Reactivación de inactivos',
};

export default function Automatizaciones() {
  const { journeys, refetch, scopedAction } = useCrmData();
  const [busyTrack, setBusyTrack] = useState<string | null>(null);

  async function toggle(trackId: string, paused: boolean) {
    setBusyTrack(trackId);
    try {
      await scopedAction(paused ? 'resume_journey_track' : 'pause_journey_track', { track_id: trackId });
      await refetch();
    } finally {
      setBusyTrack(null);
    }
  }

  return (
    <div>
      <div className="desc-label" style={{ marginBottom: 14 }}>
        Automatizaciones activas — pausar un track congela a los contactos exactamente donde están, sin perder su progreso.
      </div>

      {!journeys.length && (
        <div className="card empty-state">Este proyecto todavía no tiene un motor de journeys configurado.</div>
      )}

      <div className="agents-grid">
        {journeys.map((j) => (
          <div key={j.track_id} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div className="cell-name" style={{ fontSize: 14.5, marginBottom: 4 }}>
                  {TRACK_LABELS[j.track_id] || j.track_id}
                </div>
                <div className="cell-sub">Disparador: {j.trigger_event}</div>
              </div>
            </div>
            <div className="status" style={{ marginTop: 14 }}>
              <span className={`status-dot ${j.paused ? 'never' : 'ready'}`} />
              {j.paused ? 'Pausado' : 'Activo'}
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="desc-label">Contactos en este track</div>
              <div className="mini-card-value tabular" style={{ fontSize: 22 }}>
                {j.contact_count}
              </div>
            </div>
            <button
              className={`btn ${j.paused ? 'btn-primary' : 'btn-ghost'}`}
              style={{ marginTop: 16, width: '100%' }}
              disabled={busyTrack === j.track_id}
              onClick={() => toggle(j.track_id, j.paused)}
            >
              {busyTrack === j.track_id ? 'Aplicando...' : j.paused ? 'Reanudar' : 'Pausar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
