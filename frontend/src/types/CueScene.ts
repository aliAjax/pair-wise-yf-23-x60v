import type { FixtureState } from "./FixtureState";

export interface CueScene {
  id: number;
  name: string;
  fixture_states: FixtureState[];
  fade_in_ms: string;
  hold_ms: string;
  priority: string;
  scene_status: string;
}
