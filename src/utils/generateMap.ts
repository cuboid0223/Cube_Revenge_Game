import { buildTileMap } from "@/helpers/buildTileMap";
import generateRoomsWalks from "./generateRoomsRandomWalk";
import tileMapToLevel from "./tileMapToLevel";
import { templateMap } from "@/helpers/typeRooms";
import findSolutionPath, { createMap, findPositions } from "./findSolutionPath";
import { LEVEL_THEMES, PLACEMENT_TYPE_GOAL, PLACEMENT_TYPE_HERO } from "@/helpers/consts";



export default function generateMap() {
    // 設置最多嘗試次數，避免無限迴圈
    const MAX_ATTEMPTS = 50;
  
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      // 1) 先 macro-level 生成 rooms
      const rooms = generateRoomsWalks(3);
  
      // 2) micro-level => 生成 tileMap
      const tileMap = buildTileMap(rooms, 3, 3, templateMap);
        console.log(tileMap);
      // 3) 轉成 Spelunky-like levelData
      const levelData = tileMapToLevel(tileMap, LEVEL_THEMES.YELLOW);
  
      // 4) createMap => gameMap/placements
      const { gameMap, placements } = createMap(levelData);

      console.log(placements);
  
      // 5) 找 hero
      const heroPos = findPositions(placements, PLACEMENT_TYPE_HERO)[0];
      const goalPos = findPositions(placements, PLACEMENT_TYPE_GOAL)[0];
      if (!heroPos ||!goalPos) {
        // 若連英雄都沒有 => 代表地圖沒放 "H"? 或衝突
        console.log("no goalPos or hero");
        continue; // 重新來一次
      }
  
      // 6) 嘗試找解法
      //   假設 findSolutionPath(...) 回傳陣列 (若無解 => 為空 or null)
      const solutionPath = findSolutionPath(
        heroPos,
        gameMap,
        levelData.tilesWidth,
        levelData.tilesHeight,
        placements
      );
  
      if (solutionPath && solutionPath.length > 0) {
        // 表示有可行路徑 => 就可以返回這個 levelData
        console.log("Found solution at attempt", attempt, "Path length=", solutionPath.length);
        return levelData;
      }
  
      // 若無解 => 繼續下一回合
    }
  
    // 超過MAX_ATTEMPTS還沒找到 => 拋出錯誤或回傳null
    throw new Error(`無法在 ${MAX_ATTEMPTS} 次嘗試內生成可通關地圖`);
  }