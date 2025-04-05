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
    return {
      valid: true,
      path: [
        [nx, ny],
        // [nx + dx, ny + dy],
      ],
      itemMask: itemMask,
      flourMask: flourMask,
    };
  }
  let icePlacementsWhileSliding = [];

  while (true) {
    // 取得在滑動過程經過的冰
    let nextX = nx + dx;
    let nextY = ny + dy;
    // 邊界檢查
    if (nextX < 1 || nextX > width || nextY < 1 || nextY > height) break;

    let nextTile = gameMap[nextY - 1][nextX - 1];
    let compositeState = combineCellState(nextTile);
    const hasIcePickup = !(itemMask & 4);
    const icePlacementWhileSliding = placements.find(
      (p) => p.x === nx && p.y === ny && p.type === PLACEMENT_TYPE_ICE
    );
    icePlacementsWhileSliding.push(icePlacementWhileSliding);
    console.log(icePlacementsWhileSliding);

    // 如果連續遇到 iceCorner 則持續處理轉向
  while (compositeState.iceCorner) {
    const corner = compositeState.iceCorner;
    let newDirection = iceTileCornerRedirection[corner][entryDirection];
    if (!newDirection) {
      // 如果轉向無效則退回原位，結束滑行
      movingTrace.push([nx, ny]);
      return {
        valid: true,
        path: movingTrace,
        itemMask: itemMask,
        flourMask: flourMask,
      };
    }

    // 根據新的方向更新 dx, dy 與 entryDirection
    switch (newDirection) {
      case DIRECTION_RIGHT:
        dx = 1;
        dy = 0;
        break;
      case DIRECTION_LEFT:
        dx = -1;
        dy = 0;
        break;
      case DIRECTION_DOWN:
        dx = 0;
        dy = 1;
        break;
      case DIRECTION_UP:
        dx = 0;
        dy = -1;
        break;
    }
    entryDirection = newDirection;
    
    // 移動到角落位置（加入轉向後的那一步）
    nextX = nextX + dx;
    nextY = nextY + dy;
    movingTrace.push([nextX, nextY]);
    
    // 更新 compositeState 以檢查下一格是否仍為 iceCorner
    if (nextX < 1 || nextX > width || nextY < 1 || nextY > height) break;
    nextTile = gameMap[nextY - 1][nextX - 1];
    compositeState = combineCellState(nextTile);
  }

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
      return {
        valid: true,
        path: movingTrace,
        itemMask: 0,
        flourMask: flourMask,
      };
    }

    // 繼續滑行
    // console.log(
    //   `[${nx - dx}, ${ny - dy}] -> [${nx}, ${ny}] -> [${nextX}, ${nextY}]`
    // );

    nx = nextX;
    ny = nextY;
    movingTrace.push([nx, ny]);

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
