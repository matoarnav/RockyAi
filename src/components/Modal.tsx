import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';

export default function Modal({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const box = boxRef.current;
    if (!overlay || !box) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power1.out' });
      gsap.fromTo(box, { opacity: 0, scale: 0.94, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.32, ease: 'back.out(1.6)' });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      className="post-popup-overlay"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="post-popup-box modal-box" ref={boxRef}>
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
