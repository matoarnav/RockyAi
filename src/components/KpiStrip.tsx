import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Kpi {
  label: string;
  value: number | string | null;
  sub?: string;
}

function KpiCell({ kpi }: { kpi: Kpi }) {
  const valueRef = useRef<HTMLDivElement>(null);
  const countedFrom = useRef<number | null>(null);

  useEffect(() => {
    const el = valueRef.current;
    if (!el || typeof kpi.value !== 'number' || countedFrom.current === kpi.value) return;
    countedFrom.current = kpi.value;
    const isNegative = kpi.value < 0;
    const counter = { n: 0 };
    gsap.to(counter, {
      n: kpi.value,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        const n = Math.round(counter.n);
        el.textContent = (isNegative ? '' : n > 0 ? '+' : '') + n.toLocaleString('es-CL');
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kpi.value]);

  const display = typeof kpi.value === 'number' ? '0' : (kpi.value ?? '—');

  return (
    <div className="kpi-cell">
      <div className="kpi-cell-label">{kpi.label}</div>
      <div className="kpi-cell-value tabular" ref={valueRef}>
        {display}
      </div>
      {kpi.sub && <div className="kpi-cell-sub">{kpi.sub}</div>}
    </div>
  );
}

export default function KpiStrip({ items }: { items: Kpi[] }) {
  return (
    <div className="kpi-strip">
      {items.map((k) => (
        <KpiCell kpi={k} key={k.label} />
      ))}
    </div>
  );
}
