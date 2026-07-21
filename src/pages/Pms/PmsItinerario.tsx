import { useCallback, useEffect, useState } from 'react';
import { usePmsData } from '../../context/PmsDataContext';
import { getItinerary } from '../../pmsApi';
import Reveal from '../../components/Reveal';
import type { PmsItinerary } from '../../types';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDayEs(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  const s = d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function stayLabel(checkIn: string, checkOut: string, date: string) {
  if (checkIn === date) return { text: 'Llega hoy', cls: 'arrival' };
  if (checkOut === date) return { text: 'Sale hoy', cls: 'departure' };
  return { text: 'En estadía', cls: 'staying' };
}

export default function PmsItinerario() {
  const { lodgeId } = usePmsData();
  const [date, setDate] = useState(todayIso());
  const [data, setData] = useState<PmsItinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(
    (d: string) => {
      setLoading(true);
      setError(false);
      getItinerary(lodgeId, d)
        .then((res) => setData(res))
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    },
    [lodgeId]
  );

  useEffect(() => {
    load(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, lodgeId]);

  const bookings = data?.bookings || [];
  const experiences = data?.experiences || [];
  const bookingById = new Map(bookings.map((b) => [b.BookingID, b]));

  return (
    <Reveal>
      <div className="itinerary-daynav">
        <button className="btn btn-ghost btn-sm" onClick={() => setDate((d) => shiftDate(d, -1))}>
          ← Día anterior
        </button>
        <div className="itinerary-daynav-current">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <span className="itinerary-daynav-label">{formatDayEs(date)}</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setDate((d) => shiftDate(d, 1))}>
          Día siguiente →
        </button>
        {date !== todayIso() && (
          <button className="btn btn-ghost btn-sm" onClick={() => setDate(todayIso())}>
            Hoy
          </button>
        )}
      </div>

      {loading ? (
        <div className="empty-state">Cargando…</div>
      ) : error ? (
        <div className="empty-state">No se pudo cargar el itinerario de este día.</div>
      ) : (
        <div className="itinerary-columns">
          <div>
            <div className="section-head">
              <span className="section-title">En el lodge este día</span>
            </div>
            {bookings.length === 0 ? (
              <div className="empty-state">Sin huéspedes en el lodge este día.</div>
            ) : (
              <div className="result-list">
                {bookings.map((b) => {
                  const label = stayLabel(b.CheckIn, b.CheckOut, date);
                  return (
                    <div className="result-list-item itinerary-guest-card" key={b.BookingID}>
                      <div className="itinerary-guest-row">
                        <strong style={{ color: 'var(--ink)' }}>{b.GuestName}</strong>
                        <span className={`itinerary-stay-badge ${label.cls}`}>{label.text}</span>
                      </div>
                      <div className="cell-sub">
                        {b.RoomID} · {b.CheckIn} → {b.CheckOut}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <div className="section-head">
              <span className="section-title">Experiencias programadas</span>
            </div>
            {experiences.length === 0 ? (
              <div className="empty-state">Sin experiencias programadas este día.</div>
            ) : (
              <div className="result-list">
                {experiences.map((a) => {
                  const booking = bookingById.get(a.BookingID);
                  return (
                    <div className="result-list-item" key={a.AddonID}>
                      <div style={{ color: 'var(--ink)', fontWeight: 700, marginBottom: 4 }}>{a.ServiceName}</div>
                      <div className="cell-sub" style={{ marginBottom: 8 }}>
                        {booking ? booking.GuestName : `Reserva ${a.BookingID}`}
                      </div>
                      <div className="pms-route">
                        <span className="pms-route-base">{a.Logistics.OperationBase}</span>
                        <span className="pms-route-arrow">→</span>
                        <span className="pms-route-zone">{a.Logistics.GuidingZone}</span>
                      </div>
                      {a.Logistics.GuideAssigned && <div className="cell-sub" style={{ marginTop: 6 }}>Guía: {a.Logistics.GuideAssigned}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Reveal>
  );
}
