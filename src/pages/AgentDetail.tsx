import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePanelData } from '../context/PanelDataContext';
import { AGENT_META, AGENT_FUNCTION_KEYS, DEFAULTS, statusMeta } from '../constants';
import { formatWhen, UnauthorizedError } from '../api';
import { useAuth } from '../context/AuthContext';
import ContentCalendar from '../components/ContentCalendar';
import TimelineResultModal from '../components/TimelineResultModal';
import type { AgentKey, TimelineEntry } from '../types';

function formatTokens(status: { tokens_input_total?: number; tokens_output_total?: number; tokens_thinking_total?: number } | undefined): string {
  const total = (status?.tokens_input_total || 0) + (status?.tokens_output_total || 0) + (status?.tokens_thinking_total || 0);
  return total.toLocaleString('es-CL');
}

export default function AgentDetail() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const { agentConfigs, agentStatus, contentGrid, scopedAction } = usePanelData();
  const { handleUnauthorized } = useAuth();
  const [manualInput, setManualInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [openResult, setOpenResult] = useState<Record<string, unknown> | null>(null);

  function openTimelineResult(entry: TimelineEntry) {
    if (!entry.result) return;
    try {
      const parsed = JSON.parse(entry.result);
      if (parsed && typeof parsed === 'object') setOpenResult(parsed as Record<string, unknown>);
    } catch {
      setOpenResult({ contenido: entry.result });
    }
  }

  const agentKey = key as AgentKey;
  if (!AGENT_FUNCTION_KEYS.includes(agentKey)) {
    navigate('/agentes', { replace: true });
    return null;
  }

  const meta = AGENT_META[agentKey];
  const config = agentConfigs[agentKey] || DEFAULTS[agentKey];
  const status = agentStatus[agentKey] || {
    status: 'NUNCA_EJECUTADO',
    last_action: '',
    execution_count: 0,
    updated_at: '',
    timeline: [],
  };
  const sMeta = statusMeta(status.status);

  async function triggerManualInvoke() {
    setBusy(true);
    setMsg('');
    try {
      await scopedAction('invoke_agent', { agent_key: agentKey, params: manualInput });
      setMsg('Invocación disparada — el estado se actualizará en unos minutos.');
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        handleUnauthorized();
        return;
      }
      setMsg('No se pudo disparar la invocación.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="main">
      <button className="back-link" onClick={() => navigate('/')}>
        &larr; Volver al panel
      </button>
      <div className="agent-page-head">
        <div className={`avatar ${meta.cls}`} style={{ width: 74, height: 74, fontSize: 21 }}>
          <div className="avatar-ring" />
          {meta.initials}
        </div>
        <div>
          <div className="agent-page-title">{config.name}</div>
          <div className="agent-page-role">{meta.role}</div>
        </div>
      </div>

      <div className="agent-page-body">
        <div className="status">
          <span className={`status-dot ${sMeta.cls}`} />
          {sMeta.label}
        </div>
        <div className="agent-page-desc">{config.desc}</div>

        <div className="metrics-row">
          <div className="metric">
            <div className="metric-label">Ejecuciones</div>
            <div className="metric-value tabular">{status.execution_count || 0}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Tokens este mes</div>
            <div className="metric-value tabular">{formatTokens(status)}</div>
          </div>
          <div className="metric">
            <div className="metric-label">Última actualización</div>
            <div className="metric-value" style={{ fontSize: 12, fontWeight: 500, color: 'var(--dim)' }}>
              {status.updated_at ? formatWhen(status.updated_at) : 'Nunca'}
            </div>
          </div>
        </div>

        <div>
          <div className="desc-label">Timeline de acciones</div>
          <div className="timeline">
            {status.timeline && status.timeline.length ? (
              status.timeline
                .slice()
                .reverse()
                .map((entry, i) => {
                  const tMeta = statusMeta(entry.status);
                  const clickable = !!entry.result;
                  return (
                    <div
                      className={`timeline-item${clickable ? ' clickable' : ''}`}
                      key={i}
                      onClick={clickable ? () => openTimelineResult(entry) : undefined}
                    >
                      <span className={`status-dot ${tMeta.cls}`} style={{ marginTop: 4 }} />
                      <div style={{ flex: 1 }}>
                        <div className="timeline-when">{formatWhen(entry.at)}</div>
                        <div className="timeline-text">{entry.action || tMeta.label}</div>
                      </div>
                      {clickable && <span className="timeline-view-hint">Ver detalle →</span>}
                    </div>
                  );
                })
            ) : (
              <div className="timeline-empty">Sin acciones registradas todavía.</div>
            )}
          </div>
        </div>

        {agentKey === 'strategist' ? <ContentCalendar grid={contentGrid} /> : null}

        <div className="manual-invoke">
          <div className="desc-label">Invocación manual</div>
          <textarea
            placeholder="Instrucción opcional para esta ejecución puntual..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
          />
          <button className="manual-invoke-btn" onClick={triggerManualInvoke} disabled={busy}>
            {busy ? 'Disparando...' : 'Ejecutar invocación manual'}
          </button>
          <div className="manual-invoke-msg">{msg}</div>
        </div>
      </div>

      {openResult && <TimelineResultModal result={openResult} onClose={() => setOpenResult(null)} />}
    </div>
  );
}
