import { PLACEMENT_TYPE_CIABATTA, PLACEMENT_TYPE_CONVEYOR, PLACEMENT_TYPE_FIRE, PLACEMENT_TYPE_FIRE_PICKUP, PLACEMENT_TYPE_FLOUR, PLACEMENT_TYPE_FLYING_ENEMY, PLACEMENT_TYPE_GOAL, PLACEMENT_TYPE_GROUND_ENEMY, PLACEMENT_TYPE_HERO, PLACEMENT_TYPE_ICE, PLACEMENT_TYPE_ICE_PICKUP, PLACEMENT_TYPE_KEY, PLACEMENT_TYPE_LOCK, PLACEMENT_TYPE_ROAMING_ENEMY, PLACEMENT_TYPE_SWITCH, PLACEMENT_TYPE_SWITCH_DOOR, PLACEMENT_TYPE_TELEPORT, PLACEMENT_TYPE_THIEF, PLACEMENT_TYPE_WALL, PLACEMENT_TYPE_WATER, PLACEMENT_TYPE_WATER_PICKUP, PLACEMENT_TYPES_CODE } from "@/helpers/consts";
import { PlacementSchema } from "@/helpers/types";

/**
 * 將 2D tileMap (例如 9×9) 轉成:
 * {
 *   theme: LEVEL_THEMES.YELLOW,
 *   tilesWidth: 9,
 *   tilesHeight: 9,
 *   placements: [
 *     { type:"HERO", x:2, y:2 },
 *     { type:"GOAL", x:8, y:8 },
 *     { type:"WALL", x:1, y:1 },
 *     ...
 *   ]
 * }
 *
 * @param tileMap string[][], 行列皆從 index=0 開始
 * @param theme optional theme
 */
export default function tileMapToLevel(
    tileMap: string[][],
    theme: string = "LEVEL_THEMES.YELLOW"
  ): any {
    const height = tileMap.length;
    const width = tileMap[0]?.length ?? 0;
  
    // 收集 placements
    const placements: any[] = [];
  
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const cell = tileMap[row][col];
        // 依 cell 字元 => 對應 type
        if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_HERO]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_HERO)
          // placements.push({
          //   type: "HERO",
          //   x: col + 1, // x 要從 1 開始
          //   y: row + 1, // y 亦如此
          // });
        } else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_GOAL]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_GOAL)
        } else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_WALL]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_WALL)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_WATER]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_WATER)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_WATER_PICKUP]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_WATER_PICKUP)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_FIRE]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_FIRE)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_FIRE_PICKUP]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_FIRE_PICKUP)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_ICE]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_ICE)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_ICE_PICKUP]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_ICE_PICKUP)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_FLOUR]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_FLOUR)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_LOCK]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_LOCK)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_KEY]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_KEY)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_CONVEYOR]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_CONVEYOR)

        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_TELEPORT]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_TELEPORT)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_THIEF]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_THIEF)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_SWITCH_DOOR]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_SWITCH_DOOR)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_SWITCH]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_SWITCH)
        }
        else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_GROUND_ENEMY]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_GROUND_ENEMY)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_FLYING_ENEMY]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_FLYING_ENEMY)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_ROAMING_ENEMY]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_ROAMING_ENEMY)
        }else if (cell === PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_CIABATTA]) {
          addPlacement(placements, col, row, PLACEMENT_TYPE_CIABATTA)
        }
        // 其他符號可以再自行判斷
        // else if (cell==="pushBlock") => ...
      }
    }
  
    // 組出想要的物件結構
    const levelObject = {
      theme,
      tilesWidth: width,
      tilesHeight: height,
      placements
    };
  
    return levelObject;
  }
  


  function addPlacement(placements: PlacementSchema[], col:number, row:number, placementType: string){
    placements.push({
      type: placementType,
      x: col + 1, // x 要從 1 開始
      y: row + 1, // y 亦如此
    });
  }