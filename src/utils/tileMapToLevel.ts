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
        if (cell === "H") {
          placements.push({
            type: "HERO",
            x: col + 1, // x 要從 1 開始
            y: row + 1, // y 亦如此
          });
        } else if (cell === "G") {
          placements.push({
            type: "GOAL",
            x: col + 1,
            y: row + 1,
          });
        } else if (cell === "1") {
          placements.push({
            type: "WALL",
            x: col + 1,
            y: row + 1,
          });
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
  