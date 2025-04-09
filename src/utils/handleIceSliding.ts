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

  // 如果有hasIcePickup，則不滑動（僅返回起始位置）
  if (hasIcePickup) {
    // TODO: corner 不可跨越
    return {
      valid: true,
      path: movingTrace,
      itemMask: itemMask,
      flourMask: flourMask,
    };
  }

  // 使用訪問集合來檢測迴圈
  let visited = new Set<string>();

  while (true) {
    // 計算下一格座標
    let nextX = nx + dx;
    let nextY = ny + dy;

    // 邊界檢查
    if (nextX < 1 || nextX > width || nextY < 1 || nextY > height) break;

    // 檢查是否存在無窮迴圈
    const stateKey = `${nx},${ny},${dx},${dy},${itemMask}`;
    if (visited.has(stateKey)) {
      console.error("檢測到無窮迴圈");
      break;
    }
    visited.add(stateKey);

    // 獲取下一格的狀態
    let nextTile = gameMap[nextY - 1][nextX - 1];
    let compositeState = combineCellState(nextTile);

    // 從 placements 中尋找當前位置是否有冰角
    let icePlacementWhileSliding = placements.find(
      (p) => p.x === nx && p.y === ny && p.type === PLACEMENT_TYPE_ICE
    );

    // 處理冰角轉向邏輯
    while (icePlacementWhileSliding?.corner) {
      const corner = icePlacementWhileSliding.corner;
      const newDirection =
        corner && iceTileCornerRedirection[corner][entryDirection];

      if (newDirection) {
        // 根據新方向更新 dx 和 dy
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
        nextX = nx + dx;
        nextY = ny + dy;
        console.log(
          `Hero 在 ${corner} [${nx},${ny}] 往 ${entryDirection}  轉向至  [${nextX},${nextY}]`
        );

        // 邊界檢查（轉向後）
        if (nextX < 1 || nextX > width || nextY < 1 || nextY > height) {
          break;
        }
        // movingTrace.push([nextX, nextY]);

        // nextTile = gameMap[nextY - 1][nextX - 1];
        // compositeState = combineCellState(nextTile);
        // 更新位置至角落 tile
        nx = nextX;
        ny = nextY;

        // 更新冰角資訊，這一步很關鍵，確保檢查新位置是否存在角落
        icePlacementWhileSliding = placements.find(
          (p) => p.x === nx && p.y === ny && p.type === PLACEMENT_TYPE_ICE
        );
      } else {
        console.log(
          `Hero 在 [${nx},${ny}] 往 ${entryDirection} 被角落${corner}阻擋`
        );
        movingTrace.push([nx - dx, ny - dy]);
        return {
          valid: true,
          path: movingTrace,
          itemMask: itemMask,
          flourMask: flourMask,
        };
      }
      // 更新位置到角落 tile
      nx = nextX;
      ny = nextY;
      movingTrace.push([nx, ny]);
      compositeState = combineCellState(gameMap[ny - 1][nx - 1]);
      // 更新下一步
      // nextX = nx + dx;
      // nextY = ny + dy;
    }

    // 撿到 FLOUR
    if (compositeState.flour) {
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

    // 道具收集
    if (compositeState.firePickup) itemMask |= 1;
    if (compositeState.waterPickup) itemMask |= 2;
    if (compositeState.icePickup) itemMask |= 4;
    if (compositeState.blueKey) itemMask |= 8;
    if (compositeState.greenKey) itemMask |= 16;

    // 升降門邏輯
    if (compositeState.switchDoor) {
      const doorKey = `${nextX},${nextY}`;
      const doorIndex = doorMap.get(doorKey);
      if (doorIndex !== undefined) {
        if (doorMask & (1 << doorIndex)) break;
      }
    }

    // 危險區域檢查
    if (compositeState.water && !(itemMask & 2)) {
      console.log("滑進水裡");
      return {
        valid: false,
        path: [],
        itemMask: itemMask,
        flourMask: flourMask,
      };
    }

    if (compositeState.fire && !(itemMask & 1)) {
      console.log("滑進火裡");
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
      }
    }

    // 如果滑進 THIEF，itemMask 清空，但整個路徑有效
    if (compositeState.thief) {
      movingTrace.push([nextX, nextY]);

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

function processIceCorner(corner: string, entryDirection: string) {
  const newDirection = iceTileCornerRedirection[corner][entryDirection];
  if (!newDirection || iceTileCornerBlockedMoves[corner][entryDirection]) {
    return null;
  }
  let newDx = 0,
    newDy = 0;
  switch (newDirection) {
    case DIRECTION_RIGHT:
      newDx = 1;
      break;
    case DIRECTION_LEFT:
      newDx = -1;
      break;
    case DIRECTION_DOWN:
      newDy = 1;
      break;
    case DIRECTION_UP:
      newDy = -1;
      break;
  }
  return { newDirection, newDx, newDy };
}

function stateKey(x: number, y: number, dx: number, dy: number, mask: number) {
  return `${x},${y},${dx},${dy},${mask}`;
}
