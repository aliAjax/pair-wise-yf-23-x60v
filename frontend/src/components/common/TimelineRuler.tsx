import { useCallback, useRef } from "react";
import { formatMs } from "../../utils/formatters";

interface TimelineRulerProps {
  durationMs: number;
  pxPerMs: number;
  timeMs: number;
  onSeek: (ms: number) => void;
}

const TICK_STEP_MS = 1000;
const LABEL_STEP_MS = 5000;

/** 时间轴刻度尺：渲染秒级刻度，按下并拖动可移动播放头。 */
export function TimelineRuler({ durationMs, pxPerMs, timeMs, onSeek }: TimelineRulerProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const scrubbingRef = useRef(false);

  const seekFromPointer = useCallback(
    (clientX: number) => {
      const box = bodyRef.current?.getBoundingClientRect();
      if (!box) return;
      onSeek((clientX - box.left) / pxPerMs);
    },
    [onSeek, pxPerMs]
  );

  const ticks: number[] = [];
  for (let t = 0; t <= durationMs; t += TICK_STEP_MS) ticks.push(t);

  return (
    <div
      ref={bodyRef}
      className="timeline-ruler"
      style={{ width: durationMs * pxPerMs }}
      onPointerDown={(event) => {
        scrubbingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        seekFromPointer(event.clientX);
      }}
      onPointerMove={(event) => {
        if (scrubbingRef.current) seekFromPointer(event.clientX);
      }}
      onPointerUp={() => {
        scrubbingRef.current = false;
      }}
    >
      {ticks.map((tick) => (
        <span
          key={tick}
          className={tick % LABEL_STEP_MS === 0 ? "tick major" : "tick"}
          style={{ left: tick * pxPerMs }}
        >
          {tick % LABEL_STEP_MS === 0 && <em>{formatMs(tick)}</em>}
        </span>
      ))}
      <span className="ruler-playhead" style={{ left: timeMs * pxPerMs }} />
    </div>
  );
}
