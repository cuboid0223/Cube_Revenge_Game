import { COLORED_TYPES } from "@/helpers/consts";

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
  solutionPath: [number, number][] 
): { isColored: boolean; hslColor: string, frequency:number }{

  // 1) 檢查此 (x,y) 是否在 solutionPath 裡
  if(!solutionPath) return { isColored: false , hslColor: "", frequency: 0}
  const index = solutionPath.findIndex(([px, py]) => px === x && py === y);
  if (index < 0) {
    // 不在路徑上 => 不上色
    return { isColored: false, hslColor: "",frequency: 0 };
  }
  const indices = solutionPath.reduce((acc: number[], [px, py], index) => {
    if (px === x && py === y) {
      acc.push(index);
    }
    return acc;
  }, []);
  const frequency = indices.length

  // 2) 若在 path 裡, 計算顏色深淺 (index越大 => 越接近 path 終點 => 顏色越深)
  const ratio = index * frequency  / (solutionPath.length - 1);
  const hue = 120 - ratio * 30;          // 色相從 120 (綠) 變到 90 (偏藍或青)
  const lightness = 90 - ratio * 70;
  const hslColor = `hsl(${hue}, 100%, ${lightness}%)`;

  // 3) 判斷該座標是否有 placement 
  //    - 若無 => empty => 直接上色
  //    - 若有 => 需判斷 type 是否在 COLORED_TYPES
  const isEmpty = !placementType; 
  const isInColoredTypes = Boolean(placementType && COLORED_TYPES.includes(placementType));

  const isColored = (isEmpty || isInColoredTypes);

  return {
    isColored,
    hslColor,
    frequency
  };
}

