import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrmData } from '../../context/CrmDataContext';
import { callAction } from '../../api';
import { segmentFromKey } from './crmUtils';

export default function NuevaCampana() {
  const { templates, contacts, refetch } = useCrmData();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [body, setBody] = useState('');
  const [audienceKey, setAudienceKey] = useState('all');
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('var(--dim)');
  const [busy, setBusy] = useState<'now' | 'draft' | null>(null);

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

  async function submit(sendAction: 'now' | 'draft') {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      setMsgColor('var(--err)');
      setMsg('Falta nombre, asunto o contenido.');
      return;
    }
    setBusy(sendAction);
    setMsgColor('var(--moss)');
    setMsg(sendAction === 'now' ? 'Enviando...' : 'Guardando...');
    try {
      await callAction('create_email_campaign', {
        name,
        subject,
        html_body: body,
        template_id: templateId,
        segment: segmentFromKey(audienceKey),
        send_action: sendAction,
      });
      setMsg(sendAction === 'now' ? 'Campaña disparada — el estado se actualizará en unos minutos.' : 'Borrador guardado.');
      setName('');
      setSubject('');
      setBody('');
      setTemplateId('');
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

      <div className="card form-section">
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
        <div className="crm-field">
          <label>Cuerpo del correo (HTML)</label>
          <textarea placeholder="<h1>Hola {{name}}</h1>..." value={body} onChange={(e) => setBody(e.target.value)} />
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
