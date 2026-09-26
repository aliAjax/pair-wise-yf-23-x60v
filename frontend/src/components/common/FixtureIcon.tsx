import type { Fixture } from "../../types/Fixture";

interface FixtureIconProps {
  fixture: Fixture;
  color?: string;
  size?: number;
}

/** 按灯具类型绘制不同的灯位符号，颜色跟随当前输出。 */
export function FixtureIcon({ fixture, color = "#8a9187", size = 22 }: FixtureIconProps) {
  const common = { fill: color, stroke: "#223126", strokeWidth: 1.5 };
  const shape = (() => {
    switch (fixture.fixture_type) {
      case "PAR":
        return <circle cx="12" cy="12" r="8" {...common} />;
      case "SPOT":
        return <polygon points="12,3 21,20 3,20" {...common} />;
      case "WASH":
        return <rect x="4" y="4" width="16" height="16" rx="3" {...common} />;
      case "BEAM":
        return <polygon points="12,2 22,12 12,22 2,12" {...common} />;
      case "STROBE":
        return <polygon points="13,2 5,13 11,13 9,22 19,10 13,10" {...common} />;
      default:
        return <circle cx="12" cy="12" r="8" {...common} />;
    }
  })();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-label={fixture.fixture_type}>
      {shape}
    </svg>
  );
}
