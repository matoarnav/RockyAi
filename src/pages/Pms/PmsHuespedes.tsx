import { Fragment, useState } from 'react';
import { usePmsData } from '../../context/PmsDataContext';
import Reveal from '../../components/Reveal';
import NewGuestModal from './NewGuestModal';
import type { PmsGuest } from '../../types';

function formatLtv(guest: PmsGuest) {
  const n = Number(guest.TotalLTV);
  if (!n) return '—';
  return n.toLocaleString('es-CL');
}

export default function PmsHuespedes() {
  const { guests, bookings, loading, loadError } = usePmsData();
  const [showNew, setShowNew] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Reveal>
      <div className="crm-toolbar">
        <div className="section-title" style={{ margin: 0 }}>
          Huéspedes ({guests.length})
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowNew(true)}>
          + Nuevo huésped
        </button>
      </div>

      {loading ? (
        <div className="empty-state">Cargando…</div>
      ) : loadError ? (
        <div className="empty-state">No se pudo conectar con el PMS.</div>
      ) : guests.length === 0 ? (
        <div className="empty-state">
          Todavía no hay huéspedes registrados en este lodge.
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowNew(true)}>
              Crear el primero
            </button>
          </div>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Huésped</th>
              <th>Contacto</th>
              <th>Origen</th>
              <th>Etiquetas</th>
              <th>LTV</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => {
              const guestBookings = bookings.filter((b) => b.GuestID === g.GuestID);
              const isOpen = expanded === g.GuestID;
              return (
                <Fragment key={g.GuestID}>
                  <tr className="row-clickable" onClick={() => setExpanded(isOpen ? null : g.GuestID)}>
                    <td className="cell-name">{g.FullName}</td>
                    <td>
                      {g.Contact.Email || '—'}
                      {g.Contact.WhatsApp && <div className="cell-sub">{g.Contact.WhatsApp}</div>}
                    </td>
                    <td>{g.OriginCountry || '—'}</td>
                    <td>
                      {g.VIP_Tags.length ? g.VIP_Tags.map((t) => <span className="tag" key={t}>{t}</span>) : '—'}
                    </td>
                    <td className="tabular">{formatLtv(g)}</td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={5} style={{ background: 'rgba(255,255,255,0.015)' }}>
                        {guestBookings.length === 0 ? (
                          <div className="cell-sub" style={{ padding: '6px 0' }}>
                            Sin reservas registradas todavía.
                          </div>
                        ) : (
                          <div className="result-list" style={{ padding: '8px 0' }}>
                            {guestBookings.map((b) => (
                              <div className="result-list-item" key={b.BookingID}>
                                <strong style={{ color: 'var(--ink)' }}>{b.RoomID}</strong> · {b.CheckIn} → {b.CheckOut} ·{' '}
                                <span className={`pill ${b.Status.toLowerCase()}`}>{b.Status}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}

      {showNew && <NewGuestModal onClose={() => setShowNew(false)} />}
    </Reveal>
  );
}
