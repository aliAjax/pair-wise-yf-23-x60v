export const mockData = {
  "fixture": [
    {
      "id": 1,
      "fixture_code": "PAR-01",
      "fixture_type": "PAR",
      "position_x": 12,
      "position_y": 18,
      "dmx_address": 1,
      "channel_count": 3,
      "color_mode": "RGB"
    },
    {
      "id": 2,
      "fixture_code": "PAR-02",
      "fixture_type": "PAR",
      "position_x": 32,
      "position_y": 18,
      "dmx_address": 4,
      "channel_count": 3,
      "color_mode": "RGB"
    },
    {
      "id": 3,
      "fixture_code": "SPOT-01",
      "fixture_type": "SPOT",
      "position_x": 50,
      "position_y": 12,
      "dmx_address": 7,
      "channel_count": 4,
      "color_mode": "RGBW"
    },
    {
      "id": 4,
      "fixture_code": "WASH-01",
      "fixture_type": "WASH",
      "position_x": 70,
      "position_y": 18,
      "dmx_address": 11,
      "channel_count": 3,
      "color_mode": "RGB"
    },
    {
      "id": 5,
      "fixture_code": "BEAM-01",
      "fixture_type": "BEAM",
      "position_x": 24,
      "position_y": 64,
      "dmx_address": 14,
      "channel_count": 8,
      "color_mode": "MOVING_HEAD"
    },
    {
      "id": 6,
      "fixture_code": "STROBE-01",
      "fixture_type": "STROBE",
      "position_x": 78,
      "position_y": 64,
      "dmx_address": 22,
      "channel_count": 1,
      "color_mode": "DIMMER_ONLY"
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "暖色铺底",
      "fixture_states": {
        "1": { "intensity": 60, "red": 255, "green": 180, "blue": 80 },
        "2": { "intensity": 60, "red": 255, "green": 180, "blue": 80 },
        "3": { "intensity": 55, "red": 255, "green": 190, "blue": 110 },
        "4": { "intensity": 60, "red": 255, "green": 180, "blue": 80 },
        "5": { "intensity": 50, "red": 255, "green": 170, "blue": 70 },
        "6": { "intensity": 0, "red": 255, "green": 255, "blue": 255 }
      },
      "fade_in_ms": 1000,
      "hold_ms": 8000,
      "priority": 1,
      "scene_status": "READY"
    },
    {
      "id": 2,
      "name": "蓝色逆光",
      "fixture_states": {
        "3": { "intensity": 80, "red": 60, "green": 120, "blue": 255 },
        "5": { "intensity": 85, "red": 40, "green": 100, "blue": 255 },
        "6": { "intensity": 70, "red": 80, "green": 140, "blue": 255 }
      },
      "fade_in_ms": 800,
      "hold_ms": 5000,
      "priority": 2,
      "scene_status": "READY"
    },
    {
      "id": 3,
      "name": "红色重点",
      "fixture_states": {
        "1": { "intensity": 100, "red": 255, "green": 40, "blue": 40 },
        "2": { "intensity": 100, "red": 255, "green": 40, "blue": 40 }
      },
      "fade_in_ms": 500,
      "hold_ms": 4000,
      "priority": 3,
      "scene_status": "READY"
    },
    {
      "id": 4,
      "name": "频闪高潮",
      "fixture_states": {
        "6": { "intensity": 100, "red": 255, "green": 255, "blue": 255 }
      },
      "fade_in_ms": 100,
      "hold_ms": 2000,
      "priority": 4,
      "scene_status": "DRAFT"
    },
    {
      "id": 5,
      "name": "谢幕白光",
      "fixture_states": {
        "1": { "intensity": 90, "red": 255, "green": 245, "blue": 230 },
        "2": { "intensity": 90, "red": 255, "green": 245, "blue": 230 },
        "3": { "intensity": 95, "red": 255, "green": 250, "blue": 240 },
        "4": { "intensity": 90, "red": 255, "green": 245, "blue": 230 },
        "5": { "intensity": 85, "red": 255, "green": 250, "blue": 235 },
        "6": { "intensity": 80, "red": 255, "green": 255, "blue": 255 }
      },
      "fade_in_ms": 2000,
      "hold_ms": 6000,
      "priority": 2,
      "scene_status": "READY"
    }
  ],
  "timelineTrack": [
    {
      "id": 1,
      "cue_scene_id": 1,
      "start_ms": 0,
      "duration_ms": 12000,
      "layer": 1,
      "locked": true
    },
    {
      "id": 2,
      "cue_scene_id": 2,
      "start_ms": 4000,
      "duration_ms": 8000,
      "layer": 2,
      "locked": false
    },
    {
      "id": 3,
      "cue_scene_id": 3,
      "start_ms": 6000,
      "duration_ms": 6000,
      "layer": 3,
      "locked": false
    },
    {
      "id": 4,
      "cue_scene_id": 5,
      "start_ms": 8000,
      "duration_ms": 8000,
      "layer": 4,
      "locked": false
    },
    {
      "id": 5,
      "cue_scene_id": 4,
      "start_ms": 12000,
      "duration_ms": 3000,
      "layer": 1,
      "locked": false
    }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "周年庆演出",
      "venue_name": "实验剧场",
      "fixture_ids": [1, 2, 3, 4, 5, 6],
      "track_ids": [1, 2, 3, 4, 5],
      "updated_at": "2026-09-26T09:00:00Z"
    }
  ]
} as const;
