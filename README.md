# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20113>



## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`



## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Redux Toolkit + IndexedDB |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`


## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-stage-light}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 时间轴编排规则

- 轨道 Cue 块可水平拖动调整 `start_ms`（吸附 100ms），拖动中预览即时重算；锁定轨道（🔒）拒绝拖动，但其场景控制仍参与预览混算。
- 播放头停在任意时刻时，每盏灯独立解析：取仍覆盖此刻且保持时间未走完的候选中**优先级最高**的场景值；优先级相同时**层号较小**的轨道胜出。
- 场景在轨道上的实际控制窗口为 `淡入 + 保持`；保持时间走完后轨道若仍覆盖此刻，灯具回落到其他仍覆盖的场景值，无覆盖则熄灭。
- 淡入中的场景在下层（回退）状态上线性插值；Cue 块内三段依次表示淡入、保持、已释放（回落）区间。
- 混算逻辑集中在 `frontend/src/utils/timelineMixer.ts`，播放头驱动在 `frontend/src/hooks/useTimelinePlayback.ts`。

## 枚举/常量出现位置清单

- FixtureType: constants/FixtureType、types/FixtureType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- CueStatus: constants/CueStatus、types/CueStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ChannelMode: constants/ChannelMode、types/ChannelMode、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
