import { useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

interface DeltaInfo {
  pct: number | null;
  periodLabel: string;
}

interface HealthBadgeInfo {
  tone: 'ok' | 'warn' | 'error' | 'off';
  label: string;
}

interface SparklinePoint {
  fecha: string;
  valor: number;
}

interface SubGridItem {
  label: string;
  value: string | number;
}

// Sparkline SVG propio (sin libreria - los datos reales hoy son escasos,
// a veces 1-2 puntos, y no vale la pena una dependencia nueva para eso).
// Con 1 solo punto dibuja un punto fijo; con 0 no se renderiza (el padre
// omite la prop 'sparkline' en ese caso).
function Sparkline({ points, tone }: { points: SparklinePoint[]; tone: 'growth' | 'decline' | 'neutral' }) {
  const W = 76;
  const H = 26;
  const values = points.map((p) => p.valor);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const stepX = points.length > 1 ? W / (points.length - 1) : 0;
  const coords = points.map((p, i) => {
    const x = points.length > 1 ? i * stepX : W / 2;
    const y = H - ((p.valor - min) / span) * (H - 6) - 3;
    return [x, y] as const;
  });
  const color = tone === 'growth' ? 'var(--growth)' : tone === 'decline' ? 'var(--decline)' : 'var(--dim-2)';

  if (coords.length === 1) {
    return (
      <svg width={W} height={H} className="radar-sparkline" aria-hidden="true">
        <circle cx={coords[0][0]} cy={coords[0][1]} r={2.5} fill={color} />
      </svg>
    );
  }

  const path = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const [lastX, lastY] = coords[coords.length - 1];
  return (
    <svg width={W} height={H} className="radar-sparkline" aria-hidden="true">
      <polyline points={path} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
    </svg>
  );
}

// Tarjeta reusable del "Growth Radar": cubre las 4 familias de metrica del
// brief (social, email, SEO, agentes) mediante props opcionales en vez de 4
// componentes separados. Reusa el mismo patron GSAP de StatCard (hover lift
// + count-up), y agrega chip de delta, sparkline y badge de salud - todos
// opcionales, todos con estado neutro explicito cuando falta el dato real.
export default function MetricRadarCard({
  cls,
  icon,
  label,
  primaryValue,
  sub,
  delta,
  sparkline,
  healthBadge,
  subGrid,
  to,
  disabled = false,
}: {
  cls: string;
  icon: ReactNode;
  label: string;
  primaryValue: number | string | null;
  sub?: string;
  delta?: DeltaInfo;
  sparkline?: SparklinePoint[];
  healthBadge?: HealthBadgeInfo;
  subGrid?: SubGridItem[];
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
    if (!el || typeof primaryValue !== 'number' || countedFrom.current === primaryValue) return;
    countedFrom.current = primaryValue;
    const counter = { n: 0 };
    gsap.to(counter, {
      n: primaryValue,
      duration: 0.9,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = Math.round(counter.n).toLocaleString('es-CL');
      },
    });
  }, [primaryValue]);

  const displayValue = typeof primaryValue === 'number' ? '0' : (primaryValue ?? '—');

  const deltaTone: 'growth' | 'decline' | 'neutral' =
    delta && delta.pct !== null ? (delta.pct > 0 ? 'growth' : delta.pct < 0 ? 'decline' : 'neutral') : 'neutral';

  return (
    <div className={`mini-card radar-card ${cls}${disabled ? ' mini-card-disabled' : ''}`} ref={cardRef}>
      <div className="radar-card-top">
        <div className="mini-card-icon" ref={iconRef}>
          {icon}
        </div>
        {healthBadge && (
          <span className={`radar-health radar-health-${healthBadge.tone}`} title={healthBadge.label}>
            <span className="radar-health-dot" />
          </span>
        )}
      </div>
      <div className="mini-card-label">{label}</div>
      <div className="radar-card-value-row">
        <div className="mini-card-value tabular" ref={valueRef}>
          {displayValue}
        </div>
        {sparkline && sparkline.length > 0 && <Sparkline points={sparkline} tone={deltaTone} />}
      </div>
      {delta && (
        <div className={`radar-delta radar-delta-${deltaTone}`}>
          {delta.pct === null ? (
            <span className="radar-delta-neutral">Sin comparación todavía</span>
          ) : (
            <>
              <span className="radar-delta-arrow">{delta.pct > 0 ? '↑' : delta.pct < 0 ? '↓' : '→'}</span>
              <span className="radar-delta-value">{Math.abs(delta.pct)}%</span>
              <span className="radar-delta-period">{delta.periodLabel}</span>
            </>
          )}
        </div>
      )}
      {subGrid && subGrid.length > 0 && (
        <div className="radar-subgrid">
          {subGrid.map((item) => (
            <div className="radar-subgrid-item" key={item.label}>
              <span className="radar-subgrid-value">{item.value}</span>
              <span className="radar-subgrid-label">{item.label}</span>
            </div>
          ))}
        </div>
      )}
      <div className="mini-card-sub">{sub}</div>
      {to && (
        <button className="mini-card-cta" onClick={() => navigate(to)}>
          Ver más →
        </button>
      )}
    </div>
  );
}
