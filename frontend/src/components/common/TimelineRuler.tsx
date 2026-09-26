import { useRef } from "react";
import { formatMs } from "../../utils/formatters";

interface TimelineRulerProps {
  durationMs: number;
  timeMs: number;
  pxPerMs: number;
  /** 点击或拖动标尺时回调目标时刻 */
  onSeek: (ms: number) => void;
}

export function TimelineRuler({ durationMs, timeMs, pxPerMs, onSeek }: TimelineRulerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scrubbing = useRef(false);
  const width = Math.max(1, Math.round(durationMs * pxPerMs));

  const seekFromClientX = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    onSeek((clientX - rect.left) / pxPerMs);
  };

  const seconds: number[] = [];
  for (let s = 0; s <= Math.floor(durationMs / 1000); s += 1) seconds.push(s);

  return (
    <div
      ref={ref}
      className="ruler"
      style={{ width }}
      onPointerDown={(e) => {
        scrubbing.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        seekFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (scrubbing.current) seekFromClientX(e.clientX);
      }}
      onPointerUp={() => {
        scrubbing.current = false;
      }}
      onPointerCancel={() => {
        scrubbing.current = false;
      }}
    >
      {seconds.map((s) => (
        <div key={s} className={s % 5 === 0 ? "tick major" : "tick"} style={{ left: s * 1000 * pxPerMs }}>
          {s % 5 === 0 && <span className="tick-label">{formatMs(s * 1000)}</span>}
        </div>
      ))}
      <div className="ruler-playhead" style={{ left: timeMs * pxPerMs }} />
    </div>
  );
}
