import { GROUND_PLACEMENT_TYPES } from "@/helpers/consts";

/**
 * @param placementType  若有值 => 表示此座標有 placement, 否則就是 empty
 * @param x, y           tile 座標
 * @param solutionPath   解法路徑 array, e.g. [ [x1,y1], [x2,y2], ... ]
 * @returns { isColored, hslColor, frequency }
 *   - isColored: 若在 solutionPath 內 & (是空地 or COLORED_TYPES 內的 type) => true
 *   - hslColor:  根據在路徑的 index 和 frequency(走過次數) 值計算出綠色深淺
 *   - frequency: 某 tile 被走過的次數
 */
export function handleColoredTile(
  placementType: string | undefined,
  x: number,
  y: number,
  solutionPath: [number, number][] | null
): {
  isColored: boolean;
  frequency: number;
  index: number[];
} {
  // 1) 檢查此 (x,y) 是否在 solutionPath 裡
  if (!solutionPath) return { isColored: false, frequency: 0, index: [] };
  let index = [] as number[];
  solutionPath.forEach((item, i) => {
    if (item[0] === x && item[1] === y) {
      index.push(i);
    }
  });
  // const index = solutionPath.findIndex(([px, py]) => px === x && py === y);
  if (index.length == 0) {
    // 不在路徑上 => 不上色
    return { isColored: false, frequency: 0, index: [] };
  }

  const frequency = index.length;

  // 3) 判斷該座標是否有 placement
  //    - 若無 => empty => 直接上色
  //    - 若有 => 需判斷 type 是否在 COLORED_TYPES
  const isEmpty = !placementType;
  const isInColoredTypes = Boolean(
    placementType && GROUND_PLACEMENT_TYPES.includes(placementType)
  );

  const isColored = isEmpty || isInColoredTypes;

  return {
    isColored,
    frequency,
    index,
  };
}
