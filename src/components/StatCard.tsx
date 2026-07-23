import { useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

// Tarjeta de metrica reutilizable para las secciones del Resumen (Redes
// Sociales / Email Marketing / SEO). Dos microinteracciones GSAP reales:
// 1) el numero cuenta desde 0 hasta el valor real la primera vez que llega
//    (nunca en cada re-render, solo cuando el valor pasa de null/loading a
//    un numero real), 2) hover con lift sutil + el icono se agranda un poco.
export default function StatCard({
  cls,
  icon,
  label,
  value,
  sub,
  to,
  disabled = false,
}: {
  cls: string;
  icon: ReactNode;
  label: string;
  value: number | string | null;
  sub: string;
  to?: string;
  disabled?: boolean;
}) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const countedFrom = useRef<number | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    const iconEl = iconRef.current;
    if (!card || !iconEl) return;

    const ctx = gsap.context(() => {
      const onEnter = () => {
        gsap.to(card, { y: -4, duration: 0.25, ease: 'power2.out' });
        gsap.to(iconEl, { scale: 1.12, duration: 0.25, ease: 'back.out(2)' });
      };
      const onLeave = () => {
        gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.inOut' });
        gsap.to(iconEl, { scale: 1, duration: 0.3, ease: 'power2.inOut' });
      };
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
      return () => {
        card.removeEventListener('mouseenter', onEnter);
        card.removeEventListener('mouseleave', onLeave);
      };
    }, card);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = valueRef.current;
    if (!el || typeof value !== 'number' || countedFrom.current === value) return;
    countedFrom.current = value;
    const counter = { n: 0 };
    gsap.to(counter, {
      n: value,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = Math.round(counter.n).toLocaleString('es-CL');
      },
    });
  }, [value]);

  const displayValue = typeof value === 'number' ? '0' : (value ?? '—');

  return (
    <div className={`mini-card ${cls}${disabled ? ' mini-card-disabled' : ''}`} ref={cardRef}>
      <div className="mini-card-icon" ref={iconRef}>
        {icon}
      </div>
      <div className="mini-card-label">{label}</div>
      <div className="mini-card-value tabular" ref={valueRef}>
        {displayValue}
      </div>
      <div className="mini-card-sub">{sub}</div>
      {to && (
        <button className="mini-card-cta" onClick={() => navigate(to)}>
          Ver más →
        </button>
      )}
    </div>
  );
}
