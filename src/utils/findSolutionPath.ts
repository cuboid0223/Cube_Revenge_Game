import {
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  directionUpdateMap,
  PLACEMENT_TYPE_CIABATTA,
  PLACEMENT_TYPE_CIABATTA_SPAWN,
  PLACEMENT_TYPE_CONVEYOR,
  PLACEMENT_TYPE_ENEMY_DOWN_SPAWN,
  PLACEMENT_TYPE_ENEMY_FLYING_DOWN_SPAWN,
  PLACEMENT_TYPE_ENEMY_FLYING_LEFT_SPAWN,
  PLACEMENT_TYPE_ENEMY_FLYING_RIGHT_SPAWN,
  PLACEMENT_TYPE_ENEMY_FLYING_UP_SPAWN,
  PLACEMENT_TYPE_ENEMY_LEFT_SPAWN,
  PLACEMENT_TYPE_ENEMY_RIGHT_SPAWN,
  PLACEMENT_TYPE_ENEMY_ROAMING_SPAWN,
  PLACEMENT_TYPE_ENEMY_UP_SPAWN,
  PLACEMENT_TYPE_FIRE,
  PLACEMENT_TYPE_FIRE_PICKUP,
  PLACEMENT_TYPE_FLOUR,
  PLACEMENT_TYPE_FLYING_ENEMY,
  PLACEMENT_TYPE_GOAL,
  PLACEMENT_TYPE_GOAL_ENABLED,
  PLACEMENT_TYPE_GROUND_ENEMY,
  PLACEMENT_TYPE_HERO,
  PLACEMENT_TYPE_HERO_SPAWN,
  PLACEMENT_TYPE_ICE,
  PLACEMENT_TYPE_ICE_PICKUP,
  PLACEMENT_TYPE_KEY,
  PLACEMENT_TYPE_LOCK,
  PLACEMENT_TYPE_ROAMING_ENEMY,
  PLACEMENT_TYPE_SWITCH,
  PLACEMENT_TYPE_SWITCH_DOOR,
  PLACEMENT_TYPE_TELEPORT,
  PLACEMENT_TYPE_THIEF,
  PLACEMENT_TYPE_WALL,
  PLACEMENT_TYPE_WATER,
  PLACEMENT_TYPE_WATER_PICKUP,
  PLACEMENT_TYPES_CODE,
} from "@/helpers/consts";
import PriorityQueue from "./PriorityQueue";
import {
  iceTileCornerBlockedMoves,
  iceTileCornerRedirection,
} from "@/game-objects/IcePlacement";
import {
  ExtendedPlacementConfig,
  LevelStateSnapshot,
  PlacementConfig,
} from "@/types/global";
import { handleIceSliding } from "./handleIceSliding";

function getOutputType(
  type: string,
  corner?: string,
  direction?: string,
  color?: string,
  isRaised?: boolean
): string {
  // 將OBJECT轉換成字串
  // eg. {type: 'ICE', x: 15, y: 5, corner:"TOP_LEFT"} -> "ICE:TOP_LEFT"
  switch (type) {
    case PLACEMENT_TYPE_ICE:
      return corner ? `${type}:${corner}` : type;
    case PLACEMENT_TYPE_CONVEYOR:
      return direction ? `${type}:${direction}` : type;
    case PLACEMENT_TYPE_KEY:
      return color ? `${type}:${color}` : `${type}:BLUE`;
    case PLACEMENT_TYPE_LOCK:
      return color ? `${type}:${color}` : `${type}:BLUE`;
    case PLACEMENT_TYPE_SWITCH_DOOR:
      return isRaised ? `${type}_1` : `${type}_0`;
    case PLACEMENT_TYPE_ENEMY_LEFT_SPAWN:
      return "GROUND_ENEMY:LEFT";
    case PLACEMENT_TYPE_ENEMY_RIGHT_SPAWN:
      return "GROUND_ENEMY:RIGHT";
    case PLACEMENT_TYPE_ENEMY_UP_SPAWN:
      return "GROUND_ENEMY:UP";
    case PLACEMENT_TYPE_ENEMY_DOWN_SPAWN:
      return "GROUND_ENEMY:DOWN";
    case PLACEMENT_TYPE_ENEMY_FLYING_LEFT_SPAWN:
      return "FLYING_ENEMY:LEFT";
    case PLACEMENT_TYPE_ENEMY_FLYING_RIGHT_SPAWN:
      return "FLYING_ENEMY:RIGHT";
    case PLACEMENT_TYPE_ENEMY_FLYING_UP_SPAWN:
      return "FLYING_ENEMY:UP";
    case PLACEMENT_TYPE_ENEMY_FLYING_DOWN_SPAWN:
      return "FLYING_ENEMY:DOWN";
    case PLACEMENT_TYPE_ENEMY_ROAMING_SPAWN:
      return PLACEMENT_TYPE_ROAMING_ENEMY;
    case PLACEMENT_TYPE_CIABATTA_SPAWN:
      return PLACEMENT_TYPE_CIABATTA;
    default:
      return type;
  }
}

// 簡化地圖為二維矩陣，並記錄所有物件位置
export function createMap(level: LevelStateSnapshot): {
  gameMap: string[][];
  placements: ExtendedPlacementConfig[];
} {
  /*
            x (width)
            ------------
  y(height) |
            |
            |
            |
  
  */
  const { tilesWidth: width, tilesHeight: height, placements } = level;
  const gameMap = Array.from({ length: height }, () => Array(width).fill(""));
  console.log(placements);
  placements.forEach(({ x, y, type, corner, color, direction, isRaised }) => {
    const adjustedX = x - 1;
    const adjustedY = y - 1;
    if (
      adjustedX >= 0 &&
      adjustedX < width &&
      adjustedY >= 0 &&
      adjustedY < height
    ) {
      const outputType = getOutputType(
        type,
        corner,
        direction,
        color,
        isRaised
      );

      if (gameMap[adjustedY][adjustedX].length !== 0) {
        // 同個位置有兩個 placements
        gameMap[adjustedY][
          adjustedX
        ] = `${gameMap[adjustedY][adjustedX]}&${outputType}`;
      } else {
        gameMap[adjustedY][adjustedX] = outputType;
      }
    }
  });

  return { gameMap, placements };
}

// 查找指定物件所有位置
export function findPositions(placements: PlacementConfig[], type: string) {
  return placements.filter((p) => p.type === type).map((p) => [p.x, p.y]);
}

export function getPlacementAt(
  placements: PlacementConfig[],
  type: string,
  x: number,
  y: number
): PlacementConfig | undefined {
  return placements.find((p) => p.x === x && p.y === y && p.type === type);
}

export function getHeroDirection(dx: number, dy: number) {
  let entryDirection = "";
  // 根據移動方向確定進入方向
  if (dx > 0) {
    // 向右移動，從左側進入
    entryDirection = DIRECTION_RIGHT;
  } else if (dx < 0) {
    // 向左移動，從右側進入
    entryDirection = DIRECTION_LEFT;
  } else if (dy > 0) {
    // 向下移動，從上方進入
    entryDirection = DIRECTION_DOWN;
  } else if (dy < 0) {
    // 向上移動，從下方進入
    entryDirection = DIRECTION_UP;
  }

  return entryDirection;
}

//––––– 事前準備 –––––//
// 為面粉建立一個 mapping：key = "x,y" ； value = index（從 0 開始）
// 假設 placements 中面粉數量不多
export function buildFlourMapping(placements: PlacementConfig[]) {
  const flourPositions = placements.filter(
    (p) => p.type === PLACEMENT_TYPE_FLOUR
  );
  const flourMap = new Map();
  flourPositions.forEach((p, index) => {
    flourMap.set(`${p.x},${p.y}`, index);
  });
  return { flourMap, totalFlours: flourPositions.length };
}

// 為 switchDoor 建立固定順序的 mapping：key = "x,y" ； value = index
function buildSwitchDoorMapping(placements: PlacementConfig[]) {
  const doorPlacements = placements.filter(
    (p) => p.type === PLACEMENT_TYPE_SWITCH_DOOR
  );
  const doorMap = new Map();
  doorPlacements.forEach((p, index) => {
    doorMap.set(`${p.x},${p.y}`, index);
  });
  return { doorMap, totalDoors: doorPlacements.length };
}

// 將多個物品（火、水、冰、鑰匙）狀態合併成一個 bit mask
// 預設：bit0 = firePickup, bit1 = waterPickup, bit2 = icePickup, bit3 = blueKey,bit4 = greenKey
function buildItemMask(
  hasFire: boolean,
  hasWater: boolean,
  hasIce: boolean,
  hasBlueKey: boolean,
  hasGreenKey: boolean
) {
  let mask = 0;
  if (hasFire) mask |= 1;
  if (hasWater) mask |= 2;
  if (hasIce) mask |= 4;
  if (hasBlueKey) mask |= 8;
  if (hasGreenKey) mask |= 16;
  return mask;
}

// 切換所有 switchDoor 狀態：假設每個門用一個 bit 表示，1 表示「關閉」（不可通行），0 表示「開啟」
function toggleSwitchDoorMask(doorMask: number, totalDoors: number) {
  // 反轉所有位元，再與 ((1 << totalDoors) - 1) 相與（只保留 totalDoors 個 bit）
  return ~doorMask & ((1 << totalDoors) - 1);
}

export interface CompositeCellState {
  wall: boolean;
  water: boolean;
  fire: boolean;
  ice: boolean;
  iceCorner?: string;
  conveyor: boolean;
  conveyorDir?: string;
  teleport: boolean;
  thief: boolean;
  switch: boolean;
  switchDoor: boolean;
  blueLock: boolean;
  greenLock: boolean;
  waterPickup: boolean;
  firePickup: boolean;
  icePickup: boolean;
  flour: boolean;
  blueKey: boolean;
  greenKey: boolean;
  types: string[];
}

export function combineCellState(cell: string): CompositeCellState {
  // 同一個位置可能有兩個物件透過 "&" 區隔
  // eg. ICE&FLOUR 或是 ICE:TOP_LEFT&FIRE_PICKUP

  // 拆分 cell 字串，移除空白與空值
  const types = cell
    .split("&")
    .map((s) => s.trim())
    .filter((s) => s !== "");

  const state: CompositeCellState = {
    types,
    wall: types.includes(PLACEMENT_TYPE_WALL),
    water: types.includes(PLACEMENT_TYPE_WATER),
    fire: types.includes(PLACEMENT_TYPE_FIRE),
    ice: types.includes(PLACEMENT_TYPE_ICE),
    conveyor: types.includes(PLACEMENT_TYPE_CONVEYOR),
    teleport: types.includes(PLACEMENT_TYPE_TELEPORT),
    thief: types.includes(PLACEMENT_TYPE_THIEF),
    switch: types.includes(PLACEMENT_TYPE_SWITCH),
    switchDoor: types.includes(PLACEMENT_TYPE_SWITCH_DOOR),
    blueLock: types.includes(PLACEMENT_TYPE_LOCK + ":BLUE"),
    greenLock: types.includes(PLACEMENT_TYPE_LOCK + ":GREEN"),
    waterPickup: types.includes(PLACEMENT_TYPE_WATER_PICKUP),
    firePickup: types.includes(PLACEMENT_TYPE_FIRE_PICKUP),
    icePickup: types.includes(PLACEMENT_TYPE_ICE_PICKUP),
    flour: types.includes(PLACEMENT_TYPE_FLOUR),
    blueKey: types.includes(PLACEMENT_TYPE_KEY + ":BLUE"),
    greenKey: types.includes(PLACEMENT_TYPE_KEY + ":GREEN"),
  };

  // 檢查所有拆解出來的 type，若包含 ICE（可能帶有角落資訊）
  types.forEach((t) => {
    // 若 t 以 "ICE:" 開頭，則拆分出角落資訊
    if (t.startsWith(PLACEMENT_TYPE_ICE + ":")) {
      state.ice = true;
      const parts = t.split(":");
      if (parts.length > 1) {
        state.iceCorner = parts[1]; // 例如 "TOP_LEFT", "TOP_RIGHT" 等
      }
    } else if (t === PLACEMENT_TYPE_ICE) {
      // 普通冰
      state.ice = true;
    }
  });

  types.forEach((t) => {
    // 若 t 以 "CONVEYOR:" 開頭，則拆分出方向資訊
    if (t.startsWith(PLACEMENT_TYPE_CONVEYOR + ":")) {
      state.conveyor = true;
      const parts = t.split(":");
      if (parts.length > 1) {
        state.conveyorDir = parts[1]; // 例如 "TOP_LEFT", "TOP_RIGHT" 等
      }
    } else if (t === PLACEMENT_TYPE_CONVEYOR) {
      // 預設往右
      state.conveyorDir = "RIGHT";
    }
  });

  return state;
}

//––––– 主函式 –––––//
type SolutionPathType = [number, number][];

export default function findSolutionPath(
  gameMap: string[][],
  width: number,
  height: number,
  placements: PlacementConfig[]
): SolutionPathType {
  console.log("開始路徑搜尋");
  const startPosition = placements.find(
    (p) =>
      p.type === PLACEMENT_TYPE_HERO || p.type === PLACEMENT_TYPE_HERO_SPAWN
  );
  if (!startPosition) {
    console.error("找不到 HERO 位置");
    return [];
  }
  const goalPosition = placements.find(
    (p) =>
      p.type === PLACEMENT_TYPE_GOAL || p.type === PLACEMENT_TYPE_GOAL_ENABLED
  );
  if (!goalPosition) {
    console.error("找不到 GOAL 位置");
    return [];
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
    const door = placements.find(
      (p) => p.type === PLACEMENT_TYPE_SWITCH_DOOR && `${p.x},${p.y}` === key
    );
    // 假設 isRaised === true 代表門是「關閉」（即阻擋），我們用 1 表示關閉
    if (door && door.hasOwnProperty("isRaised") ? door.isRaised : false) {
      initDoorMask |= 1 << index;
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
  const initItemMask = buildItemMask(false, false, false, false, false);
  const initPath: SolutionPathType = [];
  queue.push([
    0, // f = g + heuristic（初始先 0）
    0, // g = cost so far
    startPosition.x,
    startPosition.y,
    initFlourMask,
    initItemMask,
    initDoorMask,
    initPath,
  ]);
  const visited = new Set();
  let longestPath = [];
  while (!queue.isEmpty()) {
    const [f, g, x, y, flourMask, itemMask, doorMask, path] = queue.pop();
    const newPath = [...path, [x, y]];

    if (longestPath.length < newPath.length) {
      longestPath = newPath;
    }

    // 若所有面粉都已收集：判斷方式是比對 bit mask 是否全 1
    if (
      flourMask === (1 << totalFlours) - 1 &&
      x === goalPosition.x &&
      y === goalPosition.y
    ) {
      // console.log("收集全部面粉並抵達目標，成功！");
      console.log(newPath);
      return newPath;
    }

    // 探索四個方向
    for (let [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      let nx = x + dx,
        ny = y + dy;
      // 超出邊界
      if (nx < 1 || nx > width || ny < 1 || ny > height) continue;
      let cell = gameMap[ny - 1][nx - 1];
      let compositeState = combineCellState(cell);
      // 先備份各狀態
      let newFlourMask = flourMask;
      let newItemMask = itemMask;
      let newDoorMask = doorMask;

      if (compositeState.wall) continue;

      // 處理 Conveyor
      // note1: 需放在處理ICE之前，確保走到conveyor 被移到 ICE 能正常
      if (compositeState.conveyor) {
        const direction = compositeState.conveyorDir as string;
        if (direction === "UP") ny -= 1;
        else if (direction === "DOWN") ny += 1;
        else if (direction === "LEFT") nx -= 1;
        else if (direction === "RIGHT") nx += 1;
        dx = directionUpdateMap[direction].x;
        dy = directionUpdateMap[direction].y;
      }

      // 若為冰面
      if (compositeState.ice) {
        const iceResult = handleIceSliding(
          placements,
          gameMap,
          width,
          height,
          dx,
          dy,
          nx,
          ny,
          newItemMask,
          doorMap,
          doorMask,
          flourMask,
          compositeState.iceCorner
        );

        if (!iceResult.valid) {
          // 如果冰面路徑無效，跳過這個移動
          continue;
        }
        newItemMask = iceResult.itemMask;
        newFlourMask = iceResult.flourMask;

        // console.log(iceResult.path);

        // 更新位置為最後滑行的位置
        nx = iceResult.path[iceResult.path.length - 1][0];
        ny = iceResult.path[iceResult.path.length - 1][1];
        compositeState = combineCellState(gameMap[ny - 1][nx - 1]);
      }

      // 若為 switchDoor，則檢查 doorMask 中對應的位元是否為 1（阻擋）
      if (compositeState.switchDoor) {
        const doorKey = `${nx},${ny}`;
        const doorIndex = doorMap.get(doorKey);
        if (doorIndex !== undefined) {
          if (doorMask & (1 << doorIndex)) continue;
        }
      }

      // 若為鎖，且 itemMask 中沒取得鑰匙 (bit3)
      if (compositeState.blueLock) {
        const hasBlueKey = newItemMask & 8;
        // console.log(`遇到藍鎖([${nx}${ny}])，有鑰匙 ${hasBlueKey}`);
        if (!(newItemMask & 8)) continue;
      }
      if (compositeState.greenLock) {
        const hasGreenKey = newItemMask & 16;
        // console.log(`遇到綠鎖([${nx}${ny}])，有鑰匙 ${hasGreenKey}`);
        if (!(newItemMask & 16)) continue;
      }

      // 如火、水，僅當有相應道具時才能通過
      if (compositeState.fire && !(newItemMask & 1)) continue;

      if (compositeState.water && !(newItemMask & 2)) continue;

      // 處理 switch：踩到 switch 時，全部 switchDoor 狀態取反
      if (compositeState.switch) {
        newDoorMask = toggleSwitchDoorMask(newDoorMask, totalDoors);
      }

      // 收集面粉：如果該位置在 flourMap 中，則將對應位元設為 1

      if (compositeState.flour) {
        const flourKey = `${nx},${ny}`;
        if (flourMap.has(flourKey)) {
          const index = flourMap.get(flourKey);
          newFlourMask |= 1 << index;
        }
      }
      // 處理拾取道具：火焰、流水、冰、鑰匙等
      // 假設各拾取物件出現在某一位置時，就把對應的 bit 打開
      if (compositeState.firePickup) newItemMask |= 1;

      if (compositeState.waterPickup) newItemMask |= 2;

      if (compositeState.icePickup) newItemMask |= 4;

      if (compositeState.blueKey) newItemMask |= 8;

      if (compositeState.greenKey) newItemMask |= 16;

      // 處理 Teleport
      if (compositeState.teleport) {
        const teleportTargets = placements.filter(
          (p) => p.type === PLACEMENT_TYPE_TELEPORT
        );
        if (teleportTargets.length > 0) {
          // 計算目前傳送門的 index
          const currentIndex = teleportTargets.findIndex(
            (p) => p.x === nx && p.y === ny
          );

          // 計算下一個傳送門的 index，並處理循環
          const nextIndex = (currentIndex + 1) % teleportTargets.length;
          const tp = teleportTargets[nextIndex];

          nx = tp.x;
          ny = tp.y;
          // console.log(`Teleported to (${nx}, ${ny})`);
        }
      }

      // 處理 Thief：若遇到小偷，重置所有道具
      if (compositeState.thief) {
        newItemMask = 0;
      }

      // 生成新的 state key：用簡短的字串結合數值資訊

      const stateKey = `${nx},${ny},${newFlourMask},${newItemMask},${newDoorMask}`;
      if (visited.has(stateKey)) continue;
      visited.add(stateKey);

      const newG = g + 1;
      const newH = heuristicOptimized(
        nx,
        ny,
        flourMap,
        totalFlours,
        goalPosition
      );
      queue.push([
        newG + newH,
        newG,
        nx,
        ny,
        newFlourMask,
        newItemMask,
        newDoorMask,
        newPath,
      ]);
    }
  }

  console.log(longestPath);
  console.log("找不到有效路徑");
  return [];
}

// 改進版啟發函數：用 Manhattan 距離估算，這裡可依需要改成 MST 等更精準估算
function heuristicOptimized(
  cx,
  cy,
  flourMap: Map<string, number>,
  totalFlours: number,
  goalPosition
) {
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
