import { useCrmData } from '../../context/CrmDataContext';
import { computeTags, sentCampaigns } from './crmUtils';

function FunnelRow({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="funnel-row">
      <span className="funnel-label">{label}</span>
      <div className="funnel-bar-track">
        <div className="funnel-bar-fill" style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
      </div>
      <span className="funnel-value tabular">{value}</span>
    </div>
  );
}

export default function Metricas() {
  const { campaigns, contacts } = useCrmData();
  const sent = sentCampaigns(campaigns);

  const totals = sent.reduce(
    (acc, c) => {
      const s = c.stats || { enviados: 0, aperturas: 0, clics: 0, rebotes: 0, quejas: 0 };
      acc.enviados += s.enviados || 0;
      acc.aperturas += s.aperturas || 0;
      acc.clics += s.clics || 0;
      return acc;
    },
    { enviados: 0, aperturas: 0, clics: 0 }
  );

  const rows = sent.slice().sort((a, b) => (b.sent_at || '').localeCompare(a.sent_at || ''));

  // Base de contactos: total y por estado.
  const totalBase = contacts.length;
  const subscribedCount = contacts.filter((c) => c.status === 'subscribed').length;
  const unsubscribedCount = contacts.filter((c) => c.status === 'unsubscribed').length;
  const bouncedContactsCount = contacts.filter((c) => c.status === 'bounced').length;
  const tagCounts = computeTags(contacts).map((tag) => ({
    tag,
    count: contacts.filter((c) => (c.tags || []).includes(tag)).length,
  }));

  // Rebote promedio mensual: se agrupan las campañas enviadas por mes de
  // envio, se calcula la tasa de ese mes, y se promedian los meses con
  // envios reales - no es el mismo numero que el rebote acumulado total.
  const monthlyBounce = new Map<string, { enviados: number; rebotes: number }>();
  sent.forEach((c) => {
    const month = (c.sent_at || '').slice(0, 7);
    if (!month) return;
    const s = c.stats || { enviados: 0, aperturas: 0, clics: 0, rebotes: 0, quejas: 0 };
    const acc = monthlyBounce.get(month) || { enviados: 0, rebotes: 0 };
    acc.enviados += s.enviados || 0;
    acc.rebotes += s.rebotes || 0;
    monthlyBounce.set(month, acc);
  });
  const monthlyRates = Array.from(monthlyBounce.values())
    .filter((m) => m.enviados > 0)
    .map((m) => (m.rebotes / m.enviados) * 100);
  const avgMonthlyBounceRate = monthlyRates.length
    ? (monthlyRates.reduce((a, b) => a + b, 0) / monthlyRates.length).toFixed(1)
    : null;

  return (
    <div>
      <div className="mini-dash" style={{ marginTop: 0, marginBottom: 18 }}>
        <div className="mini-card c-email">
          <div className="mini-card-label">Suscritos activos</div>
          <div className="mini-card-value tabular">{subscribedCount}</div>
          <div className="mini-card-sub">de {totalBase} en la base total</div>
        </div>
        <div className="mini-card c-social">
          <div className="mini-card-label">Base total</div>
          <div className="mini-card-value tabular">{totalBase}</div>
          <div className="mini-card-sub">todos los estados</div>
        </div>
        <div className="mini-card c-opens">
          <div className="mini-card-label">Desuscritos</div>
          <div className="mini-card-value tabular">{unsubscribedCount}</div>
          <div className="mini-card-sub">{bouncedContactsCount} marcados como rebotados</div>
        </div>
        <div className="mini-card c-seo">
          <div className="mini-card-label">Rebote promedio mensual</div>
          <div className="mini-card-value tabular">{avgMonthlyBounceRate !== null ? `${avgMonthlyBounceRate}%` : '—'}</div>
          <div className="mini-card-sub">{avgMonthlyBounceRate !== null ? `${monthlyRates.length} mes(es) con envíos` : 'Sin envíos todavía'}</div>
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px', marginBottom: 18 }}>
        <div className="desc-label" style={{ marginBottom: 12 }}>
          Desglose por segmentación / tags
        </div>
        {tagCounts.length ? (
          <table>
            <thead>
              <tr>
                <th>Tag</th>
                <th className="tabular">Contactos</th>
              </tr>
            </thead>
            <tbody>
              {tagCounts
                .slice()
                .sort((a, b) => b.count - a.count)
                .map((t) => (
                  <tr key={t.tag}>
                    <td className="cell-name">{t.tag}</td>
                    <td className="tabular">{t.count}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">Ningún contacto tiene tags asignados todavía.</div>
        )}
      </div>

      <div className="card" style={{ padding: '20px 22px', marginBottom: 18 }}>
        <div className="desc-label" style={{ marginBottom: 12 }}>
          Funnel acumulado — todas las campañas enviadas
        </div>
        <FunnelRow label="Enviados" value={totals.enviados} max={totals.enviados} />
        <FunnelRow label="Aperturas" value={totals.aperturas} max={totals.enviados} />
        <FunnelRow label="Clics" value={totals.clics} max={totals.enviados} />
      </div>

      <div className="card" style={{ padding: '18px 20px' }}>
        <div className="desc-label">Apertura por campaña</div>
        {rows.length ? (
          <table>
            <thead>
              <tr>
                <th>Campaña</th>
                <th className="tabular">Enviados</th>
                <th className="tabular">Apertura</th>
                <th className="tabular">Rebotes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => {
                const s = c.stats || { enviados: 0, aperturas: 0, clics: 0, rebotes: 0, quejas: 0 };
                const rate = s.enviados ? ((s.aperturas / s.enviados) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={c.campaign_id}>
                    <td>
                      <div className="cell-name">{c.name}</div>
                    </td>
                    <td className="tabular">{s.enviados || 0}</td>
                    <td className="tabular">{rate}%</td>
                    <td className="tabular">{s.rebotes || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">Todavía no hay campañas enviadas.</div>
        )}
      </div>
    </div>
  );
}
