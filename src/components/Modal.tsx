import type { ReactNode } from 'react';

export default function Modal({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      className="post-popup-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="post-popup-box modal-box">
        <button className="post-popup-close" onClick={onClose}>
          &times;
        </button>
        <div className="post-popup-headline">{title}</div>
        {sub && <div className="modal-sub">{sub}</div>}
        {children}
      </div>
    </div>
  );
}
