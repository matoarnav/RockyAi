import { useEffect } from 'react';
import gsap from 'gsap';

// Selector único para todo botón/chip clickeable del panel — un solo lugar
// para agregar la física de "press" en vez de repetirla componente por
// componente. Si se agrega un botón nuevo con una de estas clases, ya
// hereda la interacción sin código extra.
const PRESSABLE_SELECTOR = [
  '.btn',
  '.config-chip',
  '.tool-chip',
  '.agent-chip',
  '.mini-card-cta',
  '.enter-agent-btn',
  '.welcome-project-btn',
  '.icon-btn',
  '.range-pill',
  '.manual-invoke-btn',
  '.login-btn',
  '.proj-item',
  '.add-project',
].join(', ');

/**
 * Física de "press" global para todo botón/chip del panel: se hunde
 * levemente al presionar y rebota con un ease elástico al soltar. Montado
 * una sola vez (en Layout) y delegado por evento — así cualquier botón
 * nuevo con una de las clases de PRESSABLE_SELECTOR la hereda gratis, sin
 * tener que envolver cada componente individualmente.
 */
export function useButtonPhysics() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function findTarget(e: Event): HTMLElement | null {
      const el = (e.target as HTMLElement)?.closest?.(PRESSABLE_SELECTOR);
      return el instanceof HTMLElement ? el : null;
    }

    // GSAP escribe transform inline, lo que pisa cualquier transform que
    // venga de CSS (:hover{transform:translateY(-1px)}, etc.) mientras esa
    // inline style siga puesta. clearProps la saca al terminar el rebote,
    // para que el hover de CSS siga funcionando normal entre un press y otro.
    function release(el: HTMLElement, ease: string, duration: number) {
      gsap.to(el, {
        scale: 1,
        duration,
        ease,
        overwrite: true,
        onComplete: () => gsap.set(el, { clearProps: 'transform' }),
      });
    }

    function onDown(e: PointerEvent) {
      const el = findTarget(e);
      if (!el) return;
      gsap.to(el, { scale: 0.94, duration: 0.12, ease: 'power2.out', overwrite: true });
    }

    function onUp(e: PointerEvent) {
      const el = findTarget(e);
      if (!el) return;
      release(el, 'elastic.out(1, 0.5)', 0.5);
    }

    function onLeaveWhilePressed(e: PointerEvent) {
      const el = (e.target as HTMLElement)?.closest?.(PRESSABLE_SELECTOR);
      if (el instanceof HTMLElement) release(el, 'power2.out', 0.4);
    }

    document.addEventListener('pointerdown', onDown);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onLeaveWhilePressed);

    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onLeaveWhilePressed);
    };
  }, []);
}
