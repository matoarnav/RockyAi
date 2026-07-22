import { Fragment, useEffect, useState } from 'react';
import { usePanelData } from '../context/PanelDataContext';
import { callAction } from '../api';
import { AGENT_META, DEFAULTS } from '../constants';
import Reveal from '../components/Reveal';
import type { AgentKey, AiSpendOverview } from '../types';

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

export default function GastosAI() {
  const { projects } = usePanelData();
  const [overview, setOverview] = useState<AiSpendOverview | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    callAction<AiSpendOverview>('get_ai_spend_overview', { project_ids: projects.map((p) => p.id) })
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((e) => {
        console.error('Error cargando el gasto de IA', e);
        if (!cancelled) setLoadError(true);
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
      <div className="eyebrow">Panel</div>
      <div className="page-title">Gastos AI</div>
      <div className="page-sub">
        Cuánto ha consumido cada IA que usamos este mes, y qué cliente está generando más gasto. No está asociado a
        ningún proyecto — es una vista agencia-wide.
      </div>

      {loadError && <div className="empty-state">No se pudo cargar el gasto de IA. Revisá la sesión e intentá de nuevo.</div>}

      {!loadError && (
        <>
          <div className="mini-dash">
            <Reveal delay={0}>
              <div className="mini-card c-pms">
                <div className="mini-card-icon">$</div>
                <div className="mini-card-label">Gasto Claude · {overview ? monthLabel(overview.period_month) : '…'}</div>
                <div className="mini-card-value tabular">{overview ? money(overview.claude.cost_usd) : '…'}</div>
                <div className="mini-card-sub">
                  {overview ? `${totalTokens.toLocaleString('es-CL')} tokens (in + out)` : 'Cargando…'}
                </div>
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
            <Reveal delay={120}>
              <div className="mini-card c-pms">
                <div className="mini-card-icon">◈</div>
                <div className="mini-card-label">Tokens de razonamiento (thinking)</div>
                <div className="mini-card-value tabular">{overview ? overview.claude.thinking_tokens.toLocaleString('es-CL') : '…'}</div>
                <div className="mini-card-sub">Ya incluidos en el costo de output — no se cobran aparte</div>
              </div>
            </Reveal>
            <Reveal delay={180}>
              <div className="mini-card c-pms">
                <div className="mini-card-icon">◎</div>
                <div className="mini-card-label">Otros proveedores</div>
                <div className="mini-card-value" style={{ fontSize: 17 }}>
                  Sin costo trackeado
                </div>
                <div className="mini-card-sub">Gemini (tier gratuito) y ElevenLabs (sin uso) — ver detalle abajo</div>
              </div>
            </Reveal>
          </div>

          <div className="section-head" style={{ marginTop: 36 }}>
            <span className="section-title">Gasto por cliente — Anthropic (Claude)</span>
          </div>
          {overview && overview.by_client.length === 0 ? (
            <div className="empty-state">Ningún agente registró consumo de tokens este mes todavía.</div>
          ) : (
            <table>
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
    </div>
  );
}
