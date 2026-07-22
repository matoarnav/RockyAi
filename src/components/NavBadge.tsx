import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

gsap.registerPlugin(MorphSVGPlugin);

// Camino de la chispa (4 puntas) a la que muta el punto al pasar el mouse.
const SPARK_PATH = 'M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z';

// Badge reutilizable (.pms-nav-badge): fondo #2196F3, texto blanco, sin
// borde - siempre que se use esta clase, queda con esta identidad. Trae
// una microinteraccion real: el punto se crea como <circle> (una forma
// basica de SVG, no un path), y MorphSVGPlugin.convertToPath() lo
// convierte en <path> recien al montar - a partir de ahi puede mutar de
// forma entre el punto original y la chispa de 4 puntas al hacer hover.
export default function NavBadge({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const dot = dotRef.current;
    if (!wrap || !dot) return;

    const ctx = gsap.context(() => {
      const [path] = MorphSVGPlugin.convertToPath(dot) as SVGPathElement[];
      const dotD = path.getAttribute('d') || '';

      const onEnter = () => {
        gsap.to(path, { morphSVG: SPARK_PATH, duration: 0.35, ease: 'back.out(2.5)' });
      };
      const onLeave = () => {
        gsap.to(path, { morphSVG: dotD, duration: 0.3, ease: 'power2.inOut' });
      };

      wrap.addEventListener('mouseenter', onEnter);
      wrap.addEventListener('mouseleave', onLeave);
      return () => {
        wrap.removeEventListener('mouseenter', onEnter);
        wrap.removeEventListener('mouseleave', onLeave);
      };
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <span className="pms-nav-badge" ref={wrapRef}>
      <svg className="pms-nav-badge-spark" width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">
        <circle ref={dotRef} cx="5" cy="5" r="3" fill="currentColor" />
      </svg>
      {children}
    </span>
  );
}
