import { DIRECTION_DOWN, DIRECTION_LEFT, DIRECTION_RIGHT, DIRECTION_UP, PLACEMENT_TYPE_CONVEYOR, PLACEMENT_TYPE_FIRE, PLACEMENT_TYPE_FIRE_PICKUP, PLACEMENT_TYPE_FLOUR, PLACEMENT_TYPE_GOAL, PLACEMENT_TYPE_ICE, PLACEMENT_TYPE_ICE_PICKUP, PLACEMENT_TYPE_KEY, PLACEMENT_TYPE_LOCK, PLACEMENT_TYPE_SWITCH, PLACEMENT_TYPE_SWITCH_DOOR, PLACEMENT_TYPE_TELEPORT, PLACEMENT_TYPE_THIEF, PLACEMENT_TYPE_WALL, PLACEMENT_TYPE_WATER, PLACEMENT_TYPE_WATER_PICKUP } from "@/helpers/consts";
import { LevelSchema, PlacementSchema } from "@/helpers/types";
import PriorityQueue from "./PriorityQueue";
import { iceTileCornerBlockedMoves, iceTileCornerRedirection } from "@/game-objects/IcePlacement";
import { getDirectionKey, handleIceLogic } from "./handleIceLogic";

// 簡化地圖為二維矩陣，並記錄所有物件位置
export function createMap(level: LevelSchema) {
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
export function findPositions(placements: PlacementSchema[], type: string) {
  return placements.filter(p => p.type === type).map(p => [p.x, p.y]);
}

// A* Algo 檢查路徑並返回通關路徑
export function aStarWithMechanics(start, gameMap, width, height, placements) {
 
    const flourPositions = placements
      .filter(p => p.type === PLACEMENT_TYPE_FLOUR)
      .map(p => [p.x, p.y]);
    const goalPosition = placements.find(p => p.type === PLACEMENT_TYPE_GOAL);
    const firePickupPosition = placements.find(p => p.type === PLACEMENT_TYPE_FIRE_PICKUP);
    const waterPickupPosition = placements.find(p => p.type === PLACEMENT_TYPE_WATER_PICKUP);
    const icePickupPosition = placements.find(p => p.type === PLACEMENT_TYPE_ICE_PICKUP);
    const keyPosition = placements.find(p => p.type === PLACEMENT_TYPE_KEY);

    const totalFlours = flourPositions.length;
  
    // Priority queue for A* search
    const queue = new PriorityQueue((a, b) => a[0] - b[0]); // Compare based on f value
    const init_collected = new Set()
    const init_hasFirePickup = false, init_hasWaterPickup = false, init_hasIcePickup = false
    const init_isSwitchDoorOpen = true
    const init_hasKey = false
    queue.push([0, 0, start[0], start[1], init_collected, init_hasFirePickup, init_hasWaterPickup, init_hasIcePickup, init_isSwitchDoorOpen,init_hasKey, []]); // (f, g, x, y, collectedFlours, hasFirePickup, path)
    const visited = new Set();
  
    while (!queue.isEmpty()) {
      const [f, g, x, y, collectedFlours, hasFirePickup, hasWaterPickup,hasIcePickup, isSwitchDoorOpen, hasKey, path] = queue.pop();
      const newPath = [...path, [x, y]];
  
      // Debugging output
      // console.log(
      //   `Visiting: (${x}, ${y}), 
      //   Collected: ${[...collectedFlours]}, 
      //   Fire Pickup: ${hasFirePickup}, 
      //   Water Pickup: ${hasWaterPickup}, 
      //   Ice Pickup: ${hasIcePickup},
      //   is Switch Door open: ${isSwitchDoorOpen},
      //   Key: ${hasKey},
      //   Path: ${JSON.stringify(
      //     newPath
      //   )}`
      // );
  
      // Check if goal is reached after collecting all flours
      if (collectedFlours.size === totalFlours && x === goalPosition.x && y === goalPosition.y) {
        console.log("All flours collected. Goal reached!");
        return newPath;
      }
  
      // Explore neighbors
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ]) {
        let nx = x + dx;
        let ny = y + dy;
  
        // Check boundaries
        if (nx < 1 || nx > width || ny < 1 || ny > height) continue;
  
        // Check walls
        if (gameMap[ny - 1][nx - 1] === PLACEMENT_TYPE_WALL) continue;
        // Check switch door
        if (gameMap[ny - 1][nx - 1] === PLACEMENT_TYPE_SWITCH_DOOR && !isSwitchDoorOpen) continue;
        // Check lock
        if (gameMap[ny - 1][nx - 1] === PLACEMENT_TYPE_LOCK && !hasKey) continue;




        // Handle flour collection
        const newCollected = new Set(collectedFlours);
        if (flourPositions.some(([fx, fy]) => fx === nx && fy === ny)) {
          newCollected.add(`${nx},${ny}`);
        }
  
        // Handle fire obstacles
        if (gameMap[ny - 1][nx - 1] === PLACEMENT_TYPE_FIRE && !hasFirePickup) continue;
        // Handle water obstacles
        if (gameMap[ny - 1][nx - 1] === PLACEMENT_TYPE_WATER && !hasWaterPickup) continue;
        // Handle switch
        let newIsSwitchDoorOpen = isSwitchDoorOpen;
        if (gameMap[ny - 1][nx - 1] === PLACEMENT_TYPE_SWITCH ) {
          newIsSwitchDoorOpen = isSwitchDoorOpen ? false : true
        }


        // Handle fire pickup
        let newHasFirePickup = hasFirePickup;
        if (firePickupPosition && nx === firePickupPosition.x && ny === firePickupPosition.y) {
          newHasFirePickup = true;
        }
        // Handle water pickup
        let newHasWaterPickup = hasWaterPickup;
        if (waterPickupPosition && nx === waterPickupPosition.x && ny === waterPickupPosition.y) {
          newHasWaterPickup = true;
        }
        // Handle ice pickup
        let newHasIcePickup = hasIcePickup;
        if (icePickupPosition && nx === icePickupPosition.x && ny === icePickupPosition.y) {
          newHasIcePickup = true;
        }

        // Handle key
        let newHasKey = hasKey;
        if (keyPosition && nx === keyPosition.x && ny === keyPosition.y) {
          newHasKey = true;
        }

        // Handle Thief
        if (gameMap[ny - 1][nx - 1] === PLACEMENT_TYPE_THIEF) {
          newHasFirePickup = false
          newHasWaterPickup = false
          newHasIcePickup = false
          newHasKey = false
        }

        // Handle Teleport
        if (gameMap[ny - 1][nx - 1] === PLACEMENT_TYPE_TELEPORT) {
          const teleportTargets = placements.filter(p => p.type === PLACEMENT_TYPE_TELEPORT && (p.x !== nx || p.y !== ny));
          if (teleportTargets.length > 0) {
            const tp = teleportTargets[0]; // 跳到第一個其他傳送點
            nx = tp.x;
            ny = tp.y;
            console.log(`Teleported to (${nx}, ${ny})`);
          }
        }
        // Handle Conveyor
        if (gameMap[ny - 1][nx - 1] === PLACEMENT_TYPE_CONVEYOR) {
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


        // Handle Ice
        // 檢查 corner-block (外部阻擋: 在 非ice 要往 ice corner 走) 
        const cornerIce = placements.find(
          (p) => p.x === nx && p.y === ny && p.type===PLACEMENT_TYPE_ICE && p.corner
        );
        if (cornerIce) {
          // 代表 (nx, ny) 是 corner
          const cornerType = cornerIce.corner; // e.g. 'BOTTOM_LEFT'
          const blockedDirections =  iceTileCornerBlockedMoves[cornerType];
          // 若 corner 定義了
          if (blockedDirections) {
            const currentDirKey = getDirectionKey([dx, dy]);
           console.log(`User at [${x},${y}]  to [${dx}, ${dy}](${currentDirKey}), Corner(${cornerType}) at [${nx}, ${ny}]`);
            if(isCornerSolidForBody(x,y, dx,dy, cornerIce)){ // 非 ice tile 到 ice corner
              console.log(`skip! isCornerSolidForBody`);
              continue;
            }
            // if (blockedDirections[currentDirKey]) { // ice tile 到 ice corner 但轉不出去(可能輸出方向有牆)
            //   console.log(`skip!`);
            //   continue;
            // }
          }
        }

        function isCornerSolidForBody(x,y, dx,dy, icePlacement) {
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

        const [finalX, finalY] = handleIceLogic(
          nx, ny, // 初始想移到 (nx, ny)
          dx, dy, // 嘗試的方向
          gameMap,
          placements,
          newHasIcePickup,
          width,
          height
        );
  
        // 如果 handleIceLogic 回傳跟原位置一樣 => 被 corner 阻擋 /無法前進
        if (finalX === x && finalY === y) {
          continue; // skip
        }
        
        
        // if (gameMap[ny - 1][nx - 1] === PLACEMENT_TYPE_ICE) {
        //   let direction: [number, number] = [dx, dy];
        //   let sliding = !hasIcePickup;

        //   while (true) {
        //     const ice = placements.find(
        //       (p) => p.x === nx && p.y === ny && p.type === PLACEMENT_TYPE_ICE
        //     );

        //     if (!ice) break; // 停止滑動，已離開 ICE 範圍

        //     if (ice.corner) {
        //       const blockedDirections = iceTileCornerBlockedMoves[ice.corner as keyof typeof iceTileCornerBlockedMoves];
        //       const currentDirection = getDirectionKey(direction);

        //       // 檢查 corner 是否阻擋當前方向
        //       if (blockedDirections[currentDirection as keyof typeof blockedDirections]) {
        //         console.log(
        //           `Sliding blocked by corner at (${nx}, ${ny}). Cannot move ${currentDirection}.`
        //         );
        //         // nx -= direction[0]
        //         // ny -= direction[1]
        //         break
        //         // return [nx - direction[0], ny - direction[1]]; // 回退到合法位置
        //       }

        //       // 如果有合法轉向，更新滑動方向
        //       const possibleRedirects = iceTileCornerRedirection[ice.corner as keyof typeof iceTileCornerRedirection];
        //       const directionKey = `${direction[0]},${direction[1]}` as keyof typeof possibleRedirects;
        //       if (possibleRedirects && possibleRedirects[directionKey]) {
        //         direction = possibleRedirects[directionKey];
        //       }
        //     }

        //     // 如果玩家有 ICE_PICKUP，不進行滑動檢查，允許自由行走
        //     if (hasIcePickup) {
        //       console.log(`Walking freely on ice at (${nx}, ${ny}) due to ICE_PICKUP.`);
        //       break;
        //     }

        //     // 滑動到下一個位置
        //     nx += direction[0];
        //     ny += direction[1];

        //     // 停止滑動的條件
        //     if (
        //       nx < 1 ||
        //       nx > width ||
        //       ny < 1 ||
        //       ny > height || // 出界
        //       gameMap[ny - 1][nx - 1] === PLACEMENT_TYPE_WALL || // 遇到牆
        //       (gameMap[ny - 1][nx - 1] !== PLACEMENT_TYPE_ICE &&
        //         !placements.find((p) => p.x === nx && p.y === ny)) // 非 ICE 範圍
        //     ) {
        //       console.log(`Stopped sliding at (${nx}, ${ny}) due to invalid condition.`);
        //       nx -= direction[0]
        //       ny -= direction[1]
        //       break
        //       // return [nx - direction[0], ny - direction[1]]; // 回退到合法位置
        //     }
          
            
        //   }
        // }

        

        // State management
        const stateKey = `${finalX},${finalY}-${[...newCollected].sort().join(",")}-${newHasFirePickup}-${newHasWaterPickup}-${newHasIcePickup}-${newIsSwitchDoorOpen}-${newHasKey}`;
        if (visited.has(stateKey)) continue;
  
        visited.add(stateKey);
  
        // Calculate costs with heuristic
        const newG = g + 1;
        const newH = heuristicOptimized([finalX, finalY], flourPositions, goalPosition, newCollected);
        queue.push([newG + newH, newG, finalX, finalY, newCollected, newHasFirePickup, newHasWaterPickup, newHasIcePickup, newIsSwitchDoorOpen,newHasKey, newPath]);
      }
    }
  
    console.log("No valid path found.");
    return null;
  }
  
  // Heuristic function
  function heuristicOptimized(current, flourPositions, goalPosition, collectedFlours) {
    const [cx, cy] = current;
    const distances = [
      ...flourPositions
        .filter(([fx, fy]) => !collectedFlours.has(`${fx},${fy}`))
        .map(([fx, fy]) => Math.abs(fx - cx) + Math.abs(fy - cy)),
      Math.abs(goalPosition.x - cx) + Math.abs(goalPosition.y - cy)
    ];
    return Math.min(...distances);
  }


