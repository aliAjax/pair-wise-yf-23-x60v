import { create } from "zustand";
import { listTimelineTrack, saveTimelineTrack } from "../api/TimelineTrack";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { TimelineTrack } from "../types/TimelineTrack";

type State = {
  rows: TimelineTrack[];
  loading: boolean;
  load: () => Promise<void>;
  /** 拖动过程中实时更新 start_ms；锁定轨道拒绝移动并返回 false */
  moveTrack: (id: number, startMs: number) => boolean;
  /** 拖动结束后提交持久化并记录更新日志 */
  commitTrack: (id: number) => Promise<void>;
  /** 切换锁定状态；锁定只禁止拖动，不影响预览混算 */
  toggleLocked: (id: number) => Promise<void>;
};

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
    if (track.locked) {
      console.warn(ERROR_MESSAGES.TRACK_LOCKED, track);
      return false;
    }
    const nextStart = Math.max(0, Math.round(startMs));
    set({ rows: get().rows.map((row) => (row.id === id ? { ...row, start_ms: nextStart } : row)) });
    return true;
  },
  async commitTrack(id) {
    const track = get().rows.find((row) => row.id === id);
    if (!track) return;
    console.info(LOG_TEMPLATES.TimelineTrack[1], track);
    await saveTimelineTrack(track);
  },
  async toggleLocked(id) {
    const track = get().rows.find((row) => row.id === id);
    if (!track) return;
    const next = { ...track, locked: !track.locked };
    set({ rows: get().rows.map((row) => (row.id === id ? next : row)) });
    console.info(LOG_TEMPLATES.TimelineTrack[2], next);
    await saveTimelineTrack(next);
  }
}));
