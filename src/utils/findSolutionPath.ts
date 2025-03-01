import { DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP, PLACEMENT_TYPE_CONVEYOR, PLACEMENT_TYPE_FIRE, PLACEMENT_TYPE_FIRE_PICKUP, PLACEMENT_TYPE_FLOUR, PLACEMENT_TYPE_GOAL, PLACEMENT_TYPE_HERO, PLACEMENT_TYPE_ICE, PLACEMENT_TYPE_ICE_PICKUP, PLACEMENT_TYPE_KEY, PLACEMENT_TYPE_LOCK, PLACEMENT_TYPE_SWITCH, PLACEMENT_TYPE_SWITCH_DOOR, PLACEMENT_TYPE_TELEPORT, PLACEMENT_TYPE_THIEF, PLACEMENT_TYPE_WALL, PLACEMENT_TYPE_WATER, PLACEMENT_TYPE_WATER_PICKUP } from "@/helpers/consts";
import { Level, Placement } from "@/helpers/types";
import PriorityQueue from "./PriorityQueue";
import { iceTileCornerBlockedMoves, iceTileCornerRedirection } from "@/game-objects/IcePlacement";
import { getDirectionKey, handleIceLogic, isCornerSolidForBody } from "./handleIceLogic";

// 簡化地圖為二維矩陣，並記錄所有物件位置
export function createMap(level: Level) {
  /*
            x (width)
            ------------
  y(height) |
            |
            |
            |
  
  */
  const { tilesWidth: width, tilesHeight: height, placements } = level;
  const gameMap = Array.from({ length: height }, () => Array(width).fill(null));

  placements.forEach(({ x, y, type }) => {
      const adjustedX = x - 1;
      const adjustedY = y - 1;
      if (adjustedX >= 0 && adjustedX < width && adjustedY >= 0 && adjustedY < height) {
          gameMap[adjustedY][adjustedX] = type;
      }
  });

  return { gameMap, placements };
}

// 查找所有物件位置
export function findPositions(placements: Placement[], type: string) {
  return placements.filter(p => p.type === type).map(p => [p.x, p.y]);
}

//––––– 事前準備 –––––//
// 為面粉建立一個 mapping：key = "x,y" ； value = index（從 0 開始）
// 假設 placements 中面粉數量不多
function buildFlourMapping(placements: Placement[]) {
  const flourPositions = placements.filter(p => p.type === PLACEMENT_TYPE_FLOUR);
  const flourMap = new Map();
  flourPositions.forEach((p, index) => {
    flourMap.set(`${p.x},${p.y}`, index);
  });
  return { flourMap, totalFlours: flourPositions.length };
}

// 為 switchDoor 建立固定順序的 mapping：key = "x,y" ； value = index
function buildSwitchDoorMapping(placements: Placement[]) {
  const doorPlacements = placements.filter(p => p.type === PLACEMENT_TYPE_SWITCH_DOOR);
  const doorMap = new Map();
  doorPlacements.forEach((p, index) => {
    doorMap.set(`${p.x},${p.y}`, index);
  });
  return { doorMap, totalDoors: doorPlacements.length };
}

// 將多個物品（火、水、冰、鑰匙）狀態合併成一個 bit mask
// 我們預設：bit0 = firePickup, bit1 = waterPickup, bit2 = icePickup, bit3 = key
function buildItemMask(hasFire: boolean, hasWater: boolean, hasIce: boolean, hasKey: boolean) {
  let mask = 0;
  if (hasFire) mask |= 1;
  if (hasWater) mask |= 2;
  if (hasIce) mask |= 4;
  if (hasKey) mask |= 8;
  return mask;
}

// 切換所有 switchDoor 狀態：假設每個門用一個 bit 表示，1 表示「關閉」（不可通行），0 表示「開啟」
function toggleSwitchDoorMask(doorMask: number, totalDoors: number) {
  // 反轉所有位元，再與 ((1 << totalDoors) - 1) 相與（只保留 totalDoors 個 bit）
  return (~doorMask) & ((1 << totalDoors) - 1);
}

//––––– 主函式 –––––//
export default function findSolutionPath(gameMap, width, height, placements) {
  console.log("開始路徑搜尋");
  const startPosition = placements.find(p => p.type === PLACEMENT_TYPE_HERO);
  if (!startPosition) {
    console.error("找不到 HERO 位置");
    return null;
  }
  const goalPosition = placements.find(p => p.type === PLACEMENT_TYPE_GOAL);
  if (!goalPosition) {
    console.error("找不到 GOAL 位置");
    return null;
  }

  // 事前準備：面粉 mapping 與 switch door mapping
  const { flourMap, totalFlours } = buildFlourMapping(placements);
  const { doorMap, totalDoors } = buildSwitchDoorMapping(placements);

  // 初始面粉收集：使用 bit mask 表示（全 0 表示未收集）
  let initFlourMask = 0;
  // 初始 switchDoor 狀態：用 bit mask 表示，每個門的預設值從 door 物件中取得
  // 若 door 物件有 isRaised 屬性就採用它，否則預設為 0 (開啟)
  let initDoorMask = 0;
  doorMap.forEach((index, key) => {
    const door = placements.find(p => p.type === PLACEMENT_TYPE_SWITCH_DOOR && `${p.x},${p.y}` === key);
    // 假設 isRaised === true 代表門是「關閉」（即阻擋），我們用 1 表示關閉
    if (door && door.hasOwnProperty("isRaised") ? door.isRaised : false) {
      initDoorMask |= (1 << index);
    }
  });

  // PriorityQueue 中的 state 結構定義如下：
  // [ f, g, x, y, flourMask, itemMask, doorMask, path ]
  // 其中：
  //   - x,y: 當前位置
  //   - flourMask: 已收集面粉的 bit mask
  //   - itemMask: 物品（火、水、冰、鑰匙）狀態
  //   - doorMask: switch door 狀態 bit mask（1=關閉、0=開啟）
  //   - path: 走過的路徑陣列
  const queue = new PriorityQueue((a, b) => a[0] - b[0]);
  const initItemMask = buildItemMask(false, false, false, false);
  const initPath: [number, number][] = [];
  queue.push([
    0,  // f = g + heuristic（初始先 0）
    0,  // g = cost so far
    startPosition.x,
    startPosition.y,
    initFlourMask,
    initItemMask,
    initDoorMask,
    initPath
  ]);
  const visited = new Set();

  while (!queue.isEmpty()) {
    const [f, g, x, y, flourMask, itemMask, doorMask, path] = queue.pop();
    const newPath = [...path, [x, y]];

    // 若所有面粉都已收集：判斷方式是比對 bit mask 是否全 1
    if (flourMask === (1 << totalFlours) - 1 &&
        x === goalPosition.x && y === goalPosition.y) {
      console.log("收集全部面粉並抵達目標，成功！");
      return newPath;
    }

    // 探索四個方向
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      let nx = x + dx, ny = y + dy;
      // 超出邊界
      if (nx < 1 || nx > width || ny < 1 || ny > height) continue;

      const cellType = gameMap[ny - 1][nx - 1];
      if (cellType === PLACEMENT_TYPE_WALL) continue;

      // 若為 switchDoor，則檢查 doorMask 中對應的位元是否為 1（阻擋）
      if (cellType === PLACEMENT_TYPE_SWITCH_DOOR) {
        const doorKey = `${nx},${ny}`;
        const doorIndex = doorMap.get(doorKey);
        if (doorIndex !== undefined) {
          if (doorMask & (1 << doorIndex)) continue;
        }
      }

      // 若為鎖，且 itemMask 中沒取得鑰匙 (bit3)
      if (cellType === PLACEMENT_TYPE_LOCK && !(itemMask & 8)) continue;

      // 先備份各狀態
      let newFlourMask = flourMask;
      let newItemMask = itemMask;
      let newDoorMask = doorMask;

      // 收集面粉：如果該位置在 flourMap 中，則將對應位元設為 1
      const flourKey = `${nx},${ny}`;
      if (flourMap.has(flourKey)) {
        const index = flourMap.get(flourKey);
        newFlourMask |= (1 << index);
      }

      // 處理障礙物：例如火、水，僅當有相應道具時才能通過
      if (cellType === PLACEMENT_TYPE_FIRE && !(itemMask & 1)) continue;
      if (cellType === PLACEMENT_TYPE_WATER && !(itemMask & 2)) continue;

      // 處理 switch：踩到 switch 時，全部 switchDoor 狀態取反
      if (cellType === PLACEMENT_TYPE_SWITCH) {
        newDoorMask = toggleSwitchDoorMask(newDoorMask, totalDoors);
      }

      // 處理拾取道具：火焰、流水、冰、鑰匙等
      // 假設各拾取物件出現在某一位置時，就把對應的 bit 打開
      if (cellType === PLACEMENT_TYPE_FIRE_PICKUP) {
        newItemMask |= 1;
      }
      if (cellType === PLACEMENT_TYPE_WATER_PICKUP) {
        newItemMask |= 2;
      }
      if (cellType === PLACEMENT_TYPE_ICE_PICKUP) {
        newItemMask |= 4;
      }
      if (cellType === PLACEMENT_TYPE_KEY) {
        newItemMask |= 8;
      }

      // 處理 Thief：若遇到小偷，重置所有道具
      if (cellType === PLACEMENT_TYPE_THIEF) {
        newItemMask = 0;
      }

      // 處理 Teleport 與 Conveyor（依原有邏輯處理）
      if (cellType === PLACEMENT_TYPE_TELEPORT) {
        const teleportTargets = placements.filter(p =>
          p.type === PLACEMENT_TYPE_TELEPORT && (p.x !== nx || p.y !== ny)
        );
        if (teleportTargets.length > 0) {
          const tp = teleportTargets[0];
          nx = tp.x;
          ny = tp.y;
          console.log(`Teleported to (${nx}, ${ny})`);
        }
      }
      if (cellType === PLACEMENT_TYPE_CONVEYOR) {
        const conveyor = placements.find(p => p.x === nx && p.y === ny && p.type === PLACEMENT_TYPE_CONVEYOR);
        if (conveyor) {
          const { direction } = conveyor;
          if (direction === "UP") ny -= 1;
          else if (direction === "DOWN") ny += 1;
          else if (direction === "LEFT") nx -= 1;
          else if (direction === "RIGHT") nx += 1;
          console.log(`Conveyor moved to (${nx}, ${ny})`);
        }
      }

      // 檢查 corner-block (外部阻擋: 在 非ice 要往 ice corner 走) 
      const cornerIce = placements.find(p =>
        p.x === nx && p.y === ny && p.type === PLACEMENT_TYPE_ICE && p.corner
      );
      if (cornerIce) {
         // 代表 (nx, ny) 是 corner
        const cornerType = cornerIce.corner;
        const blockedDirections = iceTileCornerBlockedMoves[cornerType];
        if (blockedDirections) {
          const currentDirKey = getDirectionKey([dx, dy]);
          console.log(`User at [${x},${y}] to [${dx}, ${dy}](${currentDirKey}), Corner(${cornerType}) at [${nx}, ${ny}]`);
          if (isCornerSolidForBody(x, y, dx, dy, cornerIce)) {
            // 非 ice tile 到 ice corner
            console.log(`skip! isCornerSolidForBody`);
            continue;
          }
          if (blockedDirections[currentDirKey]) { 
            // ice tile 到 ice corner 但轉不出去(可能輸出方向有牆)
            console.log(`轉向遇到牆壁!`);
            continue;
          }
        }
      }
      // ※ isCornerSolidForBody 可定義在外層（這裡不重複每次定義）

      // 處理 Ice 的連續滑行邏輯
      const [finalX, finalY] = handleIceLogic(
        nx, ny, dx, dy, gameMap, placements, (newItemMask & 4) > 0, width, height
      );
      // 如果 handleIceLogic 回傳跟原位置一樣 => 被 corner 阻擋 /無法前進
      if (finalX === x && finalY === y) continue;

      // 生成新的 state key：用簡短的字串結合數值資訊
      const stateKey = `${finalX},${finalY},${newFlourMask},${newItemMask},${newDoorMask}`;
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);

      const newG = g + 1;
      const newH = heuristicOptimized(finalX, finalY, flourMap, totalFlours, goalPosition);
      queue.push([newG + newH, newG, finalX, finalY, newFlourMask, newItemMask, newDoorMask, newPath]);
    }
  }
  console.log("找不到有效路徑");
  return null;
}

// 改進版啟發函數：用 Manhattan 距離估算，這裡可依需要改成 MST 等更精準估算
function heuristicOptimized(cx, cy, flourMap: Map<string, number>, totalFlours: number, goalPosition) {
  // 找出所有未收集面粉的最小距離，再與目標距離取最小值
  let minDist = Math.abs(goalPosition.x - cx) + Math.abs(goalPosition.y - cy);
  flourMap.forEach((index, key) => {
    // 檢查這個面粉是否收集（在主邏輯中我們用 bit mask 表示，這裡僅作參考，實際上可改用參數傳入的收集狀態）
    // 你也可以傳入當前收集的 mask 來篩選未收集面粉
    const [fx, fy] = key.split(",").map(Number);
    const d = Math.abs(fx - cx) + Math.abs(fy - cy);
    if (d < minDist) minDist = d;
  });
  return minDist;
}
