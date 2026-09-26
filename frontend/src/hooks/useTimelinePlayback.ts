import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 时间轴播放头：requestAnimationFrame 驱动，支持播放/暂停/停止/寻址。
 * 播放头位置通过 timeMs 暴露，页面据此即时混算灯具状态。
 */
export function useTimelinePlayback(durationMs: number) {
  const [timeMs, setTimeMs] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timeRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const seek = useCallback(
    (ms: number) => {
      const next = Math.min(Math.max(0, ms), Math.max(0, durationMs));
      timeRef.current = next;
      setTimeMs(next);
    },
    [durationMs]
  );

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      const next = timeRef.current + (now - last);
      last = now;
      if (next >= durationMs) {
        timeRef.current = durationMs;
        setTimeMs(durationMs);
        setPlaying(false);
        return;
      }
      timeRef.current = next;
      setTimeMs(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, durationMs]);

  // 轨道被拖短导致总时长收缩时，把播放头收回到范围内
  useEffect(() => {
    if (timeRef.current > durationMs) {
      timeRef.current = durationMs;
      setTimeMs(durationMs);
    }
  }, [durationMs]);

  const play = useCallback(() => {
    if (durationMs <= 0) return;
    if (timeRef.current >= durationMs) {
      timeRef.current = 0;
      setTimeMs(0);
    }
    setPlaying(true);
  }, [durationMs]);

  const pause = useCallback(() => setPlaying(false), []);

  const stop = useCallback(() => {
    setPlaying(false);
    timeRef.current = 0;
    setTimeMs(0);
  }, []);

  return { timeMs, playing, play, pause, stop, seek };
}
