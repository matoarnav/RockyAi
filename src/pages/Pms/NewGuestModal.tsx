import { useState, type FormEvent } from 'react';
import Modal from '../../components/Modal';
import { usePmsData } from '../../context/PmsDataContext';

export default function NewGuestModal({ onClose }: { onClose: () => void }) {
  const { createGuest } = usePmsData();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [vipTags, setVipTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = fullName.trim() && (email.trim() || whatsapp.trim());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    setError('');
    try {
      await createGuest({
        FullName: fullName.trim(),
        Contact: { ...(email.trim() && { Email: email.trim() }), ...(whatsapp.trim() && { WhatsApp: whatsapp.trim() }) },
        OriginCountry: originCountry.trim() || undefined,
        VIP_Tags: vipTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el huésped');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Nuevo huésped" sub="Se guarda en el perfil del huésped y queda disponible para asociar a reservas." onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="crm-field">
          <label>Nombre completo</label>
          <input autoFocus value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ej. Roberto Fernández" />
        </div>
        <div className="modal-row-2">
          <div className="crm-field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="roberto@ejemplo.com" />
          </div>
          <div className="crm-field">
            <label>WhatsApp</label>
            <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+56 9 1234 5678" />
          </div>
        </div>
        <div className="modal-row-2">
          <div className="crm-field">
            <label>País de origen</label>
            <input value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} placeholder="Chile" />
          </div>
          <div className="crm-field">
            <label>Etiquetas VIP</label>
            <input value={vipTags} onChange={(e) => setVipTags(e.target.value)} placeholder="repeat-guest, honeymoon" />
          </div>
        </div>
        {!canSubmit && (fullName || email || whatsapp) && (
          <div className="modal-hint">Necesita nombre completo y al menos un contacto (email o WhatsApp).</div>
        )}
        {error && <div className="login-error" style={{ minHeight: 'auto' }}>{error}</div>}
        <div className="send-actions" style={{ marginTop: 18 }}>
          <button type="submit" className="btn btn-primary" disabled={!canSubmit || saving}>
            {saving ? 'Guardando…' : 'Crear huésped'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
}
