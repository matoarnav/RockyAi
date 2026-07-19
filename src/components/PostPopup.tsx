import type { ContentPiece } from '../types';

export default function PostPopup({ piece, onClose }: { piece: ContentPiece; onClose: () => void }) {
  return (
    <div
      className="post-popup-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="post-popup-box">
        <button className="post-popup-close" onClick={onClose}>
          &times;
        </button>
        <div className="post-popup-head">
          {piece.fecha} · {piece.canal} · {piece.formato}
        </div>
        <div className="post-popup-headline">{piece.headline}</div>
        <div className="post-popup-field">
          <div className="post-popup-field-label">Copy</div>
          <div className="post-popup-field-value">{piece.copy}</div>
        </div>
        <div className="post-popup-field">
          <div className="post-popup-field-label">Hashtags</div>
          <div className="post-popup-hashtags">
            {(piece.hashtags || []).map((h) => (
              <span className="post-popup-hashtag" key={h}>
                {h.startsWith('#') ? h : `#${h}`}
              </span>
            ))}
          </div>
        </div>
        <div className="post-popup-field">
          <div className="post-popup-field-label">Objetivo estratégico</div>
          <div className="post-popup-field-value">{piece.objetivo_estrategico || '—'}</div>
        </div>
        <div className="post-popup-field">
          <div className="post-popup-field-label">Nota visual para Art Director</div>
          <div className="post-popup-field-value">{piece.nota_visual_para_art_director || '—'}</div>
        </div>
        <div className="post-popup-field">
          <div className="post-popup-field-label">Notas de producción</div>
          <div className="post-popup-field-value">{piece.notas_produccion || '—'}</div>
        </div>
      </div>
    </div>
  );
}
