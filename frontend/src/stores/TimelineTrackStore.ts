import { create } from "zustand";
import { listTimelineTrack, saveTimelineTrack } from "../api/TimelineTrack";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { TimelineTrack } from "../types/TimelineTrack";
import { isTrackLocked } from "../utils/timelineResolver";

type State = {
  rows: TimelineTrack[];
  loading: boolean;
  load: () => Promise<void>;
  /** 拖动轨道上的 Cue 改变开始时刻；锁定轨道直接拒绝，返回是否生效。 */
  moveTrack: (id: number, startMs: number) => boolean;
  toggleLocked: (id: number) => void;
};

const [LOG_MOVE, LOG_LOCK, LOG_MOVE_DENIED] = [
  LOG_TEMPLATES.TimelineTrack[4],
  LOG_TEMPLATES.TimelineTrack[5],
  LOG_TEMPLATES.TimelineTrack[6]
];

export const useTimelineTrackStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  async load() {
    set({ loading: true });
    set({ rows: await listTimelineTrack(), loading: false });
  },
  moveTrack(id, startMs) {
    const track = get().rows.find((row) => row.id === id);
    if (!track) return false;
    if (isTrackLocked(track)) {
      console.warn(LOG_MOVE_DENIED, { id, startMs });
      return false;
    }
    const next = { ...track, start_ms: String(Math.max(0, Math.round(startMs))) };
    set({ rows: get().rows.map((row) => (row.id === id ? next : row)) });
    console.info(LOG_MOVE, { id, start_ms: next.start_ms });
    void saveTimelineTrack(next);
    return true;
  },
  toggleLocked(id) {
    const track = get().rows.find((row) => row.id === id);
    if (!track) return;
    const next = { ...track, locked: isTrackLocked(track) ? "false" : "true" };
    set({ rows: get().rows.map((row) => (row.id === id ? next : row)) });
    console.info(LOG_LOCK, { id, locked: next.locked });
    void saveTimelineTrack(next);
  }
}));
