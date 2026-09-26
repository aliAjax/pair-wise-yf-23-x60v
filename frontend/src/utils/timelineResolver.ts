import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { FixtureState } from "../types/FixtureState";
import type { TimelineTrack } from "../types/TimelineTrack";

/** 种子数据把数值字段都存成字符串，这里统一转成数字参与时间轴计算。 */
export const toNum = (value: string | number): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/** 锁定标记同样以字符串存放（"true" / "false"）。 */
export const isTrackLocked = (track: TimelineTrack): boolean => track.locked === "true";

export interface ActiveCue {
  track: TimelineTrack;
  scene: CueScene;
  /** 相对轨道起点已经过去的毫秒数。 */
  localMs: number;
  /** fade-in 进度 0-1，保持段恒为 1。 */
  fadeProgress: number;
}

/**
 * 判定一条轨道上的场景在 timeMs 是否仍然“生效”：
 * 1. 播放头必须落在轨道 [start_ms, start_ms + duration_ms) 覆盖区间内；
 * 2. 场景的 fade_in + hold 保持时间尚未走完（走完即不再输出，灯具回落到其他覆盖场景）。
 */
export function isCueLiveAt(track: TimelineTrack, scene: CueScene, timeMs: number): boolean {
  const start = toNum(track.start_ms);
  const end = start + toNum(track.duration_ms);
  if (timeMs < start || timeMs >= end) return false;
  const liveMs = toNum(scene.fade_in_ms) + toNum(scene.hold_ms);
  return timeMs - start < liveMs;
}

/** 收集此刻仍然生效的轨道-场景对，顺序不保证，胜负由 resolveFixtureStatesAt 判定。 */
export function collectLiveCues(tracks: TimelineTrack[], scenes: CueScene[], timeMs: number): ActiveCue[] {
  const sceneMap = new Map(scenes.map((scene) => [scene.id, scene]));
  const cues: ActiveCue[] = [];
  for (const track of tracks) {
    const scene = sceneMap.get(track.cue_scene_id);
    if (!scene || scene.scene_status === "DISABLED" || scene.scene_status === "ARCHIVED") continue;
    if (!isCueLiveAt(track, scene, timeMs)) continue;
    const localMs = timeMs - toNum(track.start_ms);
    const fadeIn = toNum(scene.fade_in_ms);
    const fadeProgress = fadeIn <= 0 ? 1 : Math.min(1, localMs / fadeIn);
    cues.push({ track, scene, localMs, fadeProgress });
  }
  return cues;
}

/**
 * 场景间的胜负规则：
 * - 先比优先级（priority 数值越大越优先）；
 * - 优先级相同，层号（layer）较小的轨道胜出。
 */
export function isCueStronger(a: ActiveCue, b: ActiveCue): boolean {
  const priorityGap = toNum(a.scene.priority) - toNum(b.scene.priority);
  if (priorityGap !== 0) return priorityGap > 0;
  return toNum(a.track.layer) < toNum(b.track.layer);
}

export interface ResolvedFixtureState {
  fixture: Fixture;
  /** 胜出场景在淡入插值后的实际输出；无任何场景覆盖时为 null（黑场/空闲）。 */
  state: FixtureState | null;
  source: ActiveCue | null;
}

/**
 * 给定播放头时刻，为每盏灯具算出最终输出：
 * 在所有仍生效的场景里找优先级最高、层号最小的那个值；
 * 处于 fade-in 阶段时对强度做线性插值（颜色通道保持目标色相）。
 */
export function resolveFixtureStatesAt(
  fixtures: Fixture[],
  tracks: TimelineTrack[],
  scenes: CueScene[],
  timeMs: number
): ResolvedFixtureState[] {
  const liveCues = collectLiveCues(tracks, scenes, timeMs);
  return fixtures.map((fixture) => {
    let winner: ActiveCue | null = null;
    let target: FixtureState | null = null;
    for (const cue of liveCues) {
      const state = cue.scene.fixture_states.find((item) => item.fixture_id === fixture.id);
      if (!state) continue;
      if (!winner || isCueStronger(cue, winner)) {
        winner = cue;
        target = state;
      }
    }
    if (!winner || !target) return { fixture, state: null, source: null };
    const level = winner.fadeProgress;
    return {
      fixture,
      source: winner,
      state: {
        fixture_id: target.fixture_id,
        r: target.r,
        g: target.g,
        b: target.b,
        intensity: Math.round(target.intensity * level)
      }
    };
  });
}

/** 灯具实际发光颜色：颜色通道按强度衰减，未被任何场景覆盖时返回黑场。 */
export function fixtureGlowColor(state: FixtureState | null): string {
  if (!state || state.intensity <= 0) return "rgb(0,0,0)";
  const level = state.intensity / 255;
  return `rgb(${Math.round(state.r * level)},${Math.round(state.g * level)},${Math.round(state.b * level)})`;
}
