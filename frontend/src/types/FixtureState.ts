/**
 * 单个灯具在某个场景（CueScene）中的目标输出值。
 * 颜色/强度通道统一使用 0-255 的 DMX 量级，便于在淡入时线性插值。
 */
export interface FixtureState {
  fixture_id: number;
  intensity: number;
  r: number;
  g: number;
  b: number;
}
