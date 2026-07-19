import { useCrmData } from '../../context/CrmDataContext';
import { formatWhen } from '../../api';
import { sentCampaigns, statusLabel } from './crmUtils';

export default function Resumen() {
  const { contacts, campaigns } = useCrmData();
  const sent = sentCampaigns(campaigns);

  const totals = sent.reduce(
    (acc, c) => {
      acc.enviados += c.stats?.enviados || 0;
      acc.aperturas += c.stats?.aperturas || 0;
      acc.rebotes += c.stats?.rebotes || 0;
      return acc;
    },
    { enviados: 0, aperturas: 0, rebotes: 0 }
  );

  const activeContacts = contacts.filter((c) => c.status === 'subscribed').length;
  const openRate = totals.enviados ? ((totals.aperturas / totals.enviados) * 100).toFixed(1) + '%' : '—';
  const bounceRate = totals.enviados ? ((totals.rebotes / totals.enviados) * 100).toFixed(1) + '%' : '—';
  const thisMonth = new Date().toISOString().slice(0, 7);
  const sentThisMonth = sent.filter((c) => (c.sent_at || '').slice(0, 7) === thisMonth).length;

  const recent = campaigns
    .slice()
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(0, 5);

  return (
    <div>
      <div className="mini-dash" style={{ marginTop: 0 }}>
        <div className="mini-card">
          <div className="mini-card-label">Contactos activos</div>
          <div className="mini-card-value tabular">{activeContacts}</div>
        </div>
        <div className="mini-card">
          <div className="mini-card-label">Tasa de apertura promedio</div>
          <div className="mini-card-value tabular">{openRate}</div>
        </div>
        <div className="mini-card">
          <div className="mini-card-label">Campañas enviadas (mes)</div>
          <div className="mini-card-value tabular">{sentThisMonth}</div>
        </div>
        <div className="mini-card">
          <div className="mini-card-label">Tasa de rebote</div>
          <div className="mini-card-value tabular">{bounceRate}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '20px 20px 6px', marginTop: 22 }}>
        <div className="desc-label">Actividad reciente</div>
        {recent.length ? (
          <div className="timeline" style={{ border: 'none', padding: 0, background: 'none' }}>
            {recent.map((c) => {
              const rate =
                c.status === 'sent' && c.stats?.enviados ? `${((c.stats.aperturas / c.stats.enviados) * 100).toFixed(1)}% apertura` : statusLabel(c.status);
              return (
                <div className="timeline-item" key={c.campaign_id} style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div className="timeline-text">{c.name || 'Sin nombre'}</div>
                    <div className="timeline-when">{formatWhen(c.sent_at || c.created_at)}</div>
                  </div>
                  <span className={`pill ${c.status}`}>
                    <span className="pill-dot" />
                    {rate}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">Todavía no hay campañas.</div>
        )}
      </div>
    </div>
  );
}
