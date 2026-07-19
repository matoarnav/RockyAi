import { useState, type ReactElement } from 'react';
import { DOW_LABELS } from '../constants';
import type { ContentGrid, ContentPiece } from '../types';
import PostPopup from './PostPopup';

export default function ContentCalendar({ grid }: { grid: ContentGrid | null }) {
  const [openPiece, setOpenPiece] = useState<ContentPiece | null>(null);

  if (!grid || !grid.calendario_semanal || !grid.calendario_semanal.length) {
    return (
      <div className="calendar-section">
        <div className="desc-label">Calendario de contenido</div>
        <div className="calendar-empty-msg">Todavía no hay un calendario generado.</div>
      </div>
    );
  }

  const piecesByDate: Record<string, ContentPiece> = {};
  grid.calendario_semanal.forEach((week) => {
    (week.piezas || []).forEach((piece) => {
      if (piece.fecha) piecesByDate[piece.fecha] = piece;
    });
  });

  const [year, month] = (grid.mes || '').split('-').map(Number);
  const cells: ReactElement[] = [];

  if (year && month) {
    const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    let startOffset = firstOfMonth.getUTCDay() - 1;
    if (startOffset < 0) startOffset = 6;

    for (let i = 0; i < startOffset; i++) {
      cells.push(<div className="calendar-cell empty" key={`empty-${i}`} />);
    }
    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const piece = piecesByDate[dateStr];
      if (piece) {
        cells.push(
          <div className="calendar-cell has-piece" key={dateStr} onClick={() => setOpenPiece(piece)}>
            <div className="calendar-daynum">{day}</div>
            <div className="calendar-tag">{piece.canal}</div>
            {piece.contraste_competitivo_implicito ? <div className="calendar-tag contrast">Contraste</div> : null}
          </div>
        );
      } else {
        cells.push(
          <div className="calendar-cell" key={dateStr}>
            <div className="calendar-daynum">{day}</div>
          </div>
        );
      }
    }
  }

  const pilares = (grid.pilares_narrativos || []).join(' · ');

  return (
    <div className="calendar-section">
      <div className="desc-label">Calendario de contenido — {grid.mes}</div>
      <div className="week-summary-text" style={{ marginTop: 4 }}>
        {pilares}
      </div>
      <div className="calendar-grid">
        {DOW_LABELS.map((d) => (
          <div className="calendar-dow" key={d}>
            {d}
          </div>
        ))}
        {cells}
      </div>
      {openPiece ? <PostPopup piece={openPiece} onClose={() => setOpenPiece(null)} /> : null}
    </div>
  );
}
