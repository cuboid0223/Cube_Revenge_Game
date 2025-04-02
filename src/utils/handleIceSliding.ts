import {
  iceTileCornerBlockedMoves,
  iceTileCornerRedirection,
} from "@/game-objects/IcePlacement";
import { combineCellState } from "./findSolutionPath";
import {
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
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
  iceCorner?: string
): { valid: boolean; path: number[][]; itemMask: number } {
  let nx = initialX;
  let ny = initialY;
  const movingTrace: number[][] = [[nx, ny]];
  const hasIcePickup = itemMask & 4;
  let entryDirection = getHeroDirection(dx, dy);

  while (true) {
     // 取得在滑動過程經過的冰
    const icePlacementWhileSliding = placements.find(
      (p) => p.x === nx && p.y === ny && p.type === PLACEMENT_TYPE_ICE
    );
    console.log(icePlacementWhileSliding)
    // 處理撞到柵欄(corner)
    // 處理進入角落的情況
    if (icePlacementWhileSliding?.corner) {
      console.log(`在滑動過程遇到的 ${icePlacementWhileSliding?.corner}`)
      const corner = icePlacementWhileSliding?.corner
      // 確定進入方向
      // 這裡需要注意：我們要看的是「我們從哪個方向進入目標格子」

      // 檢查這個進入方向是否被阻擋
      if (iceTileCornerBlockedMoves[corner][entryDirection]) {
        // 如果進入被阻擋，停止滑行
        // nextX = nextX - dx
        // nextY = nextY - dy
        console.log(
          `HERO 在[${nx}, ${ny}]要往 ${entryDirection} 走到 [${nx + dx}, ${ny + dy}]，但是被 CORNER([${nx}, ${ny}]) 阻擋`
        );
        break;
      }

      // 處理重定向（如果可以從這個方向進入角落）
      if (corner && nx === 4 && ny ===9 ) {
        console.log(
          `${corner} 在 [${nx}, ${ny}], HERO 前進方向為 ${entryDirection} 走到 [${nx + dx}, ${ny + dy}]`
        );
        console.log(`${iceTileCornerRedirection[corner][entryDirection]}`);
      }

      if (
        iceTileCornerRedirection[corner] &&
        iceTileCornerRedirection[corner][entryDirection]
      ) {
        // 獲取新的方向
        const newDirection =
          iceTileCornerRedirection[corner][entryDirection];

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
        // nextX = nextX + dx;
        // nextY = nextY + dy;
        // movingTrace.push([nextX, nextY]);
        console.log(`向 ${newDirection} 轉至 [${nx + dx}, ${ny + dy}]`);
        // 跳過當前迭代的剩餘部分，使用新方向繼續
        //break;
      }
    }

    let nextX = nx + dx;
    let nextY = ny + dy;

    // 邊界檢查
    if (nextX < 1 || nextX > width || nextY < 1 || nextY > height) {
      break;
    }
   
    // 處理 ice pickup
    if (hasIcePickup) {
    }

    const nextTile = gameMap[nextY - 1][nextX - 1];
    const compositeState = combineCellState(nextTile);

    // 遇到牆壁停止
    if (compositeState.wall) {
      break;
    }
    // 滑到鎖沒鑰匙則停止
    if (compositeState.blueLock && !(itemMask & 8)) {
      console.log("被停止");
      break;
    }
    if (compositeState.greenLock && !(itemMask & 9)) {
      break;
    }
    if (compositeState.blueKey) {
      console.log("滑到鑰匙");
      itemMask |= 8;
    }
    if (compositeState.greenKey) {
      itemMask |= 9;
    }
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
      };
    }
    // 如果滑進火，沒有對應 pickup ，則整個路徑無效
    if (compositeState.fire && !(itemMask & 1)) {
      return {
        valid: false,
        path: [],
        itemMask: itemMask,
      };
    }

    // 繼續滑行
    nx = nextX;
    ny = nextY;
    movingTrace.push([nx, ny]);

    // 如果滑進 THIEF，itemMask 清空，但整個路徑有效
    if (compositeState.thief) {
      console.log("踩到冰滑進  THIEF", movingTrace);
      return {
        valid: true,
        path: movingTrace,
        itemMask: 0,
      };
    }

    // 如果下一格不是冰，停止滑行
    if (!compositeState.ice) {
      break;
    }
  }

  return {
    valid: true,
    path: movingTrace,
    itemMask: itemMask,
  };
}

function getHeroDirection(dx: number, dy: number) {
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
