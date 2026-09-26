import type { CueScene } from "../../types/CueScene";
import { formatMs } from "../../utils/formatters";
import { sceneAccentColor } from "../../utils/timelineMixer";
import { StatusBadge } from "./StatusBadge";

interface CueCardProps {
  scene: CueScene;
  selected?: boolean;
  onSelect?: (sceneId: number) => void;
}

export function CueCard({ scene, selected = false, onSelect }: CueCardProps) {
  const fixtureCount = Object.keys(scene.fixture_states).length;
  return (
    <button type="button" className={"cue-card" + (selected ? " selected" : "")} onClick={() => onSelect?.(scene.id)}>
      <span className="cue-accent" style={{ background: sceneAccentColor(scene) }} />
      <span className="cue-main">
        <span className="cue-title">
          <strong>{scene.name}</strong>
          <StatusBadge value={scene.scene_status} />
        </span>
        <span className="cue-meta">
          优先级 P{scene.priority} · 淡入 {formatMs(scene.fade_in_ms)} · 保持 {formatMs(scene.hold_ms)} · {fixtureCount} 盏灯
        </span>
      </span>
    </button>
  );
}
