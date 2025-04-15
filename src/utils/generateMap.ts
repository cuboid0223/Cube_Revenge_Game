import { buildTileMap } from "@/helpers/buildTileMap";
import tileMapToLevel from "./tileMapToLevel";
import { templateMap } from "@/helpers/roomTemplatesMap";
import findSolutionPath, { createMap, findPositions } from "./findSolutionPath";
import {
  LEVEL_THEMES,
  PLACEMENT_TYPE_GOAL,
  PLACEMENT_TYPE_HERO,
} from "@/helpers/consts";
import generateRooms from "./generateRooms";
import { encodeGameMap, encodePlacements } from "./encodeObject";
import DemoLevel1 from "@/levels/DemoLevel1";

const MAX_ATTEMPTS = 100;
const ROOM_GRID_SIZE = 3;
const ROOM_WIDTH = 10,
  ROOM_HEIGHT = 10;

type MapInfo = {
  roomGridSize?: number;
  roomWidth?: number;
  roomHeight?: number;
  levelTheme?: string;
  maxAttempts?: number;
};

export default async function generateMap({
  roomGridSize = ROOM_GRID_SIZE,
  roomWidth = ROOM_WIDTH,
  roomHeight = ROOM_HEIGHT,
  levelTheme = LEVEL_THEMES.YELLOW,
  maxAttempts = MAX_ATTEMPTS,
}: MapInfo = {}) {
  const startOverall = performance.now();
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // 快速生成關卡核心數據
    // 生成 ROOM_GRID_SIZE * ROOM_GRID_SIZE 個房間
    // eg. ROOM_GRID_SIZE = 3 即是 9 個房間
    // 每個房間 10 * 10
    const rooms = generateRooms(roomGridSize);
    //  根據房間類型選擇對應模板
    const tileMap = buildTileMap(rooms, roomWidth, roomHeight, templateMap);
    // 將所有房間的模板轉換成 levelData
    const levelData = tileMapToLevel(tileMap, levelTheme);
    // 方便 findSolutionPathSimple 計算
    const { gameMap, placements } = createMap(levelData);

    // 早期驗證：檢查必備 placement 是否存在
    const heroPos = findPositions(placements, PLACEMENT_TYPE_HERO)[0];
    const goalPos = findPositions(placements, PLACEMENT_TYPE_GOAL)[0];
    if (!heroPos || !goalPos) {
      console.log("缺少 hero 或 goal，嘗試下一組生成");
      continue;
    }

    // 呼叫 WASM 解題
    const encodedMap = encodeGameMap(gameMap);
    const encodedPlacements = encodePlacements(placements);
    try {
      const wasmModule = await import("../../public/wasm/findSolutionPath");
      const t0 = performance.now();
      const solutionPath: [number, number][] =
        wasmModule.findSolutionPathSimple(
          encodedMap,
          levelData.tilesWidth,
          levelData.tilesHeight,
          encodedPlacements
        );
      const t1 = performance.now();
      console.log(`WASM 解題耗時: ${(t1 - t0).toFixed(2)} ms`);

      if (solutionPath && solutionPath.length > 0) {
        console.log(
          `在第 ${attempt + 1} 次嘗試後找到解法: ${JSON.stringify(
            solutionPath
          )}`
        );
        console.log(levelData);
        return { ...levelData, solutionPath };
      }
    } catch (error) {
      console.error("呼叫 WASM 解題失敗:", error);
      continue;
    }

    // 超時檢查（例如總時間超過 5 秒則退出）
    if (performance.now() - startOverall > 5000) {
      throw new Error("生成關卡花費時間過長");
    }
  }
  return DemoLevel1;
  // throw new Error(`無法在 ${maxAttempts} 次嘗試內生成可通關地圖`);
}
