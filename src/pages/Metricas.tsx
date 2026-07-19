import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanelData } from '../context/PanelDataContext';
import { formatWhen } from '../api';
import type { MetricsReport } from '../types';

const RANGE_OPTIONS = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
];

export default function Metricas() {
  const { activeProjectName, activeProjectId, scopedAction } = usePanelData();
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<MetricsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!activeProjectId) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    scopedAction<MetricsReport>('get_metrics_report', { days })
      .then((data) => {
        if (!cancelled) setReport(data);
      })
      .catch((e) => {
        console.error('Error cargando el reporte de métricas', e);
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [days, activeProjectId, scopedAction]);

  if (!activeProjectId) {
    navigate('/', { replace: true });
    return null;
  }

  const openRate = report && report.email.enviados ? ((report.email.aperturas / report.email.enviados) * 100).toFixed(1) + '%' : '—';

  return (
    <div className="main">
      <button className="back-link no-print" onClick={() => navigate('/')}>
        &larr; Volver al home
      </button>

      <div className="metrics-toolbar no-print">
        <div>
          <div className="eyebrow">Herramientas</div>
          <div className="page-title">Métricas</div>
          <div className="page-sub">
            {activeProjectName} &middot; {report ? `${formatDateEs(report.range.from)} — ${formatDateEs(report.range.to)}` : '…'}
          </div>
        </div>
        <div className="metrics-actions">
          <div className="range-pills">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                className={`range-pill${opt.days === days ? ' active' : ''}`}
                onClick={() => setDays(opt.days)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => window.print()} type="button">
            ⭳ Descargar reporte
          </button>
        </div>
      </div>

      <div className="print-only report-print-head">
        <div className="page-title">Reporte de métricas — {activeProjectName}</div>
        <div className="page-sub">{report ? `${formatDateEs(report.range.from)} — ${formatDateEs(report.range.to)}` : ''}</div>
      </div>

      {loading && <div className="empty-state">Cargando métricas…</div>}
      {!loading && error && <div className="empty-state">No se pudo cargar el reporte. Intenta de nuevo.</div>}

      {!loading && !error && report && (
        <>
          <div className="mini-dash">
            <div className="mini-card c-email">
              <div className="mini-card-icon">✉</div>
              <div className="mini-card-label">Envíos del período</div>
              <div className="mini-card-value tabular">{report.email.enviados}</div>
              <div className="mini-card-sub">{openRate} de apertura</div>
            </div>
            <div className="mini-card c-social">
              <div className="mini-card-icon">◈</div>
              <div className="mini-card-label">Seguidores Instagram</div>
              <div className="mini-card-value tabular">{report.social.seguidores_actuales ?? '—'}</div>
              <div className="mini-card-sub">
                {report.social.cambio_neto_periodo >= 0 ? '+' : ''}
                {report.social.cambio_neto_periodo} en el período
              </div>
            </div>
            <div className="mini-card c-seo">
              <div className="mini-card-icon">▲</div>
              <div className="mini-card-label">Posición SEO</div>
              <div className="mini-card-value tabular">{report.seo.posicion_actual ?? '—'}</div>
              <div className="mini-card-sub">{report.seo.keyword ? `"${report.seo.keyword}"` : 'Sin datos todavía'}</div>
            </div>
            <div className="mini-card c-opens">
              <div className="mini-card-icon">◎</div>
              <div className="mini-card-label">Contenido generado</div>
              <div className="mini-card-value tabular">{report.content.count}</div>
              <div className="mini-card-sub">piezas en el período</div>
            </div>
          </div>

          <div className="section-head" style={{ marginTop: 36 }}>
            <span className="section-title">Email marketing</span>
          </div>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Campaña</th>
                  <th>Enviada</th>
                  <th className="tabular">Enviados</th>
                  <th className="tabular">Apertura</th>
                </tr>
              </thead>
              <tbody>
                {report.email.campaigns.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <div className="cell-name">{c.name || 'Sin nombre'}</div>
                    </td>
                    <td className="tabular">{formatWhen(c.sent_at)}</td>
                    <td className="tabular">{c.enviados}</td>
                    <td className="tabular">{c.enviados ? ((c.aperturas / c.enviados) * 100).toFixed(1) + '%' : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!report.email.campaigns.length && <div className="empty-state">Sin campañas enviadas en este período.</div>}
          </div>

          <div className="section-head" style={{ marginTop: 30 }}>
            <span className="section-title">Social — Instagram</span>
          </div>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Publicación</th>
                  <th>Fecha</th>
                  <th className="tabular">Alcance</th>
                  <th className="tabular">Likes</th>
                  <th className="tabular">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {report.social.publicaciones.map((p) => (
                  <tr key={p.media_id}>
                    <td>
                      <a href={p.permalink} target="_blank" rel="noreferrer" className="cell-name" style={{ textDecoration: 'underline' }}>
                        {p.tipo} · {p.formato}
                      </a>
                      <div className="cell-sub">{p.caption}</div>
                    </td>
                    <td className="tabular">{formatWhen(p.fecha)}</td>
                    <td className="tabular">{p.alcance}</td>
                    <td className="tabular">{p.likes}</td>
                    <td className="tabular">{p.engagement_rate_sobre_alcance_pct != null ? `${p.engagement_rate_sobre_alcance_pct}%` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!report.social.publicaciones.length && <div className="empty-state">Sin publicaciones registradas en este período.</div>}
          </div>

          <div className="section-head" style={{ marginTop: 30 }}>
            <span className="section-title">SEO — posición</span>
          </div>
          <div className="card" style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Keyword</th>
                  <th className="tabular">Posición</th>
                </tr>
              </thead>
              <tbody>
                {report.seo.snapshots.map((s, i) => (
                  <tr key={i}>
                    <td className="tabular">{formatDateEs(s.fecha)}</td>
                    <td>{s.keyword ?? '—'}</td>
                    <td className="tabular">{s.posicion ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!report.seo.snapshots.length && <div className="empty-state">Sin snapshots de SEO en este período.</div>}
          </div>

          <div className="section-head" style={{ marginTop: 30 }}>
            <span className="section-title">Contenido generado</span>
          </div>
          <div className="card" style={{ overflowX: 'auto', marginBottom: 30 }}>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Canal</th>
                  <th>Pieza</th>
                </tr>
              </thead>
              <tbody>
                {report.content.piezas.map((p, i) => (
                  <tr key={i}>
                    <td className="tabular">{formatDateEs(p.fecha)}</td>
                    <td>{p.canal}</td>
                    <td>{p.headline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!report.content.piezas.length && <div className="empty-state">Sin piezas de contenido en este período.</div>}
          </div>
        </>
      )}
    </div>
  );
}

function formatDateEs(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}
