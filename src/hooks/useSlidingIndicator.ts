import { useEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';

/**
 * Anima un elemento ".slide-indicator" (debe existir dentro del contenedor)
 * para que seleccione la posición/tamaño del elemento que matchea
 * activeSelector, en vez de depender solo de un borde o fondo estático por
 * CSS. Primera medición es instantánea (sin animación de entrada rara desde
 * la esquina); los cambios posteriores se deslizan.
 */
export function useSlidingIndicator(
  containerRef: RefObject<HTMLElement | null>,
  activeSelector: string,
  orientation: 'horizontal' | 'vertical',
  deps: unknown[]
) {
  const hasPositioned = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const indicator = container.querySelector<HTMLElement>('.slide-indicator');
    const active = container.querySelector<HTMLElement>(activeSelector);
    if (!indicator || !active) {
      if (indicator) gsap.set(indicator, { opacity: 0 });
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const props =
      orientation === 'horizontal'
        ? { x: active.offsetLeft, width: active.offsetWidth }
        : { y: active.offsetTop, height: active.offsetHeight };

    if (!hasPositioned.current || reduceMotion) {
      gsap.set(indicator, { ...props, opacity: 1 });
      hasPositioned.current = true;
    } else {
      gsap.to(indicator, { ...props, opacity: 1, duration: 0.45, ease: 'power3.out' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
