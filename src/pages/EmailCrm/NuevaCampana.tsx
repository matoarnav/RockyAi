import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCrmData } from '../../context/CrmDataContext';
import { segmentFromKey } from './crmUtils';

export default function NuevaCampana() {
  const { templates, contacts, campaigns, refetch, scopedAction } = useCrmData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingCampaignId = searchParams.get('campaign_id') || '';
  const editingCampaign = editingCampaignId ? campaigns.find((c) => c.campaign_id === editingCampaignId) : undefined;

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [body, setBody] = useState('');
  const [audienceKey, setAudienceKey] = useState('all');
  const [scheduledAt, setScheduledAt] = useState('');
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('var(--dim)');
  const [busy, setBusy] = useState<'now' | 'draft' | 'schedule' | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testBusy, setTestBusy] = useState(false);
  const [testMsg, setTestMsg] = useState('');
  const [testMsgColor, setTestMsgColor] = useState('var(--dim)');

  useEffect(() => {
    if (!editingCampaign) return;
    setName(editingCampaign.name || '');
    setSubject(editingCampaign.subject || '');
    setTemplateId(editingCampaign.template_id || '');
    setBody(editingCampaign.html_body || '');
    setAudienceKey(editingCampaign.segment?.type === 'tag' && editingCampaign.segment.value ? `tag:${editingCampaign.segment.value}` : 'all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingCampaignId]);

  const subscribed = contacts.filter((c) => c.status === 'subscribed');
  const tags = Array.from(new Set(contacts.flatMap((c) => c.tags || []))).sort();
  const audienceOptions = [
    { key: 'all', label: 'Todos los suscritos', count: subscribed.length },
    ...tags.map((tag) => ({ key: `tag:${tag}`, label: tag, count: subscribed.filter((c) => (c.tags || []).includes(tag)).length })),
  ];

  function handleTemplatePick(id: string) {
    setTemplateId(id);
    const t = templates.find((x) => x.template_id === id);
    if (t) {
      setSubject(t.subject || '');
      setBody(t.html_body || '');
    }
  }

  async function sendTest() {
    if (!subject.trim() || !body.trim()) {
      setTestMsgColor('var(--err)');
      setTestMsg('Falta asunto o contenido.');
      return;
    }
    if (!testEmail.trim()) {
      setTestMsgColor('var(--err)');
      setTestMsg('Escribe a qué correo mandar la prueba.');
      return;
    }
    setTestBusy(true);
    setTestMsgColor('var(--moss)');
    setTestMsg('Enviando prueba...');
    try {
      await scopedAction('send_test_email', { subject, html_body: body, test_email: testEmail.trim() });
      setTestMsgColor('var(--moss)');
      setTestMsg(`Prueba enviada a ${testEmail.trim()}.`);
    } catch (e) {
      setTestMsgColor('var(--err)');
      setTestMsg('Error: ' + (e instanceof Error ? e.message : 'desconocido'));
    } finally {
      setTestBusy(false);
    }
  }

  async function submit(sendAction: 'now' | 'draft' | 'schedule') {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setMsgColor('var(--err)');
      setMsg('Falta nombre, asunto o contenido.');
      return;
    }
    if (sendAction === 'schedule' && !scheduledAt) {
      setMsgColor('var(--err)');
      setMsg('Elige fecha y hora de envío.');
      return;
    }
    setBusy(sendAction);
    setMsgColor('var(--moss)');
    setMsg(sendAction === 'now' ? 'Enviando...' : sendAction === 'schedule' ? 'Programando...' : 'Guardando...');
    try {
      const result = await scopedAction<{ campaign_id: string }>('create_email_campaign', {
        campaign_id: editingCampaignId || undefined,
        name,
        subject,
        html_body: body,
        template_id: templateId,
        segment: segmentFromKey(audienceKey),
        send_action: sendAction === 'schedule' ? 'draft' : sendAction,
      });
      if (sendAction === 'schedule') {
        await scopedAction('schedule_email_campaign', {
          campaign_id: result.campaign_id,
          scheduled_at: new Date(scheduledAt).toISOString(),
        });
      }
      setMsg(
        sendAction === 'now'
          ? 'Campaña disparada — el estado se actualizará en unos minutos.'
          : sendAction === 'schedule'
            ? 'Campaña programada.'
            : 'Borrador guardado.'
      );
      setName('');
      setSubject('');
      setBody('');
      setTemplateId('');
      setScheduledAt('');
      await refetch();
      navigate('../campanas');
    } catch (e) {
      setMsgColor('var(--err)');
      setMsg('Error: ' + (e instanceof Error ? e.message : 'desconocido'));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      {editingCampaignId && (
        <div className="desc-label" style={{ marginBottom: 14, color: 'var(--accent)' }}>
          Retomando borrador — los cambios se guardan sobre la misma campaña
        </div>
      )}

      <div className="card form-section">
        <div className="form-section-title">1 · Información de la campaña</div>
        <div className="form-section-sub">Nombre interno para identificarla en el histórico — los destinatarios no lo ven.</div>
        <div className="crm-field">
          <label>Nombre interno</label>
          <input placeholder="Ej. Últimos cupos — agosto" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="crm-field">
          <label>Asunto del correo</label>
          <input
            placeholder="Lo que ve el destinatario en su bandeja de entrada"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      </div>

      <div className="card form-section form-section-wide">
        <div className="form-section-title">2 · Contenido</div>
        <div className="form-section-sub">
          Elige un template como base (opcional) y ajusta el cuerpo del correo. Variables disponibles: <code>{'{{name}}'}</code>,{' '}
          <code>{'{{unsubscribe_link}}'}</code>.
        </div>
        <div className="crm-field">
          <label>Template base</label>
          <select value={templateId} onChange={(e) => handleTemplatePick(e.target.value)}>
            <option value="">Empezar en blanco</option>
            {templates.map((t) => (
              <option key={t.template_id} value={t.template_id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div className="crm-preview-wrap">
          <div className="crm-field">
            <label>Cuerpo del correo (HTML)</label>
            <textarea placeholder="<h1>Hola {{name}}</h1>..." value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="crm-field">
            <label>Preview en vivo</label>
            <div className="crm-preview-frame-wrap">
              {body.trim() ? (
                <iframe title="Preview del correo" srcDoc={body} className="crm-preview-frame" sandbox="" />
              ) : (
                <div className="empty-state">El preview aparece acá a medida que escribes el HTML.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card form-section">
        <div className="form-section-title">3 · Audiencia</div>
        <div className="form-section-sub">¿A quién le llega esta campaña? Nunca incluye contactos no-suscritos o rebotados, sin importar el segmento.</div>
        {audienceOptions.map((o) => (
          <div
            key={o.key}
            className={`crm-pick-row${o.key === audienceKey ? ' selected' : ''}`}
            onClick={() => setAudienceKey(o.key)}
          >
            <span>{o.label}</span>
            <span className="crm-pick-count tabular">{o.count} contactos</span>
          </div>
        ))}
      </div>

      <div className="card form-section">
        <div className="form-section-title">4 · Enviar</div>
        <div className="form-section-sub">Revisa antes de confirmar — no se puede deshacer un envío ya realizado.</div>

        <div className="crm-schedule-row">
          <input
            type="email"
            placeholder="tu-correo@ejemplo.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
          <button className="btn btn-ghost" onClick={sendTest} disabled={testBusy}>
            {testBusy ? 'Enviando...' : 'Enviar prueba'}
          </button>
        </div>
        {testMsg && (
          <div className="manual-invoke-msg" style={{ color: testMsgColor, marginBottom: 14 }}>
            {testMsg}
          </div>
        )}

        <div className="crm-schedule-row">
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
          <button className="btn btn-ghost" onClick={() => submit('schedule')} disabled={busy !== null || !scheduledAt}>
            {busy === 'schedule' ? 'Programando...' : 'Programar envío'}
          </button>
        </div>
        <div className="send-actions">
          <button className="btn btn-primary" onClick={() => submit('now')} disabled={busy !== null}>
            {busy === 'now' ? 'Enviando...' : 'Enviar ahora'}
          </button>
          <button className="btn btn-ghost" onClick={() => submit('draft')} disabled={busy !== null}>
            {busy === 'draft' ? 'Guardando...' : 'Guardar borrador'}
          </button>
        </div>
        <div className="manual-invoke-msg" style={{ color: msgColor }}>
          {msg}
        </div>
      </div>
    </div>
  );
}
