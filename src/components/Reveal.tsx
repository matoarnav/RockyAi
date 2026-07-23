import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';

// Aparicion de componentes vía GSAP (antes era una transicion CSS pura) -
// mismo trigger por IntersectionObserver, mismo API externo (delay via ms),
// pero ahora es un tween real que respeta prefers-reduced-motion.
export default function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(el, { opacity: 0, y: 16 });

    if (typeof IntersectionObserver === 'undefined') {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: delay / 1000 });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', delay: delay / 1000 });
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={`reveal-item${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}
