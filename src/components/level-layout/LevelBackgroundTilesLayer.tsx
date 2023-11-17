import MapCell from "./MapCell";
import { THEME_TILES_MAP } from "../../helpers/consts";
import { LevelSchema } from "@/helpers/types";

type Props = {
  level: LevelSchema;
};

export default function LevelBackgroundTilesLayer({ level }: Props) {
  // +1 的意思是最右邊的牆壁(最左邊的牆壁是 0)
  // 0 [1 2 3 4 5 6 7] 8
  // 1 ~ 7 是角色可以走的磁磚
  // 0, 8 表示牆壁
  const widthWithWalls = level.tilesWidth + 1;
  const heightWithWalls = level.tilesHeight + 1;
  const tiles = THEME_TILES_MAP[level.theme];

  function getBackgroundTile(x: number, y: number) {
    if (x === 0) {
      return tiles.LEFT;
    }
    if (x === widthWithWalls) {
      return tiles.RIGHT;
    }
    if (y === 0) {
      return tiles.TOP;
    }
    if (y === heightWithWalls) {
      return tiles.BOTTOM;
    }
    return tiles.FLOOR;
  }

  let canvases = [];
  for (let y = 0; y <= heightWithWalls; y++) {
    for (let x = 0; x <= widthWithWalls; x++) {
      // Skip Bottom Left and Bottom Right for intentional blank tiles in those corners
      // 跳過左右底角(不然會凸出來)
      if (y === heightWithWalls) {
        if (x === 0 || x === widthWithWalls) {
          continue;
        }
      }

      // add a cell to the map
      canvases.push(
        <MapCell
          key={`${x}_${y}`}
          x={x}
          y={y}
          frameCoord={getBackgroundTile(x, y)}
        />
      );
    }
  }

  return <div>{canvases}</div>;
}
