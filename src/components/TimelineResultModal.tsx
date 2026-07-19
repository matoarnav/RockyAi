function labelize(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

function ResultValue({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') {
    return <span className="post-popup-field-value">—</span>;
  }
  if (typeof value === 'string') {
    return <div className="post-popup-field-value">{value}</div>;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className="post-popup-field-value tabular">{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    if (!value.length) return <span className="post-popup-field-value">—</span>;
    if (value.every((v) => typeof v === 'string')) {
      return (
        <div className="post-popup-hashtags">
          {value.map((v, i) => (
            <span className="post-popup-hashtag" key={i}>
              {v}
            </span>
          ))}
        </div>
      );
    }
    return (
      <div className="result-list">
        {value.map((v, i) => (
          <div className="result-list-item" key={i}>
            <ResultValue value={v} />
          </div>
        ))}
      </div>
    );
  }
  if (typeof value === 'object') {
    return <ResultObject obj={value as Record<string, unknown>} nested />;
  }
  return null;
}

function ResultObject({ obj, nested = false }: { obj: Record<string, unknown>; nested?: boolean }) {
  const headline = typeof obj.headline === 'string' ? obj.headline : undefined;
  const metaBits = [obj.fecha, obj.canal, obj.formato].filter((v): v is string => typeof v === 'string' && !!v);
  const entries = Object.entries(obj).filter(([k]) => k !== 'headline' && !(headline && ['fecha', 'canal', 'formato'].includes(k) && metaBits.length));

  return (
    <div className={nested ? 'result-block-nested' : undefined}>
      {metaBits.length > 0 && <div className="post-popup-head">{metaBits.join(' · ')}</div>}
      {headline && <div className="post-popup-headline">{headline}</div>}
      {entries.map(([k, v]) => (
        <div className="post-popup-field" key={k}>
          <div className="post-popup-field-label">{labelize(k)}</div>
          <ResultValue value={v} />
        </div>
      ))}
    </div>
  );
}

export default function TimelineResultModal({ result, onClose }: { result: Record<string, unknown>; onClose: () => void }) {
  return (
    <div
      className="post-popup-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="post-popup-box">
        <button className="post-popup-close" onClick={onClose}>
          &times;
        </button>
        <div className="desc-label" style={{ marginBottom: 12 }}>
          Resultado de la invocación
        </div>
        <ResultObject obj={result} />
      </div>
    </div>
  );
}
