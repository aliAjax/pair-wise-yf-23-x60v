export const mockData = {
  "fixture": [
    {
      "id": 1,
      "fixture_code": "PAR-01",
      "fixture_type": "PAR",
      "position_x": "15",
      "position_y": "25",
      "dmx_address": "1",
      "channel_count": 4,
      "color_mode": "RGB"
    },
    {
      "id": 2,
      "fixture_code": "PAR-02",
      "fixture_type": "PAR",
      "position_x": "85",
      "position_y": "25",
      "dmx_address": "5",
      "channel_count": 4,
      "color_mode": "RGB"
    },
    {
      "id": 3,
      "fixture_code": "SPOT-01",
      "fixture_type": "SPOT",
      "position_x": "50",
      "position_y": "14",
      "dmx_address": "9",
      "channel_count": 6,
      "color_mode": "MOVING_HEAD"
    },
    {
      "id": 4,
      "fixture_code": "WASH-01",
      "fixture_type": "WASH",
      "position_x": "30",
      "position_y": "62",
      "dmx_address": "16",
      "channel_count": 4,
      "color_mode": "RGBW"
    },
    {
      "id": 5,
      "fixture_code": "WASH-02",
      "fixture_type": "WASH",
      "position_x": "70",
      "position_y": "62",
      "dmx_address": "20",
      "channel_count": 4,
      "color_mode": "RGBW"
    },
    {
      "id": 6,
      "fixture_code": "STROBE-01",
      "fixture_type": "STROBE",
      "position_x": "50",
      "position_y": "86",
      "dmx_address": "24",
      "channel_count": 2,
      "color_mode": "DIMMER_ONLY"
    }
  ],
  "cueScene": [
    {
      "id": 1,
      "name": "安全工作光",
      "fixture_states": [
        { "fixture_id": 1, "intensity": 90, "r": 255, "g": 214, "b": 170 },
        { "fixture_id": 2, "intensity": 90, "r": 255, "g": 214, "b": 170 },
        { "fixture_id": 3, "intensity": 80, "r": 255, "g": 220, "b": 180 },
        { "fixture_id": 4, "intensity": 70, "r": 255, "g": 214, "b": 170 },
        { "fixture_id": 5, "intensity": 70, "r": 255, "g": 214, "b": 170 },
        { "fixture_id": 6, "intensity": 30, "r": 255, "g": 255, "b": 255 }
      ],
      "fade_in_ms": "500",
      "hold_ms": "60000",
      "priority": "0",
      "scene_status": "READY"
    },
    {
      "id": 2,
      "name": "开场亮相",
      "fixture_states": [
        { "fixture_id": 1, "intensity": 255, "r": 255, "g": 40, "b": 40 },
        { "fixture_id": 2, "intensity": 255, "r": 255, "g": 40, "b": 40 },
        { "fixture_id": 3, "intensity": 255, "r": 255, "g": 180, "b": 60 }
      ],
      "fade_in_ms": "2000",
      "hold_ms": "8000",
      "priority": "2",
      "scene_status": "READY"
    },
    {
      "id": 3,
      "name": "频闪高潮",
      "fixture_states": [
        { "fixture_id": 3, "intensity": 255, "r": 255, "g": 255, "b": 255 },
        { "fixture_id": 4, "intensity": 220, "r": 255, "g": 255, "b": 255 },
        { "fixture_id": 5, "intensity": 220, "r": 255, "g": 255, "b": 255 },
        { "fixture_id": 6, "intensity": 255, "r": 255, "g": 255, "b": 255 }
      ],
      "fade_in_ms": "100",
      "hold_ms": "3000",
      "priority": "3",
      "scene_status": "READY"
    },
    {
      "id": 4,
      "name": "独白追光",
      "fixture_states": [
        { "fixture_id": 3, "intensity": 255, "r": 120, "g": 170, "b": 255 },
        { "fixture_id": 4, "intensity": 120, "r": 60, "g": 90, "b": 200 },
        { "fixture_id": 5, "intensity": 120, "r": 60, "g": 90, "b": 200 }
      ],
      "fade_in_ms": "1500",
      "hold_ms": "10000",
      "priority": "2",
      "scene_status": "READY"
    },
    {
      "id": 5,
      "name": "和声铺底",
      "fixture_states": [
        { "fixture_id": 1, "intensity": 200, "r": 40, "g": 220, "b": 120 },
        { "fixture_id": 2, "intensity": 200, "r": 40, "g": 220, "b": 120 },
        { "fixture_id": 4, "intensity": 180, "r": 40, "g": 200, "b": 140 },
        { "fixture_id": 5, "intensity": 180, "r": 40, "g": 200, "b": 140 }
      ],
      "fade_in_ms": "1000",
      "hold_ms": "12000",
      "priority": "2",
      "scene_status": "READY"
    },
    {
      "id": 6,
      "name": "谢幕暖光",
      "fixture_states": [
        { "fixture_id": 1, "intensity": 200, "r": 255, "g": 170, "b": 80 },
        { "fixture_id": 2, "intensity": 200, "r": 255, "g": 170, "b": 80 },
        { "fixture_id": 3, "intensity": 180, "r": 255, "g": 190, "b": 120 },
        { "fixture_id": 4, "intensity": 200, "r": 255, "g": 170, "b": 80 },
        { "fixture_id": 5, "intensity": 200, "r": 255, "g": 170, "b": 80 },
        { "fixture_id": 6, "intensity": 120, "r": 255, "g": 200, "b": 120 }
      ],
      "fade_in_ms": "3000",
      "hold_ms": "15000",
      "priority": "1",
      "scene_status": "DRAFT"
    }
  ],
  "timelineTrack": [
    {
      "id": 1,
      "cue_scene_id": 1,
      "start_ms": "0",
      "duration_ms": "60000",
      "layer": "0",
      "locked": "true"
    },
    {
      "id": 2,
      "cue_scene_id": 2,
      "start_ms": "5000",
      "duration_ms": "10000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 3,
      "cue_scene_id": 3,
      "start_ms": "10000",
      "duration_ms": "5000",
      "layer": "2",
      "locked": "false"
    },
    {
      "id": 4,
      "cue_scene_id": 4,
      "start_ms": "20000",
      "duration_ms": "20000",
      "layer": "1",
      "locked": "false"
    },
    {
      "id": 5,
      "cue_scene_id": 5,
      "start_ms": "22000",
      "duration_ms": "15000",
      "layer": "2",
      "locked": "false"
    },
    {
      "id": 6,
      "cue_scene_id": 6,
      "start_ms": "45000",
      "duration_ms": "15000",
      "layer": "1",
      "locked": "false"
    }
  ],
  "showProject": [
    {
      "id": 1,
      "title": "年度汇演·彩排场",
      "venue_name": "实验剧场",
      "fixture_ids": [1, 2, 3, 4, 5, 6],
      "track_ids": [1, 2, 3, 4, 5, 6],
      "updated_at": "2026-09-26T09:00:00Z"
    }
  ]
} as const;
