import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrmData } from '../../context/CrmDataContext';
import { callAction, formatWhen } from '../../api';
import { statusLabel } from './crmUtils';

export default function Campanas() {
  const { campaigns, refetch } = useCrmData();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const list = campaigns
    .filter((c) => !search || (c.name || '').toLowerCase().includes(search.toLowerCase()))
    .slice()
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

  async function handleDelete(campaignId: string) {
    if (!confirm('¿Eliminar esta campaña del histórico?')) return;
    await callAction('delete_email_campaign', { campaign_id: campaignId });
    await refetch();
  }

  return (
    <div>
      <div className="crm-toolbar">
        <input className="crm-search" placeholder="Buscar campaña..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn btn-primary" onClick={() => navigate('../nueva')}>
          + Nueva campaña
        </button>
      </div>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Campaña</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th className="tabular">Enviados</th>
              <th className="tabular">Apertura</th>
              <th className="tabular">Clics</th>
              <th className="tabular">Rebotes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const s = c.stats || { enviados: 0, aperturas: 0, clics: 0, rebotes: 0, quejas: 0 };
              const pct = (n: number) => (c.status === 'sent' && s.enviados ? ((n / s.enviados) * 100).toFixed(1) + '%' : '—');
              return (
                <tr key={c.campaign_id}>
                  <td>
                    <div className="cell-name">{c.name || 'Sin nombre'}</div>
                    <div className="cell-sub">{c.subject}</div>
                  </td>
                  <td>
                    <span className={`pill ${c.status}`}>
                      <span className="pill-dot" />
                      {statusLabel(c.status)}
                    </span>
                  </td>
                  <td className="tabular">{formatWhen(c.sent_at || c.created_at) || '—'}</td>
                  <td className="tabular">{c.status === 'sent' ? s.enviados : '—'}</td>
                  <td className="tabular">{pct(s.aperturas)}</td>
                  <td className="tabular">{pct(s.clics)}</td>
                  <td className="tabular">{pct(s.rebotes)}</td>
                  <td>
                    <div className="row-actions">
                      <span className="icon-btn danger" title="Eliminar" onClick={() => handleDelete(c.campaign_id)}>
                        🗑
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!list.length && <div className="empty-state">Todavía no hay campañas — crea la primera desde "+ Nueva campaña".</div>}
      </div>
    </div>
  );
}
