import { combineCellState } from "./findSolutionPath";

export function handleIceSliding(
  gameMap: string[][],
  width: number,
  height: number,
  dx: number,
  dy: number,
  initialX: number,
  initialY: number,
  itemMask: number,
  doorMap: Map<string, number>,
  doorMask: number
): { valid: boolean; path: number[][]; itemMask: number } {
  let nx = initialX;
  let ny = initialY;
  const movingTrace: number[][] = [[nx, ny]];

  while (true) {
    let nextX = nx + dx;
    let nextY = ny + dy;

    // 邊界檢查
    if (nextX < 1 || nextX > width || nextY < 1 || nextY > height) {
      break;
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
    // 如果滑進 THIEF，itemMask 清空，但整個路徑有效
    if (compositeState.thief) {
      return {
        valid: true,
        path: movingTrace,
        itemMask: 0,
      };
    }

    // 繼續滑行
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
  };
}
