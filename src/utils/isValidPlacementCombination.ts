import {
  FLOATING_PLACEMENT_TYPES,
  GROUND_PLACEMENT_TYPES,
} from "@/helpers/consts";
import { LevelStateSnapshot } from "@/types/global";

export const isValidPlacementCombination = (
  level: LevelStateSnapshot,
  x: number,
  y: number
) => {
  const cells = level.placements.filter((p) => p.x === x && p.y === y);
  let isValid = true;
  // 當在同一個位置上的物件數量大於等於 2 時，需確認是否剛好由一個浮動元素及一個地面元素組成
  if (cells.length >= 2) {
    const floatingCount = cells.filter((cell) =>
      FLOATING_PLACEMENT_TYPES.includes(cell.type)
    ).length;
    const groundCount = cells.filter((cell) =>
      GROUND_PLACEMENT_TYPES.includes(cell.type)
    ).length;
    isValid = !(floatingCount > 1 || groundCount > 1);
  }

  return isValid;
};
