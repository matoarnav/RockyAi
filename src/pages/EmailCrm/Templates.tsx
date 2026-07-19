import { useState } from 'react';
import { useCrmData } from '../../context/CrmDataContext';
import { callAction, formatWhen } from '../../api';
import type { EmailTemplate } from '../../types';

export default function Templates() {
  const { templates, refetch } = useCrmData();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  function openForm(t?: EmailTemplate) {
    setEditingId(t ? t.template_id : '');
    setName(t ? t.name : '');
    setSubject(t ? t.subject : '');
    setBody(t ? t.html_body : '');
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      alert('Ingresa un nombre para el template.');
      return;
    }
    await callAction('save_email_template', {
      template_id: editingId || '',
      name: name.trim(),
      subject: subject.trim(),
      html_body: body,
    });
    setShowForm(false);
    await refetch();
  }

  async function handleDelete(templateId: string) {
    if (!confirm('¿Eliminar este template?')) return;
    await callAction('delete_email_template', { template_id: templateId });
    await refetch();
  }

  return (
    <div>
      <div className="crm-toolbar">
        <div className="desc-label">
          {templates.length} template{templates.length === 1 ? '' : 's'}
        </div>
      </div>

      <div className="tpl-grid">
        {templates.map((t) => (
          <div className="card tpl-card" key={t.template_id}>
            <div className="tpl-body">
              <div className="tpl-name">{t.name}</div>
              <div className="tpl-meta">{t.updated_at ? formatWhen(t.updated_at) : ''}</div>
              <div className="tpl-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => openForm(t)}>
                  Editar
                </button>
                <span
                  className="icon-btn danger"
                  style={{ marginLeft: 'auto' }}
                  title="Eliminar"
                  onClick={() => handleDelete(t.template_id)}
                >
                  🗑
                </span>
              </div>
            </div>
          </div>
        ))}
        <div className="tpl-new-card" onClick={() => openForm()}>
          <div style={{ fontSize: 22 }}>+</div>
          <div style={{ fontSize: '11.5px' }}>Nuevo template</div>
        </div>
      </div>

      {showForm && (
        <div className="card form-section" style={{ marginTop: 16 }}>
          <div className="form-section-title">{editingId ? 'Editar template' : 'Nuevo template'}</div>
          <div className="crm-field">
            <label>Nombre</label>
            <input placeholder="Ej. Newsletter mensual" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="crm-field">
            <label>Asunto por defecto</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="crm-field">
            <label>Cuerpo (HTML)</label>
            <textarea placeholder="<h1>Hola {{name}}</h1>..." value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="send-actions">
            <button className="btn btn-primary btn-sm" onClick={handleSave}>
              Guardar template
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
