import { PlacementType } from "@/classes/PlacementFactory";
import {
  ICE_CORNERS,
  PLACEMENT_TYPE_CIABATTA,
  PLACEMENT_TYPE_CONVEYOR,
  PLACEMENT_TYPE_FIRE,
  PLACEMENT_TYPE_FIRE_PICKUP,
  PLACEMENT_TYPE_FLOUR,
  PLACEMENT_TYPE_FLYING_ENEMY,
  PLACEMENT_TYPE_GOAL,
  PLACEMENT_TYPE_GROUND_ENEMY,
  PLACEMENT_TYPE_HERO,
  PLACEMENT_TYPE_ICE,
  PLACEMENT_TYPE_ICE_PICKUP,
  PLACEMENT_TYPE_KEY,
  PLACEMENT_TYPE_LOCK,
  PLACEMENT_TYPE_ROAMING_ENEMY,
  PLACEMENT_TYPE_SWITCH,
  PLACEMENT_TYPE_SWITCH_DOOR,
  PLACEMENT_TYPE_TELEPORT,
  PLACEMENT_TYPE_THIEF,
  PLACEMENT_TYPE_WALL,
  PLACEMENT_TYPE_WATER,
  PLACEMENT_TYPE_WATER_PICKUP,
  PLACEMENT_TYPES_CODE,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  DIRECTION_DOWN,
} from "@/helpers/consts";

import { Placement } from "@/helpers/types";
import { ExtendedPlacementConfig, LevelStateSnapshot } from "@/types/global";

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
  theme: string = "YELLOW"
): LevelStateSnapshot {
  const height = tileMap.length;
  const width = tileMap[0]?.length ?? 0;

  // 收集 placements
  const placements: any[] = [];

  // 建立 cell code 到 placement type 的對照表
  const cellToPlacementType: { [code: string]: string } = {
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_HERO]]: PLACEMENT_TYPE_HERO,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_GOAL]]: PLACEMENT_TYPE_GOAL,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_WALL]]: PLACEMENT_TYPE_WALL,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_WATER]]: PLACEMENT_TYPE_WATER,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_WATER_PICKUP]]:
      PLACEMENT_TYPE_WATER_PICKUP,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_FIRE]]: PLACEMENT_TYPE_FIRE,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_FIRE_PICKUP]]:
      PLACEMENT_TYPE_FIRE_PICKUP,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_ICE]]: PLACEMENT_TYPE_ICE,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_ICE_PICKUP]]:
      PLACEMENT_TYPE_ICE_PICKUP,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_FLOUR]]: PLACEMENT_TYPE_FLOUR,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_LOCK]]: PLACEMENT_TYPE_LOCK,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_KEY]]: PLACEMENT_TYPE_KEY,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_CONVEYOR]]: PLACEMENT_TYPE_CONVEYOR,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_TELEPORT]]: PLACEMENT_TYPE_TELEPORT,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_THIEF]]: PLACEMENT_TYPE_THIEF,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_SWITCH_DOOR]]:
      PLACEMENT_TYPE_SWITCH_DOOR,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_SWITCH]]: PLACEMENT_TYPE_SWITCH,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_GROUND_ENEMY]]:
      PLACEMENT_TYPE_GROUND_ENEMY,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_FLYING_ENEMY]]:
      PLACEMENT_TYPE_FLYING_ENEMY,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_ROAMING_ENEMY]]:
      PLACEMENT_TYPE_ROAMING_ENEMY,
    [PLACEMENT_TYPES_CODE[PLACEMENT_TYPE_CIABATTA]]: PLACEMENT_TYPE_CIABATTA,
  };

  // 遍歷 tileMap，每個 cell 若有對應的 placement type 就呼叫 addPlacement
  tileMap.forEach((rowArray, row) => {
    rowArray.forEach((cell, col) => {
      let placementTypes: string[] = [];
      if (cell.includes("&")) {
        placementTypes = cell.split("&");
      }
      if (placementTypes?.length !== 0) {
        placementTypes.forEach((p) => {
          const { baseCode, subCode } = splitBaseAndSubCode(p);
          const placementType = cellToPlacementType[baseCode] as PlacementType;
          if (placementType) {
            addPlacement(placements, col, row, placementType, subCode);
          }
        });
      } else {
        const { baseCode, subCode } = splitBaseAndSubCode(cell);
        const placementType = cellToPlacementType[baseCode] as PlacementType;

        if (placementType) {
          addPlacement(placements, col, row, placementType, subCode);
        }
      }
    });
  });

  // 組成最終的 level 物件
  return {
    theme,
    tilesWidth: width,
    tilesHeight: height,
    placements,
  };
}

/**
 * 將 code 部分拆分為基本 code 與下底線後的子 code (subCode)。
 * 範例：
 *   "I_TL" 會拆成 { baseCode: "I", subCode: "TL" }
 *   若沒有底線，例如 "I"，則回傳 { baseCode: "I" }。
 *
 * @param codePart - 不含機率的字串，例如 "I_TL"
 * @returns 物件包含 baseCode 與（如果存在）subCode
 */
function splitBaseAndSubCode(codePart: string): {
  baseCode: string;
  subCode?: string;
} {
  if (codePart.includes("_")) {
    // 使用底線拆分，例如 "I_TL" 分成 ["I", "TL"]
    const [baseCode, subCode] = codePart.split("_");
    return { baseCode, subCode };
  } else {
    return { baseCode: codePart };
  }
}

// 處理 ICE CORNER
function transformIceCorner(corner: string): string {
  const iceCornerMap: { [key: string]: string } = {
    BR: ICE_CORNERS.BOTTOM_RIGHT,
    BL: ICE_CORNERS.BOTTOM_LEFT,
    TL: ICE_CORNERS.TOP_LEFT,
    TR: ICE_CORNERS.TOP_RIGHT,
  };

  if (iceCornerMap[corner]) {
    return iceCornerMap[corner];
  }

  console.error(`沒有 ice corner 叫做 ${corner}，只有 I_BR, I_BL, I_TL, I_TR`);
  return "";
}

// 處理 CONVEYOR 上下左右
function transformDirection(direction: string): string {
  const directionMap: { [key: string]: string } = {
    R: DIRECTION_RIGHT,
    L: DIRECTION_LEFT,
    D: DIRECTION_DOWN,
    U: DIRECTION_UP,
  };

  if (directionMap[direction]) {
    return directionMap[direction];
  }

  console.error(`沒有 direction 叫做 ${direction}，只有 C_R, C_U, C_L, C_D`);
  return DIRECTION_RIGHT;
}

function transformDefaultRaised(raisedCode: string): boolean {
  return parseInt(raisedCode, 10) === 1;
}

function addPlacement(
  placements: ExtendedPlacementConfig[],
  col: number,
  row: number,
  placementType: PlacementType,
  subCode?: string
): void {
  // 將 col 與 row 調整為從 1 開始
  const x = col + 1;
  const y = row + 1;

  switch (placementType) {
    case PLACEMENT_TYPE_ICE:
      if (subCode) {
        placements.push({
          type: placementType,
          x,
          y,
          corner: transformIceCorner(subCode),
        });
        return;
      }
    case PLACEMENT_TYPE_SWITCH_DOOR:
      if (subCode) {
        placements.push({
          type: placementType,
          x,
          y,
          isRaised: transformDefaultRaised(subCode),
        });
        return;
      }
      break;

    case PLACEMENT_TYPE_CONVEYOR:
      if (subCode) {
        placements.push({
          type: placementType,
          x,
          y,
          direction: transformDirection(subCode),
        });
        return;
      }
      break;
    case PLACEMENT_TYPE_GROUND_ENEMY:
      if (subCode) {
        placements.push({
          type: placementType,
          x,
          y,
          initialDirection: transformDirection(subCode),
        });
        return;
      }
      break;
    case PLACEMENT_TYPE_FLYING_ENEMY:
      if (subCode) {
        placements.push({
          type: placementType,
          x,
          y,
          initialDirection: transformDirection(subCode),
        });
        return;
      }
      break;
  }

  // 預設情況
  placements.push({
    type: placementType,
    x,
    y,
  });
}
