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

  while (true) {
    // 取得在滑動過程經過的冰
    let nextX = nx + dx;
    let nextY = ny + dy;
    // 邊界檢查
    if (nextX < 1 || nextX > width || nextY < 1 || nextY > height) break;

    const nextTile = gameMap[nextY - 1][nextX - 1];
    const compositeState = combineCellState(nextTile);
    const hasIcePickup = !(itemMask & 4);
    const icePlacementWhileSliding = placements.find(
      (p) => p.x === nx && p.y === ny && p.type === PLACEMENT_TYPE_ICE
    );

    if (icePlacementWhileSliding?.corner) {
      //  當從冰面滑進到 iceCorner ，根據 iceCorner 轉向
      const corner = icePlacementWhileSliding?.corner;
      let newDirection = iceTileCornerRedirection[corner][entryDirection];
      const blockDirection = iceTileCornerBlockedMoves[corner][newDirection];
      console.log(corner, entryDirection, newDirection);
      if (newDirection) {
        // 處理重定向（如果可以從這個方向進入角落）
        console.log(
          `Hero從 ([${nx - dx}, ${
            ny - dy
          }]) ${entryDirection} 進入 ${corner}[${nx}, ${ny}] 轉向至 ${newDirection} `
        );
        // 根據新方向更新dx和dy
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

        // 移動到角落位置
        nextX = nx + dx;
        nextY = ny + dy;
        console.log(`push [${nextX}, ${nextY}]`);
        movingTrace.push([nextX, nextY]);
        // continue;
        // if (nextX === 4 && nextY === 4) {
        //   console.log(
        //     `[${nx - dx}, ${ny - dy}])  向 ${entryDirection}到 [${nx}, ${ny}]`
        //   );
        // }
        // console.log(`向 ${newDirection} 轉至 [${nx + dx}, ${ny + dy}]`);
      } else {
        console.log("被擋");
        console.log(movingTrace);
        console.log(
          `Hero ([${nx - dx}, ${
            ny - dy
          }])進入 ${corner}([${nx}, ${ny}])往 ${entryDirection} 被擋`
        );
        movingTrace.push([nx - dx, ny - dy]);
        return {
          valid: true,
          path: movingTrace,
          itemMask: itemMask,
          flourMask: flourMask,
        };
      }
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
    console.log(
      `[${nx - dx}, ${ny - dy}] -> [${nx}, ${ny}] -> [${nextX}, ${nextY}]`
    );

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
