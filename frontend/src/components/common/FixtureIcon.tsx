import type { Fixture } from "../../types/Fixture";
import type { FixtureState } from "../../types/FixtureState";

interface FixtureIconProps {
  fixture: Fixture;
  /** 当前输出状态；缺省或亮度为 0 时显示熄灭 */
  state?: FixtureState | null;
}

export function FixtureIcon({ fixture, state }: FixtureIconProps) {
  const active = Boolean(state && state.intensity > 0);
  const gain = state ? state.intensity / 100 : 0;
  const color = state
    ? `rgb(${Math.round(state.red * gain)}, ${Math.round(state.green * gain)}, ${Math.round(state.blue * gain)})`
    : "#3a4038";
  return (
    <span
      className={"fixture-icon" + (active ? " active" : "")}
      title={`${fixture.fixture_code} · ${fixture.fixture_type}`}
      style={{ background: color, boxShadow: active ? `0 0 12px 2px ${color}` : "none" }}
    />
  );
}
