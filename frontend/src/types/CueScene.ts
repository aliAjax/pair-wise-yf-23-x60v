import type { CueStatus } from "./CueStatus";
import type { FixtureState } from "./FixtureState";

export interface CueScene {
  id: number;
  name: string;
  /** key 为灯具 id，值为该场景下灯具的目标状态 */
  fixture_states: Record<number, FixtureState>;
  fade_in_ms: number;
  hold_ms: number;
  priority: number;
  scene_status: CueStatus;
}
