import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { CueCard } from "../components/common/CueCard";
import { EmptyState } from "../components/common/EmptyState";
import { FixtureIcon } from "../components/common/FixtureIcon";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { TimelineRuler } from "../components/common/TimelineRuler";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { useTimelinePlayback } from "../hooks/useTimelinePlayback";
import { useCueSceneStore } from "../stores/CueSceneStore";
import { useFixtureStore } from "../stores/FixtureStore";
import { useShowProjectStore } from "../stores/ShowProjectStore";
import { useTimelineTrackStore } from "../stores/TimelineTrackStore";
import type { TimelineTrack } from "../types/TimelineTrack";
import { formatMs } from "../utils/formatters";
import { mixFixtureStatesAt, sceneAccentColor, timelineDurationMs } from "../utils/timelineMixer";

const PX_PER_MS = 0.09;
const SNAP_MS = 100;
const LANE_HEIGHT = 56;

export function TimelinePage() {
  const { rows: tracks, loading, load: loadTracks, moveTrack, commitTrack, toggleLocked } = useTimelineTrackStore();
  const { rows: scenes, load: loadScenes } = useCueSceneStore();
  const { rows: fixtures, load: loadFixtures } = useFixtureStore();
  const { rows: projects, load: loadProjects } = useShowProjectStore();

  useEffect(() => {
    void loadTracks();
    void loadScenes();
    void loadFixtures();
    void loadProjects();
  }, [loadTracks, loadScenes, loadFixtures, loadProjects]);

  const project = projects[0];
  const durationMs = useMemo(() => timelineDurationMs(tracks), [tracks]);
  const { timeMs, playing, play, pause, stop, seek } = useTimelinePlayback(durationMs);
  const sceneById = useMemo(() => new Map(scenes.map((scene) => [scene.id, scene])), [scenes]);
  // 播放头移动或轨道被拖动时即时重算：每盏灯取优先级最高、同优先级层号最小的场景值
  const mixed = useMemo(() => mixFixtureStatesAt(timeMs, tracks, scenes, fixtures), [timeMs, tracks, scenes, fixtures]);
  const layers = useMemo(() => [...new Set(tracks.map((track) => track.layer))].sort((a, b) => a - b), [tracks]);

  const [selectedSceneId, setSelectedSceneId] = useState<number | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const dragRef = useRef<{ id: number; startX: number; origStartMs: number; moved: boolean } | null>(null);
  const suppressClickRef = useRef(false);

  const onBlockPointerDown = (e: ReactPointerEvent<HTMLDivElement>, track: TimelineTrack) => {
    if (track.locked) {
      console.warn(ERROR_MESSAGES.TRACK_LOCKED, track);
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id: track.id, startX: e.clientX, origStartMs: track.start_ms, moved: false };
    setDraggingId(track.id);
  };

  const onBlockPointerMove = (e: ReactPointerEvent<HTMLDivElement>, track: TimelineTrack) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== track.id) return;
    const deltaMs = (e.clientX - drag.startX) / PX_PER_MS;
    const next = Math.max(0, Math.round((drag.origStartMs + deltaMs) / SNAP_MS) * SNAP_MS);
    if (next !== track.start_ms) {
      moveTrack(track.id, next);
      drag.moved = true;
    }
  };

  const endBlockDrag = (track: TimelineTrack, commit: boolean) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== track.id) return;
    if (commit && drag.moved) {
      suppressClickRef.current = true;
      void commitTrack(track.id);
    }
    dragRef.current = null;
    setDraggingId(null);
  };

  const onBlockClick = (track: TimelineTrack) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setSelectedSceneId(track.cue_scene_id);
  };

  const renderBlock = (track: TimelineTrack) => {
    const scene = sceneById.get(track.cue_scene_id);
    if (!scene) return null;
    const accent = sceneAccentColor(scene);
    // 块内三段：淡入渐变、保持实色、保持走完后的回落段（轨道仍覆盖但已释放灯具）
    const fadeMs = Math.min(scene.fade_in_ms, track.duration_ms);
    const holdMs = Math.min(scene.hold_ms, Math.max(0, track.duration_ms - fadeMs));
    const tailMs = Math.max(0, track.duration_ms - fadeMs - holdMs);
    const selected = selectedSceneId === scene.id;
    return (
      <div
        key={track.id}
        className={
          "cue-block" +
          (track.locked ? " locked" : "") +
          (selected ? " selected" : "") +
          (draggingId === track.id ? " dragging" : "")
        }
        style={{ left: track.start_ms * PX_PER_MS, width: track.duration_ms * PX_PER_MS }}
        title={`${scene.name} · 开始 ${formatMs(track.start_ms)} · 时长 ${formatMs(track.duration_ms)}${track.locked ? " · 已锁定" : ""}`}
        onPointerDown={(e) => onBlockPointerDown(e, track)}
        onPointerMove={(e) => onBlockPointerMove(e, track)}
        onPointerUp={() => endBlockDrag(track, true)}
        onPointerCancel={() => endBlockDrag(track, false)}
        onClick={() => onBlockClick(track)}
      >
        <span className="seg seg-fade" style={{ width: fadeMs * PX_PER_MS, background: `linear-gradient(90deg, transparent, ${accent})` }} />
        <span className="seg seg-hold" style={{ width: holdMs * PX_PER_MS, background: accent }} />
        {tailMs > 0 && <span className="seg seg-tail" style={{ width: tailMs * PX_PER_MS }} />}
        <span className="block-label">{scene.name}</span>
        <button
          type="button"
          className="lock-btn"
          title={track.locked ? "解锁轨道（锁定仅禁止拖动，仍参与预览）" : "锁定轨道"}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            void toggleLocked(track.id);
          }}
        >
          {track.locked ? "🔒" : "🔓"}
        </button>
      </div>
    );
  };

  return (
    <main className="page timeline-page">
      <section className="page-head">
        <div>
          <p className="eyebrow">stage-light</p>
          <h1>时间轴编排</h1>
          <p className="page-sub">{project ? `${project.title} · ${project.venue_name}` : "本地演出方案"}</p>
        </div>
        <StatusBadge value={playing ? "PLAYING" : "PAUSED"} />
      </section>

      <section className="metrics">
        <StatCard label="轨道 Cue" value={tracks.length} />
        <StatCard label="场景" value={scenes.length} />
        <StatCard label="灯具" value={fixtures.length} />
        <StatCard label="总时长" value={formatMs(durationMs)} />
      </section>

      <section className="panel transport">
        <div className="transport-buttons">
          {playing ? (
            <button type="button" className="transport-btn primary" onClick={pause}>暂停</button>
          ) : (
            <button type="button" className="transport-btn primary" onClick={play}>播放</button>
          )}
          <button type="button" className="transport-btn" onClick={stop}>停止</button>
        </div>
        <span className="transport-time">{formatMs(timeMs)} / {formatMs(durationMs)}</span>
        <span className="transport-hint">拖动 Cue 块调整开始时刻；点击标尺移动播放头；锁定轨道仅参与预览，不接受拖动</span>
      </section>

      {tracks.length === 0 && !loading ? (
        <EmptyState title="暂无时间轴轨道" />
      ) : (
        <section className="panel timeline-panel">
          <div className="timeline-grid">
            <div className="gutter">
              <div className="gutter-corner">轨道</div>
              {layers.map((layer) => (
                <div key={layer} className="lane-header" style={{ height: LANE_HEIGHT }}>
                  第 {layer} 层
                </div>
              ))}
            </div>
            <div className="timeline-scroll">
              <div className="timeline-canvas" style={{ width: durationMs * PX_PER_MS }}>
                <TimelineRuler durationMs={durationMs} timeMs={timeMs} pxPerMs={PX_PER_MS} onSeek={seek} />
                <div className="lanes">
                  {layers.map((layer) => (
                    <div key={layer} className="lane" style={{ height: LANE_HEIGHT }}>
                      {tracks.filter((track) => track.layer === layer).map(renderBlock)}
                    </div>
                  ))}
                  <div className="playhead-line" style={{ left: timeMs * PX_PER_MS }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="workbench">
        <div className="panel wide">
          <h2>
            灯具实时状态
            <span className="h2-time">播放头 {formatMs(timeMs)}</span>
          </h2>
          <div className="fixture-grid">
            {mixed.map(({ fixture, state, source, fading }) => (
              <article key={fixture.id} className={"fixture-card" + (source ? "" : " idle")}>
                <FixtureIcon fixture={fixture} state={state} />
                <div className="fixture-info">
                  <strong>{fixture.fixture_code}</strong>
                  <span className="fixture-source">
                    {source ? source.sceneName : "未受控"}
                    {fading && " · 渐入中"}
                  </span>
                  <div className="intensity-bar">
                    <i style={{ width: `${state.intensity}%` }} />
                  </div>
                  <span className="fixture-meta">
                    {fixture.fixture_type} · DMX {fixture.dmx_address} · 亮度 {state.intensity}%
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>场景库</h2>
          <div className="scene-list">
            {scenes.map((scene) => (
              <CueCard
                key={scene.id}
                scene={scene}
                selected={selectedSceneId === scene.id}
                onSelect={(id) => setSelectedSceneId(id === selectedSceneId ? null : id)}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
