import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';

interface TrendPoint {
  fecha: string;
  valor: number;
}

// Grafico de linea SVG interactivo (sin libreria - mismo criterio ya usado
// en el sparkline de MetricRadarCard, pero generalizado y con interaccion
// real): la linea se "dibuja" al aparecer (stroke-dashoffset animado con
// GSAP), y al mover el mouse aparece una guia vertical + punto + tooltip
// con el valor real mas cercano. Con 1-2 puntos reales igual se ve honesto
// (un punto fijo, o una linea corta), nunca se inventa suavizado.
export default function TrendChart({
  points,
  color = 'var(--ok)',
  height = 100,
  formatValue = (v: number) => v.toLocaleString('es-CL'),
  formatDate,
}: {
  points: TrendPoint[];
  color?: string;
  height?: number;
  formatValue?: (v: number) => string;
  formatDate?: (fecha: string) => string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPolylineElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const guideRef = useRef<SVGLineElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const W = 100;
  const H = height;
  const PAD_Y = 6;

  const { coords, min, max } = useMemo(() => {
    if (!points.length) return { coords: [] as [number, number][], min: 0, max: 0 };
    const values = points.map((p) => p.valor);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const stepX = points.length > 1 ? W / (points.length - 1) : 0;
    const coords: [number, number][] = points.map((p, i) => {
      const x = points.length > 1 ? i * stepX : W / 2;
      const y = H - ((p.valor - min) / span) * (H - PAD_Y * 2) - PAD_Y;
      return [x, y];
    });
    return { coords, min, max };
  }, [points, H]);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || coords.length < 2) return;
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out' });
  }, [coords]);

  useEffect(() => {
    const dot = dotRef.current;
    const guide = guideRef.current;
    if (!dot || !guide) return;
    if (hoverIdx === null) {
      gsap.to(dot, { opacity: 0, duration: 0.15 });
      gsap.to(guide, { opacity: 0, duration: 0.15 });
      return;
    }
    const [x, y] = coords[hoverIdx];
    gsap.to(dot, { attr: { cx: x, cy: y }, opacity: 1, duration: 0.12, ease: 'power2.out' });
    gsap.to(guide, { attr: { x1: x, x2: x }, opacity: 1, duration: 0.12, ease: 'power2.out' });
  }, [hoverIdx, coords]);

  if (!points.length) {
    return <div className="trend-chart-empty">Sin datos todavía</div>;
  }

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || coords.length < 2) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    let closest = 0;
    let closestDist = Infinity;
    coords.forEach(([x], i) => {
      const d = Math.abs(x - relX);
      if (d < closestDist) {
        closestDist = d;
        closest = i;
      }
    });
    setHoverIdx(closest);
  };

  const polyPoints = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const hoverPoint = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="trend-chart">
      {coords.length > 1 && (
        <div className="trend-chart-yaxis">
          <span>{formatValue(max)}</span>
          <span>{formatValue(min)}</span>
        </div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="trend-chart-svg"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {coords.length === 1 ? (
          <circle cx={coords[0][0]} cy={coords[0][1]} r={2.2} fill={color} />
        ) : (
          <polyline ref={pathRef} points={polyPoints} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        )}
        <line ref={guideRef} x1={0} x2={0} y1={0} y2={H} stroke="var(--card2-border)" strokeWidth={1} opacity={0} vectorEffect="non-scaling-stroke" />
        <circle ref={dotRef} cx={0} cy={0} r={2.6} fill={color} opacity={0} />
      </svg>
      <div className="trend-chart-axis">
        <span>{formatDate ? formatDate(points[0].fecha) : points[0].fecha}</span>
        <span>{formatDate ? formatDate(points[points.length - 1].fecha) : points[points.length - 1].fecha}</span>
      </div>
      {hoverPoint && (
        <div className="trend-chart-tooltip">
          <strong>{formatValue(hoverPoint.valor)}</strong>
          <span>{formatDate ? formatDate(hoverPoint.fecha) : hoverPoint.fecha}</span>
        </div>
      )}
      {points.length < 4 && (
        <div className="trend-chart-sparse-note">Solo {points.length} punto{points.length === 1 ? '' : 's'} real{points.length === 1 ? '' : 'es'} — se completa con el tiempo</div>
      )}
    </div>
  );
}
