import { useEffect, useMemo, useRef, useState } from "react";
import { CueCard } from "../components/common/CueCard";
import { EmptyState } from "../components/common/EmptyState";
import { StageCanvas } from "../components/common/StageCanvas";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import type { TimelineTrack } from "../types/TimelineTrack";
import { formatMs } from "../utils/formatters";
import {
  collectLiveCues,
  fixtureGlowColor,
  isTrackLocked,
  resolveFixtureStatesAt,
  toNum
} from "../utils/timelineResolver";

const SNAP_MS = 100;
const ZOOM_LEVELS = [10, 20, 40, 80]; // 每秒对应的像素宽度

interface DragPreview {
  trackId: number;
  startMs: number;
}

export function TimelinePage() {
  const { rows: tracks, loading, load: loadTracks, moveTrack, toggleLocked } = useTimelineTrackStore();
  const { rows: scenes, load: loadScenes } = useCueSceneStore();
  const { rows: fixtures, load: loadFixtures } = useFixtureStore();

  useEffect(() => {
    void loadTracks();
    void loadScenes();
    void loadFixtures();
  }, [loadTracks, loadScenes, loadFixtures]);

  const [zoomIndex, setZoomIndex] = useState(1);
  const pxPerMs = ZOOM_LEVELS[zoomIndex] / 1000;

  const [drag, setDrag] = useState<DragPreview | null>(null);
  const dragRef = useRef<{ trackId: number; originX: number; originStartMs: number } | null>(null);

  // 总时长：覆盖所有轨道末尾，并留出 5 秒余量方便把 Cue 拖到队尾。
  const durationMs = useMemo(() => {
    const maxEnd = tracks.reduce((end, track) => Math.max(end, toNum(track.start_ms) + toNum(track.duration_ms)), 0);
    return Math.max(60000, maxEnd + 5000);
  }, [tracks]);

  const { timeMs, playing, toggle, seek } = useTimelinePlayback(durationMs);

  // 拖动过程中先用本地预览位置参与计算，松手后才提交到 store。
  const effectiveTracks = useMemo(
    () =>
      tracks.map((track) =>
        drag && track.id === drag.trackId ? { ...track, start_ms: String(drag.startMs) } : track
      ),
    [tracks, drag]
  );

  const sceneMap = useMemo(() => new Map(scenes.map((scene) => [scene.id, scene])), [scenes]);
  const layers = useMemo(
    () => Array.from(new Set(effectiveTracks.map((track) => toNum(track.layer)))).sort((a, b) => a - b),
    [effectiveTracks]
  );

  // 播放头（或拖动预览）每变化一次，立即重算每盏灯该听哪个场景。
  const resolved = useMemo(
    () => resolveFixtureStatesAt(fixtures, effectiveTracks, scenes, timeMs),
    [fixtures, effectiveTracks, scenes, timeMs]
  );
  const liveCues = useMemo(
    () =>
      collectLiveCues(effectiveTracks, scenes, timeMs).sort((a, b) =>
        toNum(b.scene.priority) - toNum(a.scene.priority) || toNum(a.track.layer) - toNum(b.track.layer)
      ),
    [effectiveTracks, scenes, timeMs]
  );

  const beginDrag = (event: React.PointerEvent, track: TimelineTrack) => {
    if (isTrackLocked(track)) return; // 锁定轨道不接受拖动，但仍在预览中生效
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { trackId: track.id, originX: event.clientX, originStartMs: toNum(track.start_ms) };
  };

  const updateDrag = (event: React.PointerEvent, track: TimelineTrack) => {
    const session = dragRef.current;
    if (!session || session.trackId !== track.id) return;
    const deltaMs = (event.clientX - session.originX) / pxPerMs;
    const maxStart = Math.max(0, durationMs - toNum(track.duration_ms));
    const next = Math.min(Math.max(0, session.originStartMs + deltaMs), maxStart);
    setDrag({ trackId: track.id, startMs: Math.round(next / SNAP_MS) * SNAP_MS });
  };

  const endDrag = (track: TimelineTrack) => {
    const session = dragRef.current;
    dragRef.current = null;
    if (session && session.trackId === track.id && drag && drag.trackId === track.id) {
      moveTrack(track.id, drag.startMs);
    }
    setDrag(null);
  };

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>时间轴编排</h1>
        </div>
        <div className="playback-bar">
          <button className="control" onClick={() => seek(0)}>⏮ 回开头</button>
          <button className="control primary" onClick={toggle}>{playing ? "⏸ 暂停" : "▶ 播放"}</button>
          <span className="timecode">{formatMs(timeMs)} / {formatMs(durationMs)}</span>
          <button
            className="control"
            disabled={zoomIndex === 0}
            onClick={() => setZoomIndex((index) => Math.max(0, index - 1))}
          >
            －
          </button>
          <button
            className="control"
            disabled={zoomIndex === ZOOM_LEVELS.length - 1}
            onClick={() => setZoomIndex((index) => Math.min(ZOOM_LEVELS.length - 1, index + 1))}
          >
            ＋
          </button>
        </div>
      </section>

      <section className="live-strip">
        <strong>此刻生效</strong>
        {liveCues.length === 0 && <span className="muted">无场景覆盖，全部灯具黑场</span>}
        {liveCues.map((cue) => (
          <span key={cue.track.id} className="live-chip">
            {cue.scene.name}
            <em>L{cue.track.layer} · P{cue.scene.priority}</em>
            {cue.fadeProgress < 1 && <em>淡入 {Math.round(cue.fadeProgress * 100)}%</em>}
          </span>
        ))}
      </section>

      {loading && <EmptyState title="时间轴加载中…" />}
      {!loading && tracks.length === 0 && <EmptyState title="还没有时间轴轨道" />}
      {!loading && tracks.length > 0 && (
        <section className="timeline-scroll">
          <div className="timeline-body" style={{ width: durationMs * pxPerMs }}>
            <TimelineRuler durationMs={durationMs} pxPerMs={pxPerMs} timeMs={timeMs} onSeek={seek} />
            {layers.map((layer) => (
              <div className="lane" key={layer}>
                <div className="lane-label">Layer {layer}</div>
                {effectiveTracks
                  .filter((track) => toNum(track.layer) === layer)
                  .map((track) => {
                    const scene = sceneMap.get(track.cue_scene_id);
                    if (!scene) return null;
                    const locked = isTrackLocked(track);
                    const start = toNum(track.start_ms);
                    const width = Math.max(48, toNum(track.duration_ms) * pxPerMs);
                    return (
                      <div
                        key={track.id}
                        className={`cue-block${locked ? " locked" : ""}${drag?.trackId === track.id ? " dragging" : ""}`}
                        style={{ left: start * pxPerMs, width }}
                        title={locked ? "轨道已锁定，不接受拖动" : "拖动调整开始时刻"}
                        onPointerDown={(event) => beginDrag(event, track)}
                        onPointerMove={(event) => updateDrag(event, track)}
                        onPointerUp={() => endDrag(track)}
                      >
                        <CueCard scene={scene} locked={locked} />
                        <button
                          className="lock-toggle"
                          title={locked ? "解锁轨道" : "锁定轨道"}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleLocked(track.id);
                          }}
                        >
                          {locked ? "🔒" : "🔓"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            ))}
            <div className="playhead" style={{ left: timeMs * pxPerMs }} />
          </div>
        </section>
      )}

      <section className="preview-grid">
        <div className="panel">
          <h2>舞台实时预览</h2>
          <StageCanvas resolved={resolved} />
        </div>
        <div className="panel">
          <h2>灯具输出（{formatMs(timeMs)}）</h2>
          <div className="fixture-state-list">
            {resolved.map(({ fixture, state, source }) => (
              <article key={fixture.id} className="fixture-state">
                <i className="swatch" style={{ background: fixtureGlowColor(state) }} />
                <div className="fixture-state-main">
                  <strong>{fixture.fixture_code}</strong>
                  <span className="muted">{fixture.fixture_type} · DMX {fixture.dmx_address}</span>
                </div>
                <div className="fixture-state-source">
                  {source ? (
                    <>
                      <span>{source.scene.name}</span>
                      <span className="muted">L{source.track.layer} · P{source.scene.priority}</span>
                      {source.fadeProgress < 1 && <StatusBadge value="FADING" />}
                    </>
                  ) : (
                    <span className="muted">空闲 · 黑场</span>
                  )}
                </div>
                <span className="intensity">{state ? Math.round((state.intensity / 255) * 100) : 0}%</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
