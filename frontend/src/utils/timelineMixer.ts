import type { CueScene } from "../types/CueScene";
import type { Fixture } from "../types/Fixture";
import type { FixtureState } from "../types/FixtureState";
import type { TimelineTrack } from "../types/TimelineTrack";

/** 参与混算的单个轨道候选：轨道窗口覆盖此刻且场景保持时间未走完 */
export interface ActiveCue {
  track: TimelineTrack;
  scene: CueScene;
  target: FixtureState;
  /** 淡入进度 0-1，1 表示淡入已完成 */
  fadeProgress: number;
}

export interface MixedFixtureState {
  fixture: Fixture;
  /** 播放头时刻解析出的灯具输出状态 */
  state: FixtureState;
  /** 当前控制该灯具的场景来源，null 表示未受控 */
  source: { trackId: number; sceneId: number; sceneName: string } | null;
  /** 来源场景是否仍在淡入过程中 */
  fading: boolean;
}

/** 未受控灯具的默认输出（熄灭） */
export const IDLE_FIXTURE_STATE: FixtureState = { intensity: 0, red: 0, green: 0, blue: 0 };

/** 轨道窗口结束时刻：窗口为 [start_ms, start_ms + duration_ms) */
export function trackCoverEndMs(track: TimelineTrack): number {
  return track.start_ms + track.duration_ms;
}

/** 场景在轨道上的实际控制结束时刻：淡入 + 保持走完后释放灯具 */
export function trackAssertEndMs(track: TimelineTrack, scene: CueScene): number {
  return track.start_ms + scene.fade_in_ms + scene.hold_ms;
}

export function isTrackCoveringAt(track: TimelineTrack, timeMs: number): boolean {
  return timeMs >= track.start_ms && timeMs < trackCoverEndMs(track);
}

/** 轨道覆盖此刻且场景保持时间未走完，才参与灯具控制 */
export function isTrackAssertingAt(track: TimelineTrack, scene: CueScene, timeMs: number): boolean {
  return isTrackCoveringAt(track, timeMs) && timeMs < trackAssertEndMs(track, scene);
}

function fadeProgressAt(track: TimelineTrack, scene: CueScene, timeMs: number): number {
  if (scene.fade_in_ms <= 0) return 1;
  return Math.min(1, Math.max(0, (timeMs - track.start_ms) / scene.fade_in_ms));
}

/**
 * 支配顺序（升序排列，越靠后越优先）：
 * 优先级数值高者胜出；优先级相同时层号较小的轨道胜出；再相同按轨道 id 保证稳定。
 */
function compareDominance(a: ActiveCue, b: ActiveCue): number {
  if (a.scene.priority !== b.scene.priority) return a.scene.priority - b.scene.priority;
  if (a.track.layer !== b.track.layer) return b.track.layer - a.track.layer;
  return a.track.id - b.track.id;
}

function lerpState(from: FixtureState, to: FixtureState, progress: number): FixtureState {
  const mix = (a: number, b: number) => Math.round(a + (b - a) * progress);
  return {
    intensity: mix(from.intensity, to.intensity),
    red: mix(from.red, to.red),
    green: mix(from.green, to.green),
    blue: mix(from.blue, to.blue)
  };
}

/**
 * 计算播放头时刻所有灯具的输出状态。
 * 每盏灯独立解析：收集仍覆盖此刻且保持时间未走完的候选轨道，
 * 从低到高按支配顺序折叠，淡入中的场景在下层回退值上插值；
 * 保持时间走完的轨道被剔除，灯具自然回落到仍覆盖此刻的其他场景。
 */
export function mixFixtureStatesAt(
  timeMs: number,
  tracks: TimelineTrack[],
  scenes: CueScene[],
  fixtures: Fixture[]
): MixedFixtureState[] {
  const sceneById = new Map(scenes.map((scene) => [scene.id, scene]));
  return fixtures.map((fixture) => {
    const candidates: ActiveCue[] = [];
    for (const track of tracks) {
      const scene = sceneById.get(track.cue_scene_id);
      if (!scene) continue;
      const target = scene.fixture_states[fixture.id];
      if (!target) continue;
      if (!isTrackAssertingAt(track, scene, timeMs)) continue;
      candidates.push({ track, scene, target, fadeProgress: fadeProgressAt(track, scene, timeMs) });
    }
    if (candidates.length === 0) {
      return { fixture, state: IDLE_FIXTURE_STATE, source: null, fading: false };
    }
    candidates.sort(compareDominance);
    let state = IDLE_FIXTURE_STATE;
    for (const cue of candidates) {
      state = cue.fadeProgress >= 1 ? cue.target : lerpState(state, cue.target, cue.fadeProgress);
    }
    const winner = candidates[candidates.length - 1];
    return {
      fixture,
      state,
      source: { trackId: winner.track.id, sceneId: winner.scene.id, sceneName: winner.scene.name },
      fading: winner.fadeProgress < 1
    };
  });
}

/** 时间轴总时长：最晚轨道结束时刻再加一段留白，便于拖动和播放 */
export function timelineDurationMs(tracks: TimelineTrack[], padMs = 5000): number {
  const end = tracks.reduce((max, track) => Math.max(max, trackCoverEndMs(track)), 0);
  return end + padMs;
}

/** 场景代表色：取该场景所有灯具状态的平均颜色，用于卡片和轨道块着色 */
export function sceneAccentColor(scene: CueScene): string {
  const states = Object.values(scene.fixture_states);
  if (states.length === 0) return "#8a8f84";
  const total = states.reduce(
    (acc, state) => ({ red: acc.red + state.red, green: acc.green + state.green, blue: acc.blue + state.blue }),
    { red: 0, green: 0, blue: 0 }
  );
  const count = states.length;
  return `rgb(${Math.round(total.red / count)}, ${Math.round(total.green / count)}, ${Math.round(total.blue / count)})`;
}
