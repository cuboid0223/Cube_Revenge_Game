import { iceTileCornerBlockedMoves, iceTileCornerRedirection } from "@/game-objects/IcePlacement";
import { DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP, directionUpdateMap, PLACEMENT_TYPE_ICE, PLACEMENT_TYPE_WALL } from "@/helpers/consts";
import { PlacementSchema } from "@/helpers/types";

/**
 * 處理玩家從 (startX, startY) 往 [dx, dy] 方向移動時，
 * 在冰塊 (ICE) 與 corner 上的行為：滑動 / 轉向 / 阻擋。
 *
 * @param startX - 原起點 x
 * @param startY - 原起點 y
 * @param dx - 嘗試的 x方向 (±1 or 0)
 * @param dy - 嘗試的 y方向 (±1 or 0)
 * @param gameMap - 二維地圖 (height×width)
 * @param placements - 放置的物件 (包括 ICE, corner, etc.)
 * @param hasIcePickup - 是否擁有 ICE_PICKUP，自由行走
 * @param width - 地圖寬度
 * @param height - 地圖高度
 * @returns 最終合法位置 [finalX, finalY]，若無法前進則回傳 [startX, startY]。
 */
export function handleIceLogic(
    startX: number,
    startY: number,
    dx: number,
    dy: number,
    gameMap: string[][],
    placements: PlacementSchema[],
    hasIcePickup: boolean,
    width: number,
    height: number
  ): [number, number] {
    let [nx, ny] = [startX, startY];
    let direction: [number, number] = [dx, dy];
  
    // 連續滑動或單步移動
    while (true) {
      // 檢查當前 (nx, ny) 是否還在 ICE
      const ice = placements.find(
        (p) => p.x === nx && p.y === ny && p.type === PLACEMENT_TYPE_ICE
      );
      if (!ice) {
        // 一旦離開 ICE 範圍 => 停止
        break;
      }
  
      // corner：先嘗試轉向，再檢查阻擋
      if (ice.corner) {
        // corner 轉向
        const possibleRedirects = iceTileCornerRedirection[ice.corner];
        const dirKey = getDirectionKey(direction)  
        if (possibleRedirects[dirKey]) {
            const point = directionUpdateMap[possibleRedirects[dirKey]] 
            direction = [point.x,point.y];

            console.log(
                `Corner(${ice.corner}) at [${nx}, ${ny}] => redirect => [${direction}].`
            );
            
            nx += direction[0]
            ny += direction[1]
            const solidPlacement = placements.find(p => p.x === nx && p.y === ny && p.type === PLACEMENT_TYPE_WALL)
            if(solidPlacement){
              nx -= direction[0]
              ny -= direction[1]
            }
            break
        }


         
        // 代表 (nx, ny) 是 corner
        const blockedDirections =  iceTileCornerBlockedMoves[ice.corner];
        // 若 corner 定義了
        if (blockedDirections) {
            const currentDirKey = getDirectionKey([dx, dy]);
            // if(isCornerSolidForBody(startX - dx,startY - dy, dx,dy, ice)){
            //     console.log(`skip! isCornerSolidForBody`);
            //     continue;
            // }
            if (blockedDirections[currentDirKey]) {
                continue;
            }
        }
          
  
        // corner 阻擋(內部阻擋)
        // const blockedDirections = iceTileCornerBlockedMoves[ice.corner];
        // const currentDirKey = getDirectionKey(direction);
        // console.log(`User at Corner(${ice.corner}) at [${nx}, ${ny}] -> blockedDirections: ${JSON.stringify(blockedDirections) }, currentDirKey: ${currentDirKey}`);
        // console.log(`blockedDirections[currentDirKey]: ${blockedDirections[currentDirKey]}`);
        // if (blockedDirections[currentDirKey]) {
        //   console.log(
        //     `Corner(${ice.corner}) at [${nx}, ${ny}] blocks direction: ${currentDirKey}.`
        //   );
        //   // 停留在 corner
        //   return [nx, ny];
        // }
      }
  
      // 若有 ICE_PICKUP，只往 direction 移動一次就結束
      if (hasIcePickup) {
        nx += direction[0];
        ny += direction[1];
        console.log(`hasIcePickup => Move one step => [${nx}, ${ny}]`);
        break;
      }
  
      // 連續滑動：多步
      const nextX = nx + direction[0];
      const nextY = ny + direction[1];
      if (nextX < 1 || nextX > width || nextY < 1 || nextY > height) {
        // console.log(`Stop sliding at [${nx},${ny}], out of boundary: (${nextX},${nextY})`);
        break;
      }
      
      // 偵測下一格是否是牆或無效位置
      if (gameMap[nextY - 1][nextX - 1] === PLACEMENT_TYPE_WALL) {
        console.log(`Stop sliding at [${nx},${ny}], next=(${nextX},${nextY}) is wall.`);
        break;
      }
      
      // **核心：若下一格是 null => 代表普通空地 => 移動一次 => break**
      if (gameMap[nextY - 1][nextX - 1] === null) {
        console.log(`Leaving ICE. Move from [${nx},${ny}] => [${nextX},${nextY}] (null) then stop.`);
        nx = nextX;
        ny = nextY;
        break;
      }
      
      // **其他邏輯**：假設是 ICE，就繼續滑動，或是 corner 之類的放在前面檢查
      if (
        gameMap[nextY - 1][nextX - 1] !== PLACEMENT_TYPE_ICE &&
        !placements.find((p) => p.x === nextX && p.y === nextY)
      ) {
        // 既不是冰、也不是 null、也不在 placements => 停止
        console.log(`Stop sliding at [${nx},${ny}], next=(${nextX},${nextY}) invalid.`);
        break;
      }
    //   if(nextX===3 && nextY===4)console.log("哈囉 3.4")
    //   // 滑動停止條件 (牆/邊界/非 ICE/ 空的)
    //   if (
    //     nextX < 1 ||
    //     nextX > width ||
    //     nextY < 1 ||
    //     nextY > height ||
        
    //     // ice.corner || 
    //     gameMap[nextY - 1][nextX - 1] === PLACEMENT_TYPE_WALL ||
    //     (gameMap[nextY - 1][nextX - 1] !== PLACEMENT_TYPE_ICE &&
    //     gameMap[nextY - 1][nextX - 1]  !== null &&  
    //       !placements.find((p) => p.x === nextX && p.y === nextY)) 
    //   ) {
    //     // Stop sliding at [3, 5] => next=(3,4) invalid.
    //     if(nextX===3 && nextY===4)console.log(`哈囉${ gameMap[nextY - 1][nextX - 1] } `)
    //     if(nextX===3 && nextY===4)console.log(`哈囉${ placements.find((p) => p.x === nextX && p.y === nextY) } `)
    //     console.log(`Stop sliding at [${nx}, ${ny}] => next=(${nextX},${nextY}) invalid.`);
 
    //     break; // 保持 [nx, ny]
    //   }
  
    //   // 可以繼續滑動 => 更新
    //   if(nextX===3 && nextY===4)console.log("哈囉 4.4")
      nx = nextX;
      ny = nextY;

    //   if(nx===3 && ny===4)console.log("4.4")
      
    }
  
    return [nx, ny];
  }
  

export function isCornerSolidForBody(x,y, dx,dy, icePlacement) {
    const nextX = x + dx
    const nextY = y + dy
    const bodyIsBelow = nextY < y;
    if (bodyIsBelow && icePlacement.corner?.includes("BOTTOM")) {
      return true;
    }
    const bodyIsAbove = nextY > y;
    if (bodyIsAbove && icePlacement.corner?.includes("TOP")) {
      return true;
    }
    const bodyIsToLeft = nextX > x;
    if (bodyIsToLeft && icePlacement.corner?.includes("LEFT")) {
      return true;
    }
    const bodyIsToRight = nextX < x;
    if (bodyIsToRight && icePlacement.corner?.includes("RIGHT")) {
      return true;
    }
  }


export function getDirectionKey([dx, dy]) {
    if (dx === -1 && dy === 0) return DIRECTION_LEFT;
    if (dx === 1 && dy === 0) return DIRECTION_RIGHT;
    if (dx === 0 && dy === -1) return DIRECTION_UP;
    if (dx === 0 && dy === 1) return DIRECTION_DOWN;
    return null; // 無效方向
}