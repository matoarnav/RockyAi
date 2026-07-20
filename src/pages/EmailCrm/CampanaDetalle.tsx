import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCrmData } from '../../context/CrmDataContext';
import { formatWhen } from '../../api';
import { statusLabel } from './crmUtils';
import type { CampaignRecipient, EmailCampaign } from '../../types';

export default function CampanaDetalle() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const { scopedAction } = useCrmData();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    scopedAction<{ campaign: EmailCampaign; recipients: CampaignRecipient[] }>('get_email_campaign_detail', { campaign_id: campaignId })
      .then((data) => {
        if (cancelled) return;
        setCampaign(data.campaign);
        setRecipients(data.recipients || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudo cargar la campaña');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId, scopedAction]);

  if (loading) return <div className="empty-state">Cargando...</div>;
  if (error || !campaign) return <div className="empty-state">{error || 'Campaña no encontrada'}</div>;

  const s = campaign.stats || { enviados: 0, aperturas: 0, clics: 0, rebotes: 0, quejas: 0 };
  const clickRate = s.enviados ? ((s.clics / s.enviados) * 100).toFixed(1) : '0.0';
  const openRate = s.enviados ? ((s.aperturas / s.enviados) * 100).toFixed(1) : '0.0';
  const bounceRate = s.enviados ? ((s.rebotes / s.enviados) * 100).toFixed(1) : '0.0';

  return (
    <div>
      <button className="back-link" onClick={() => navigate('../campanas')}>
        &larr; Volver a campañas
      </button>
      <div className="eyebrow">Campaña</div>
      <div className="page-title">{campaign.name || 'Sin nombre'}</div>
      <div className="page-sub">
        {campaign.subject} ·{' '}
        <span className={`pill ${campaign.status}`}>
          <span className="pill-dot" />
          {statusLabel(campaign.status)}
        </span>
      </div>

      <div className="mini-dash" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="mini-card c-social">
          <div className="mini-card-icon">🖱</div>
          <div className="mini-card-label">Clics (métrica principal)</div>
          <div className="mini-card-value tabular">{clickRate}%</div>
          <div className="mini-card-sub">{s.clics} de {s.enviados} enviados</div>
        </div>
        <div className="mini-card c-opens">
          <div className="mini-card-icon">👁</div>
          <div className="mini-card-label">Aperturas</div>
          <div className="mini-card-value tabular">{openRate}%</div>
          <div className="mini-card-sub">Referencial — Apple Mail infla este número automáticamente</div>
        </div>
        <div className="mini-card c-email">
          <div className="mini-card-icon">✉</div>
          <div className="mini-card-label">Enviados</div>
          <div className="mini-card-value tabular">{s.enviados}</div>
        </div>
        <div className="mini-card c-seo">
          <div className="mini-card-icon">⚠</div>
          <div className="mini-card-label">Rebotes</div>
          <div className="mini-card-value tabular">{bounceRate}%</div>
          <div className="mini-card-sub">{s.rebotes} de {s.enviados} enviados</div>
        </div>
      </div>

      <div className="card" style={{ padding: '18px 20px', marginTop: 18, overflowX: 'auto' }}>
        <div className="desc-label" style={{ marginBottom: 12 }}>
          Destinatarios ({recipients.length})
        </div>
        {recipients.length ? (
          <table>
            <thead>
              <tr>
                <th>Contacto</th>
                <th>Enviado</th>
                <th>Apertura</th>
                <th>Clic</th>
                <th>Links clickeados</th>
                <th>Rebotó</th>
              </tr>
            </thead>
            <tbody>
              {recipients
                .slice()
                .sort((a, b) => (a.contact_email || '').localeCompare(b.contact_email || ''))
                .map((r) => (
                  <tr key={r.contact_email}>
                    <td className="cell-name">{r.contact_email}</td>
                    <td className="tabular">{formatWhen(r.sent_at) || '—'}</td>
                    <td className="tabular">{r.opened ? formatWhen(r.opened_at) || 'Sí' : '—'}</td>
                    <td className="tabular">{r.clicked ? formatWhen(r.clicked_at) || 'Sí' : '—'}</td>
                    <td>{r.clicked_links?.length ? r.clicked_links.join(', ') : '—'}</td>
                    <td className="tabular">{r.bounced ? 'Sí' : '—'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            {campaign.status === 'sent'
              ? 'Sin datos de destinatarios individuales todavía — pueden tardar unos minutos en llegar los eventos de SES.'
              : 'Esta campaña todavía no se ha enviado.'}
          </div>
        )}
      </div>
    </div>
  );
}
