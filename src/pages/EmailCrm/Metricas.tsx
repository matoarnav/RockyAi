import { useCrmData } from '../../context/CrmDataContext';
import { sentCampaigns } from './crmUtils';

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
  const { campaigns } = useCrmData();
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

  return (
    <div>
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
