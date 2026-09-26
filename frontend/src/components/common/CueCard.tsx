import type { CueScene } from "../../types/CueScene";
import { StatusBadge } from "./StatusBadge";

interface CueCardProps {
  scene: CueScene;
  locked?: boolean;
}

/** 时间轴轨道上的场景块内容：名称、状态、优先级与颜色采样。 */
export function CueCard({ scene, locked = false }: CueCardProps) {
  return (
    <div className="cue-card">
      <header>
        <strong>{scene.name}</strong>
        {locked && <span className="cue-lock" title="轨道已锁定，不接受拖动">🔒</span>}
      </header>
      <div className="cue-meta">
        <StatusBadge value={scene.scene_status} />
        <span>P{scene.priority}</span>
        <span>淡入 {scene.fade_in_ms}ms</span>
        <span>保持 {scene.hold_ms}ms</span>
      </div>
      <div className="cue-swatches">
        {scene.fixture_states.map((state) => (
          <i key={state.fixture_id} style={{ background: `rgb(${state.r},${state.g},${state.b})` }} />
        ))}
      </div>
    </div>
  );
}
