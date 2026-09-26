import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 时间轴播放时钟：requestAnimationFrame 驱动播放头前进，
 * 播放到 durationMs 末尾自动暂停；seek 可在任意时刻落点。
 */
export function useTimelinePlayback(durationMs: number) {
  const [timeMs, setTimeMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const frameRef = useRef(0);
  const lastTickRef = useRef(0);

  const seek = useCallback(
    (nextMs: number) => {
      setTimeMs(Math.min(Math.max(0, nextMs), Math.max(0, durationMs)));
    },
    [durationMs]
  );

  const pause = useCallback(() => setPlaying(false), []);
  const play = useCallback(() => {
    setTimeMs((current) => (current >= durationMs ? 0 : current));
    setPlaying(true);
  }, [durationMs]);
  const toggle = useCallback(() => {
    setPlaying((current) => {
      if (!current) setTimeMs((now) => (now >= durationMs ? 0 : now));
      return !current;
    });
  }, [durationMs]);

  useEffect(() => {
    if (!playing) return;
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;
      setTimeMs((current) => {
        const next = current + delta;
        if (next >= durationMs) {
          setPlaying(false);
          return durationMs;
        }
        return next;
      });
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [playing, durationMs]);

  // 轨道被拖短后总时长收缩，播放头需要同步收回有效区间。
  useEffect(() => {
    setTimeMs((current) => Math.min(current, Math.max(0, durationMs)));
  }, [durationMs]);

  return { timeMs, playing, play, pause, toggle, seek };
}
