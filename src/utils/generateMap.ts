import { buildTileMap } from "@/helpers/buildTileMap";
import tileMapToLevel from "./tileMapToLevel";
import { templateMap } from "@/helpers/roomTemplatesMap";
import findSolutionPath, { createMap, findPositions } from "./findSolutionPath";
import { LEVEL_THEMES, PLACEMENT_TYPE_GOAL, PLACEMENT_TYPE_HERO } from "@/helpers/consts";
import generateRooms from "./generateRooms";

const MAX_ATTEMPTS = 50;
const ROOM_GRID_SIZE  = 3
const ROOM_WIDTH = 10,  ROOM_HEIGHT = 10

type MapInfo = {
    roomGridSize?: number,
    roomWidth?: number,
    roomHeight?: number
    levelTheme?: string,
    maxAttempts?: number
}

export default function generateMap({
    roomGridSize = ROOM_GRID_SIZE,
    roomWidth = ROOM_WIDTH,
    roomHeight = ROOM_HEIGHT,
    levelTheme = LEVEL_THEMES.YELLOW,
    maxAttempts = MAX_ATTEMPTS
}: MapInfo = {}) {
    // 設置最多嘗試次數，避免無限迴圈
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      // 1) 先 macro-level 生成 rooms
      const rooms = generateRooms(roomGridSize);
  
      // 2) micro-level => 生成 tileMap
      const tileMap = buildTileMap(rooms, roomWidth, roomHeight, templateMap);
        // console.log(tileMap);
      // 3) 將 Spelunky-like tileMap 轉換成 array of object
      const levelData = tileMapToLevel(tileMap, levelTheme);
  
      // 4) createMap => gameMap/placements
      const { gameMap, placements } = createMap(levelData);

  
      // 5) 找 hero
      const heroPos = findPositions(placements, PLACEMENT_TYPE_HERO)[0];
      const goalPos = findPositions(placements, PLACEMENT_TYPE_GOAL)[0];
      if (!heroPos ||!goalPos) {
        // 若連英雄都沒有 => 代表地圖沒放 "H"? 或衝突
        console.log(gameMap);
        console.log("no goalPos or hero");
        continue; // 重新來一次
      }
  
      // 6) 嘗試找解法
      //   假設 findSolutionPath(...) 回傳陣列 (若無解 => 為空 or null)
      const solutionPath = findSolutionPath(
        gameMap,
        levelData.tilesWidth,
        levelData.tilesHeight,
        placements
      );
  
      if (solutionPath && solutionPath.length > 0) {
        // 表示有可行路徑 => 就可以返回這個 levelData
        console.log(`在經過 ${attempt + 1} 次生成關卡後，成功找到 solutionPath: ${JSON.stringify(solutionPath) }`);
        return {...levelData, solutionPath};
      }
  
      // 若無解 => 繼續下一回合
    }
  
    // 超過MAX_ATTEMPTS還沒找到 => 拋出錯誤或回傳null
    throw new Error(`無法在 ${MAX_ATTEMPTS} 次嘗試內生成可通關地圖`);
  }