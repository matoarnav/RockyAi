import { useMemo, useState } from 'react';
import { usePmsData } from '../../context/PmsDataContext';
import Reveal from '../../components/Reveal';
import BookingDetailModal from './BookingDetailModal';
import { LODGE_ROOMS } from './pmsRooms';
import type { PmsBooking } from '../../types';

const WINDOW_DAYS = 21;
const DOW = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, n: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function dayIndex(rangeStart: string, iso: string) {
  const start = new Date(`${rangeStart}T00:00:00`).getTime();
  const d = new Date(`${iso}T00:00:00`).getTime();
  return Math.round((d - start) / 86400000);
}

function monthLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  const s = d.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function PmsCalendario() {
  const { lodgeId, bookings, loading, loadError } = usePmsData();
  const [rangeStart, setRangeStart] = useState(todayIso());
  const [selected, setSelected] = useState<PmsBooking | null>(null);

  const days = useMemo(() => Array.from({ length: WINDOW_DAYS }, (_, i) => addDays(rangeStart, i)), [rangeStart]);
  const today = todayIso();

  const rooms = useMemo(() => {
    const known = LODGE_ROOMS[lodgeId];
    if (known) return known;
    const distinct = Array.from(new Set(bookings.map((b) => b.RoomID))).sort();
    return distinct.map((id) => ({ id, label: id, category: '' }));
  }, [lodgeId, bookings]);

  const activeBookings = bookings.filter((b) => b.Status !== 'CANCELLED');
  const rangeEndExclusive = addDays(rangeStart, WINDOW_DAYS);
  const occupiedToday = rooms.filter((r) => activeBookings.some((b) => b.RoomID === r.id && b.CheckIn <= today && today < b.CheckOut)).length;

  return (
    <Reveal>
      <div className="pms-cal-toolbar">
        <div className="pms-cal-occupancy">
          <span className="pms-cal-occupancy-value tabular">
            {rooms.length - occupiedToday}/{rooms.length}
          </span>
          <span className="cell-sub">habitaciones libres hoy</span>
        </div>
        <div className="itinerary-daynav" style={{ margin: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setRangeStart((d) => addDays(d, -7))}>
            ← Semana anterior
          </button>
          <div className="itinerary-daynav-current">
            <span className="itinerary-daynav-label">{monthLabel(rangeStart)}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setRangeStart((d) => addDays(d, 7))}>
            Semana siguiente →
          </button>
          {rangeStart !== today && (
            <button className="btn btn-ghost btn-sm" onClick={() => setRangeStart(today)}>
              Hoy
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Cargando…</div>
      ) : loadError ? (
        <div className="empty-state">No se pudo conectar con el PMS.</div>
      ) : rooms.length === 0 ? (
        <div className="empty-state">Sin habitaciones para mostrar todavía.</div>
      ) : (
        <div className="pms-cal-scroll">
          <div className="pms-cal-grid" style={{ gridTemplateColumns: `188px repeat(${WINDOW_DAYS}, minmax(52px, 1fr))` }}>
            <div className="pms-cal-corner" style={{ gridRow: 1, gridColumn: 1 }} />
            {days.map((d, i) => {
              const dow = new Date(`${d}T00:00:00`).getDay();
              const isWeekend = dow === 0 || dow === 6;
              const isToday = d === today;
              return (
                <div
                  key={d}
                  className={`pms-cal-daycell-head${isWeekend ? ' weekend' : ''}${isToday ? ' today' : ''}`}
                  style={{ gridRow: 1, gridColumn: i + 2 }}
                >
                  <div className="pms-cal-dow">{DOW[dow]}</div>
                  <div className="pms-cal-daynum tabular">{Number(d.slice(8, 10))}</div>
                </div>
              );
            })}

            {rooms.map((room, rIdx) => {
              const row = rIdx + 2;
              const roomBookings = activeBookings.filter(
                (b) => b.RoomID === room.id && b.CheckIn < rangeEndExclusive && b.CheckOut > rangeStart
              );
              return (
                <div className="pms-cal-row-group" key={room.id} style={{ display: 'contents' }}>
                  <div className="pms-cal-roomlabel" style={{ gridRow: row, gridColumn: 1 }}>
                    <div className="cell-name" style={{ fontSize: 12.5 }}>
                      {room.label}
                    </div>
                    {room.category && <div className="cell-sub">{room.category}</div>}
                  </div>
                  {days.map((d, i) => {
                    const dow = new Date(`${d}T00:00:00`).getDay();
                    const isWeekend = dow === 0 || dow === 6;
                    const isToday = d === today;
                    return (
                      <div
                        key={d}
                        className={`pms-cal-bgcell${isWeekend ? ' weekend' : ''}${isToday ? ' today' : ''}`}
                        style={{ gridRow: row, gridColumn: i + 2 }}
                      />
                    );
                  })}
                  {roomBookings.map((b) => {
                    const startIdx = Math.max(0, dayIndex(rangeStart, b.CheckIn));
                    const endIdx = Math.min(WINDOW_DAYS, dayIndex(rangeStart, b.CheckOut));
                    const truncatedStart = b.CheckIn < rangeStart;
                    const truncatedEnd = b.CheckOut > rangeEndExclusive;
                    return (
                      <button
                        key={b.BookingID}
                        className={`pms-cal-bar ${b.Status.toLowerCase()}${truncatedStart ? ' trunc-start' : ''}${truncatedEnd ? ' trunc-end' : ''}`}
                        style={{ gridRow: row, gridColumn: `${startIdx + 2} / ${endIdx + 2}` }}
                        onClick={() => setSelected(b)}
                        title={`${b.GuestName} · ${b.CheckIn} → ${b.CheckOut} · ${b.PartyMembers} pax`}
                      >
                        {b.GuestName}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selected && <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />}
    </Reveal>
  );
}
