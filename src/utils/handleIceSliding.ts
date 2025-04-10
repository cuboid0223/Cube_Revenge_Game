import {
  iceTileCornerBlockedMoves,
  iceTileCornerRedirection,
} from "@/game-objects/IcePlacement";
import {
  buildFlourMapping,
  combineCellState,
  getHeroDirection,
  getPlacementAt,
} from "./findSolutionPath";
import {
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  directionUpdateMap,
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
  let movingTrace: number[][] = [[nx, ny]];
  const hasIcePickup = itemMask & 4;
  let entryDirection = getHeroDirection(dx, dy);
  const { flourMap, totalFlours } = buildFlourMapping(placements);
  const currentTile = gameMap[ny - 1][nx - 1];
  let compositeState = combineCellState(currentTile);

  // 如果有hasIcePickup，則不滑動（僅返回起始位置）
  if (hasIcePickup) {
    // 處理冰角阻擋
    movingTrace = handleIceCornerBlocking(
      placements,
      nx,
      ny,
      dx,
      dy,
      entryDirection,
      movingTrace
    );

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
    // 優先處理當前位置的冰角轉向邏輯
    // let icePlacementWhileSliding = getPlacementAt(
    //   placements,
    //   PLACEMENT_TYPE_ICE,
    //   nx,
    //   ny
    // );

    // 處理冰角轉向邏輯
    if (compositeState?.iceCorner) {
      const corner = compositeState.iceCorner;
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

        // console.log(
        //   `Hero 在 ${corner} [${nx},${ny}] 轉向至往 ${entryDirection}`
        // );
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
    }

    // 計算下一格座標
    let nextX = nx + dx;
    let nextY = ny + dy;

    // 邊界檢查（現在放在冰角處理後）
    if (nextX < 1 || nextX > width || nextY < 1 || nextY > height) break;

    // 檢查是否存在無窮迴圈
    const stateKey = `${nx},${ny},${dx},${dy},${itemMask}`;
    if (visited.has(stateKey)) {
      console.error(`檢測到無窮迴圈 ${stateKey}`);
      break;
    }
    visited.add(stateKey);

    // 獲取下一格的狀態
    let nextTile = gameMap[nextY - 1][nextX - 1];
    compositeState = combineCellState(nextTile);

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
      const direction = compositeState.conveyorDir as string;

      if (direction === "UP") nextY -= 1;
      else if (direction === "DOWN") nextY += 1;
      else if (direction === "LEFT") nextX -= 1;
      else if (direction === "RIGHT") nextX += 1;

      dx = directionUpdateMap[direction].x;
      dy = directionUpdateMap[direction].y;
    }

    // 如果滑進 THIEF，itemMask 清空，但整個路徑有效
    if (compositeState.thief) {
      movingTrace.push([nextX, nextY]);
      console.log(
        `step on thief while sliding form [${nx},${ny}] to [${nextX},${nextY}]`
      );
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

// 處理冰角邏輯，將其封裝為一個函數，避免重複程式碼
function handleIceCornerBlocking(
  placements: PlacementConfig[],
  nx: number,
  ny: number,
  dx: number,
  dy: number,
  entryDirection: string,
  movingTrace: number[][]
) {
  // 從 placements 中尋找當前位置是否有冰角
  const icePlacement = getPlacementAt(placements, PLACEMENT_TYPE_ICE, nx, ny);

  if (icePlacement?.corner) {
    const isBlocked =
      iceTileCornerBlockedMoves[icePlacement.corner][entryDirection];

    // 記錄是否被角落阻擋
    const action = isBlocked
      ? `進入角落${icePlacement.corner}`
      : `被角落${icePlacement.corner}阻擋`;

    console.log(
      `Hero  在 [${nx - dx},${
        ny - dy
      }] 往 ${entryDirection} ${action} [${nx},${ny}]`
    );

    movingTrace.push([nx - dx, ny - dy]); // 推送回退位置
  }

  return movingTrace;
}
