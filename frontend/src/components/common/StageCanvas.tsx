import type { ResolvedFixtureState } from "../../utils/timelineResolver";
import { fixtureGlowColor, toNum } from "../../utils/timelineResolver";
import { FixtureIcon } from "./FixtureIcon";

interface StageCanvasProps {
  resolved: ResolvedFixtureState[];
}

/** 二维舞台俯视图：灯具按平面坐标摆放，光晕颜色与强度来自当前解析结果。 */
export function StageCanvas({ resolved }: StageCanvasProps) {
  return (
    <div className="stage-canvas">
      {resolved.map(({ fixture, state }) => {
        const glow = fixtureGlowColor(state);
        const level = state ? state.intensity / 255 : 0;
        return (
          <div
            key={fixture.id}
            className="stage-fixture"
            style={{ left: `${toNum(fixture.position_x)}%`, top: `${toNum(fixture.position_y)}%` }}
            title={`${fixture.fixture_code} · DMX ${fixture.dmx_address}`}
          >
            <span className="stage-glow" style={{ background: glow, opacity: 0.15 + level * 0.85 }} />
            <FixtureIcon fixture={fixture} color={state ? glow : undefined} />
            <label>{fixture.fixture_code}</label>
          </div>
        );
      })}
    </div>
  );
}
