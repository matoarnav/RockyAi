import { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePanelData } from '../context/PanelDataContext';
import { callAction } from '../api';
import { AGENT_META, DEFAULTS } from '../constants';
import Reveal from '../components/Reveal';
import type { AgencyOverview, AgentKey, AiSpendOverview } from '../types';

const MONTH_LABEL: Record<string, string> = {
  '01': 'enero', '02': 'febrero', '03': 'marzo', '04': 'abril', '05': 'mayo', '06': 'junio',
  '07': 'julio', '08': 'agosto', '09': 'septiembre', '10': 'octubre', '11': 'noviembre', '12': 'diciembre',
};

function money(v: number | null) {
  return v === null ? '—' : `$${v.toFixed(2)}`;
}

function monthLabel(periodMonth: string) {
  const [, m] = periodMonth.split('-');
  return MONTH_LABEL[m] || periodMonth;
}

export default function Reportes() {
  const { projects } = usePanelData();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<AiSpendOverview | null>(null);
  const [spendError, setSpendError] = useState(false);
  const [agency, setAgency] = useState<AgencyOverview | null>(null);
  const [agencyError, setAgencyError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const projectIds = projects.map((p) => p.id);
    callAction<AiSpendOverview>('get_ai_spend_overview', { project_ids: projectIds })
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((e) => {
        console.error('Error cargando el gasto de IA', e);
        if (!cancelled) setSpendError(true);
      });
    callAction<AgencyOverview>('get_agency_overview', { project_ids: projectIds })
      .then((data) => {
        if (!cancelled) setAgency(data);
      })
      .catch((e) => {
        console.error('Error cargando el resumen de agencia', e);
        if (!cancelled) setAgencyError(true);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name || id;
  const topClient = overview?.by_client.find((c) => c.project_id === overview.top_client);
  const totalTokens = overview ? overview.claude.input_tokens + overview.claude.output_tokens : 0;

  return (
    <div className="main">
      <div className="eyebrow">General</div>
      <div className="page-title">Reportes</div>
      <div className="page-sub">
        Gasto real en AWS y en APIs de IA, y alertas activas — vista agencia-wide, no está asociada a ningún cliente.
      </div>

      <div className="section-head" style={{ marginTop: 32 }}>
        <span className="section-title">Infraestructura AWS</span>
      </div>
      {agencyError && <div className="empty-state">No se pudo cargar el gasto de AWS.</div>}
      {!agencyError && (
        <div className="mini-dash">
          <Reveal delay={0}>
            <div className="mini-card c-pms">
              <div className="mini-card-icon">☁</div>
              <div className="mini-card-label">Gasto AWS del mes</div>
              <div className="mini-card-value tabular">
                {agency ? (agency.billing.available ? money(agency.billing.month_to_date_usd) : 'No disponible') : '…'}
              </div>
              <div className="mini-card-sub">
                {agency?.billing.budget_usd != null ? `Presupuesto: ${money(agency.billing.budget_usd)}` : 'CloudWatch EstimatedCharges'}
              </div>
            </div>
          </Reveal>
          <Reveal delay={60}>
            <div className="mini-card c-pms">
              <div className="mini-card-icon">◈</div>
              <div className="mini-card-label">Agentes listos</div>
              <div className="mini-card-value tabular">{agency ? `${agency.agents.ready}/${agency.agents.total}` : '…'}</div>
              <div className="mini-card-sub">{agency ? `${agency.agents.processing} procesando · ${agency.agents.never_run} sin correr` : 'Cargando…'}</div>
            </div>
          </Reveal>
        </div>
      )}

      <div className="section-head" style={{ marginTop: 36 }}>
        <span className="section-title">Alertas activas</span>
      </div>
      {!agencyError && agency && agency.errors.length === 0 && (
        <div className="empty-state">Sin alertas activas — ningún agente está en estado de error.</div>
      )}
      {!agencyError && agency && agency.errors.length > 0 && (
        <div className="result-list">
          {agency.errors.map((e, i) => (
            <div className="result-list-item row-clickable" key={i} onClick={() => navigate(`/p/${e.project_id}`)}>
              <div style={{ color: 'var(--ink)', fontWeight: 700, marginBottom: 4 }}>
                {projectName(e.project_id)} · {AGENT_META[e.agent_key as AgentKey]?.short || e.agent_key}
              </div>
              <div className="cell-sub">{e.last_action || 'Error sin detalle registrado'}</div>
            </div>
          ))}
        </div>
      )}

      <div className="section-head" style={{ marginTop: 36 }}>
        <span className="section-title">Gasto Claude por cliente</span>
        {overview && <span className="section-sub">{monthLabel(overview.period_month)}</span>}
      </div>
      {spendError && <div className="empty-state">No se pudo cargar el gasto de IA.</div>}
      {!spendError && (
        <>
          <div className="mini-dash">
            <Reveal delay={0}>
              <div className="mini-card c-pms">
                <div className="mini-card-icon">$</div>
                <div className="mini-card-label">Gasto Claude total</div>
                <div className="mini-card-value tabular">{overview ? money(overview.claude.cost_usd) : '…'}</div>
                <div className="mini-card-sub">{overview ? `${totalTokens.toLocaleString('es-CL')} tokens (in + out)` : 'Cargando…'}</div>
              </div>
            </Reveal>
            <Reveal delay={60}>
              <div className="mini-card c-pms">
                <div className="mini-card-icon">◆</div>
                <div className="mini-card-label">Cliente que más consume</div>
                <div className="mini-card-value" style={{ fontSize: 20 }}>
                  {overview ? (topClient ? projectName(topClient.project_id) : 'Sin datos aún') : '…'}
                </div>
                <div className="mini-card-sub">{topClient ? `${money(topClient.cost_usd)} este mes` : 'Ningún agente ha corrido este mes'}</div>
              </div>
            </Reveal>
          </div>

          {overview && overview.by_client.length === 0 ? (
            <div className="empty-state" style={{ marginTop: 18 }}>Ningún agente registró consumo de tokens este mes todavía.</div>
          ) : (
            <table style={{ marginTop: 18 }}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Costo</th>
                  <th>Tokens entrada</th>
                  <th>Tokens salida</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {(overview?.by_client || []).map((c) => {
                  const isOpen = expanded === c.project_id;
                  return (
                    <Fragment key={c.project_id}>
                      <tr className="row-clickable" onClick={() => setExpanded(isOpen ? null : c.project_id)}>
                        <td className="cell-name">{projectName(c.project_id)}</td>
                        <td className="tabular">{money(c.cost_usd)}</td>
                        <td className="tabular">{c.input_tokens.toLocaleString('es-CL')}</td>
                        <td className="tabular">{c.output_tokens.toLocaleString('es-CL')}</td>
                        <td className="cell-sub">{isOpen ? '▲' : '▼'}</td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={5} style={{ background: 'rgba(255,255,255,0.015)' }}>
                            <div className="result-list">
                              {c.agents.map((a) => {
                                const key = a.agent_key as AgentKey;
                                return (
                                  <div className="result-list-item" key={a.agent_key}>
                                    <div style={{ color: 'var(--ink)', fontWeight: 700, marginBottom: 4 }}>
                                      {DEFAULTS[key]?.name || a.agent_key} · {AGENT_META[key]?.short || ''}
                                    </div>
                                    <div className="cell-sub">
                                      {a.model} · {a.input_tokens.toLocaleString('es-CL')} in · {a.output_tokens.toLocaleString('es-CL')} out
                                      {a.thinking_tokens > 0 && ` (${a.thinking_tokens.toLocaleString('es-CL')} thinking)`}
                                      {' · '}
                                      <strong style={{ color: 'var(--ink)' }}>{money(a.cost_usd)}</strong>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}

          <div className="section-head" style={{ marginTop: 36 }}>
            <span className="section-title">Otros proveedores de IA</span>
          </div>
          <div className="result-list">
            {(overview?.other_providers || []).map((p) => (
              <div className="result-list-item" key={p.provider}>
                <div style={{ color: 'var(--ink)', fontWeight: 700, marginBottom: 4 }}>{p.provider}</div>
                <div className="cell-sub">{p.note}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="footnote">
        "Insights" hoy son estos mismos datos derivados (cliente que más gasta, conteo de errores) — no hay un motor
        de insights generado con IA todavía, eso sería un desarrollo aparte.
      </div>
    </div>
  );
}
