import {
  iceTileCornerBlockedMoves,
  iceTileCornerRedirection,
} from "@/game-objects/IcePlacement";
import { buildFlourMapping, combineCellState } from "./findSolutionPath";
import {
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  PLACEMENT_TYPE_CONVEYOR,
  PLACEMENT_TYPE_ICE,
} from "@/helpers/consts";
import { PlacementConfig } from "@/types/global";

export function handleIceSliding(
  placements: PlacementConfig[],
  gameMap: string[][],
  width: number,
  height: number,
  dx: number,
  dy: number,
  initialX: number,
  initialY: number,
  itemMask: number,
  doorMap: Map<string, number>,
  doorMask: number,
  flourMask: number,
  iceCorner?: string
): {
  valid: boolean;
  path: number[][];
  itemMask: number;
  flourMask: number;
} {
  let nx = initialX;
  let ny = initialY;
  const movingTrace: number[][] = [[nx, ny]];
  const hasIcePickup = itemMask & 4;
  let entryDirection = getHeroDirection(dx, dy);
  const { flourMap, totalFlours } = buildFlourMapping(placements);
  if (hasIcePickup) {
    // TODO: corner 不可跨越
    return {
      valid: true,
      path: movingTrace,
      itemMask: itemMask,
      flourMask: flourMask,
    };
  }

  let currentTile = gameMap[ny - 1][nx - 1];
  let compositeState = combineCellState(currentTile);
  let visited = new Set<string>();

  // 首先檢查起始 tile 是否有 iceCorner（轉向觸發）
  // 換句話講就是踩到的第一個冰面就有 CORNER
  if (compositeState.iceCorner) {
    const result = processIceCorner(
      compositeState.iceCorner,
      entryDirection,
    
    );
    if (!result) {
      console.log(`Hero 在 [${nx},${ny}] 被角落阻擋`);
      return { valid: true, path: movingTrace, itemMask, flourMask };
    }
    // 更新位置至此角落 tile（觸發 CORNER 轉向，不再依照普通 ICE 往前滑行）
    entryDirection = result.newDir;
    dx = result.newDx;
    dy = result.newDy;

    // 清除角落標記，避免重複觸發
    // compositeState.iceCorner = undefined;
  }

  while (true) {
    // 計算下一格座標
    let nextX = nx + dx;
    let nextY = ny + dy;
    // 邊界檢查
    if (nextX < 1 || nextX > width || nextY < 1 || nextY > height) break;

    let nextTile = gameMap[nextY - 1][nextX - 1];
    let compositeState = combineCellState(nextTile);

    // 檢查循環狀態
    const key = stateKey(nx, ny, dx, dy, itemMask);
    if (visited.has(key)) {
      console.error("檢測到無窮迴圈");
      break;
    }
    visited.add(key);

    // 若下一格有 iceCorner，表示需要轉向
    // 若下一格具有 iceCorner，將其僅作為轉向觸發點
    // 如果下一格有角落，處理角落轉向，並連續滑行多步
    while (compositeState.iceCorner) {
      const result = processIceCorner(
        compositeState.iceCorner,
        entryDirection,
       
      );
      if (!result) {
        console.log(`Hero 在 [${nx},${ny}] 往 [${nextX},${nextY}] 被角落阻擋`);
        return { valid: true, path: movingTrace, itemMask, flourMask };
      }
      entryDirection = result.newDirection;
      dx = result.newDx;
      dy = result.newDy;
      // 更新位置到角落 tile
      nx = nextX;
      ny = nextY;
      movingTrace.push([nx, ny]);
      compositeState = combineCellState(gameMap[ny - 1][nx - 1]);
      // 更新下一步
      nextX = nx + dx;
      nextY = ny + dy;
    }

    // 撿到 FLOUR
    if (compositeState.flour) {
      // console.log(`滑到 flour [${nextX},${nextY}]`);
      const flourKey = `${nextX},${nextY}`;
      if (flourMap.has(flourKey)) {
        const index = flourMap.get(flourKey);
        flourMask |= 1 << index;
      }
    }

    // 遇到牆壁停止
    if (compositeState.wall) break;

    // 滑到鎖沒鑰匙則停止
    if (compositeState.blueLock && !(itemMask & 8)) break;

    if (compositeState.greenLock && !(itemMask & 16)) break;

    if (compositeState.firePickup) itemMask |= 1;

    if (compositeState.waterPickup) itemMask |= 2;

    if (compositeState.icePickup) itemMask |= 4;

    if (compositeState.blueKey) itemMask |= 8;

    if (compositeState.greenKey) itemMask |= 16;

    if (compositeState.switchDoor) {
      // 滑到升降門升起則停止
      const doorKey = `${nx},${ny}`;
      const doorIndex = doorMap.get(doorKey);
      if (doorIndex !== undefined) {
        if (doorMask & (1 << doorIndex)) break;
      }
    }

    // 如果滑進水，沒有對應 pickup ，整個路徑無效
    if (compositeState.water && !(itemMask & 2)) {
      console.log("滑進水裡");
      return {
        valid: false,
        path: [],
        itemMask: itemMask,
        flourMask: flourMask,
      };
    }
    // 如果滑進火，沒有對應 pickup ，則整個路徑無效
    if (compositeState.fire && !(itemMask & 1)) {
      return {
        valid: false,
        path: [],
        itemMask: itemMask,
        flourMask: flourMask,
      };
    }

    // 處理 Conveyor
    if (compositeState.conveyor) {
      const conveyor = placements.find(
        (p) =>
          p.x === nextX && p.y === nextY && p.type === PLACEMENT_TYPE_CONVEYOR
      );

      if (conveyor) {
        const { direction } = conveyor;
        if (direction === "UP") nextY -= 1;
        else if (direction === "DOWN") nextY += 1;
        else if (direction === "LEFT") nextX -= 1;
        else if (direction === "RIGHT") nextX += 1;
        // console.log(`Conveyor moved to (${nx}, ${ny})`);
      }
    }

    // 如果滑進 THIEF，itemMask 清空，但整個路徑有效
    if (compositeState.thief) {
      // console.log("踩到冰滑進  THIEF", movingTrace);
      movingTrace.push([nextX, nextY])
      return {
        valid: true,
        path: movingTrace,
        itemMask: 0,
        flourMask: flourMask,
      };
    }

    nx = nextX;
    ny = nextY;
    movingTrace.push([nx, ny]);
    compositeState = combineCellState(gameMap[ny - 1][nx - 1]);
    // 如果下一格不是冰，停止滑行
    if (!compositeState.ice) {
      break;
    }
  }

  return {
    valid: true,
    path: movingTrace,
    itemMask: itemMask,
    flourMask: flourMask,
  };
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

function processIceCorner(
  corner: string,
  entryDirection: string,
) {
  const newDirection = iceTileCornerRedirection[corner][entryDirection];
    if (!newDirection || iceTileCornerBlockedMoves[corner][entryDirection]) {
      return null;
    }
    let newDx = 0, newDy = 0;
    switch (newDirection) {
      case DIRECTION_RIGHT: newDx = 1; break;
      case DIRECTION_LEFT: newDx = -1; break;
      case DIRECTION_DOWN: newDy = 1; break;
      case DIRECTION_UP: newDy = -1; break;
    }
    return { newDirection, newDx, newDy };
}

function stateKey(x: number, y: number, dx: number, dy: number, mask: number) {
  return `${x},${y},${dx},${dy},${mask}`;
}
