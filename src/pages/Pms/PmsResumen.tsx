import { useNavigate } from 'react-router-dom';
import { usePmsData } from '../../context/PmsDataContext';
import Reveal from '../../components/Reveal';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function inNextDays(dateIso: string, days: number) {
  const today = todayIso();
  const limit = new Date();
  limit.setDate(limit.getDate() + days);
  return dateIso >= today && dateIso <= limit.toISOString().slice(0, 10);
}

export default function PmsResumen() {
  const { guests, bookings, loading, loadError } = usePmsData();
  const navigate = useNavigate();

  if (loading) return <div className="empty-state">Cargando…</div>;
  if (loadError) return <div className="empty-state">No se pudo conectar con el PMS. Revisá la sesión e intentá de nuevo.</div>;

  const activeBookings = bookings.filter((b) => b.Status !== 'CANCELLED');
  const upcomingCheckins = bookings.filter((b) => b.Status !== 'CANCELLED' && inNextDays(b.CheckIn, 7));
  const nextArrival = [...upcomingCheckins].sort((a, b) => a.CheckIn.localeCompare(b.CheckIn))[0];

  const byStatus = {
    CONFIRMED: activeBookings.filter((b) => b.Status === 'CONFIRMED').length,
    PENDING: activeBookings.filter((b) => b.Status === 'PENDING').length,
  };

  const upcomingList = [...bookings]
    .filter((b) => b.Status !== 'CANCELLED' && b.CheckIn >= todayIso())
    .sort((a, b) => a.CheckIn.localeCompare(b.CheckIn))
    .slice(0, 6);

  return (
    <Reveal>
      <div className="mini-dash">
        <Reveal delay={0}>
          <div className="mini-card c-pms">
            <div className="mini-card-icon">◆</div>
            <div className="mini-card-label">Huéspedes registrados</div>
            <div className="mini-card-value tabular">{guests.length}</div>
            <div className="mini-card-sub">En este lodge</div>
            <button className="mini-card-cta" onClick={() => navigate('huespedes')}>
              Ver más →
            </button>
          </div>
        </Reveal>
        <Reveal delay={60}>
          <div className="mini-card c-pms">
            <div className="mini-card-icon">▤</div>
            <div className="mini-card-label">Reservas activas</div>
            <div className="mini-card-value tabular">{activeBookings.length}</div>
            <div className="mini-card-sub">
              {byStatus.CONFIRMED} confirmadas · {byStatus.PENDING} pendientes
            </div>
            <button className="mini-card-cta" onClick={() => navigate('reservas')}>
              Ver más →
            </button>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="mini-card c-pms">
            <div className="mini-card-icon">✈</div>
            <div className="mini-card-label">Check-ins próximos 7 días</div>
            <div className="mini-card-value tabular">{upcomingCheckins.length}</div>
            <div className="mini-card-sub">{nextArrival ? `Próxima: ${nextArrival.GuestName} · ${nextArrival.CheckIn}` : 'Sin llegadas próximas'}</div>
            <button className="mini-card-cta" onClick={() => navigate('itinerario')}>
              Ver itinerario →
            </button>
          </div>
        </Reveal>
        <Reveal delay={180}>
          <div className="mini-card c-pms">
            <div className="mini-card-icon">◈</div>
            <div className="mini-card-label">Estado del sistema</div>
            <div className="mini-card-value" style={{ fontSize: 17 }}>
              Operativo
            </div>
            <div className="mini-card-sub">Webhook listo para un motor Headless (Apaleo/Channex) cuando se conecte</div>
          </div>
        </Reveal>
      </div>

      <div className="section-head" style={{ marginTop: 36 }}>
        <span className="section-title">Próximas llegadas</span>
      </div>
      {upcomingList.length === 0 ? (
        <div className="empty-state">No hay llegadas próximas registradas todavía.</div>
      ) : (
        <div className="timeline">
          {upcomingList.map((b) => (
            <div key={b.BookingID} className="timeline-item clickable" onClick={() => navigate('reservas')}>
              <span className="timeline-when">{b.CheckIn}</span>
              <span className="timeline-text">
                <strong style={{ color: 'var(--ink)' }}>{b.GuestName}</strong> · {b.RoomID} · {b.CheckIn} → {b.CheckOut}
              </span>
              <span className="timeline-view-hint">Ver reservas →</span>
            </div>
          ))}
        </div>
      )}
    </Reveal>
  );
}
