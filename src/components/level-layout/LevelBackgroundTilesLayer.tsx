import MapCell from "./MapCell";
import { THEME_TILES_MAP } from "../../helpers/consts";
import { Level } from "@/helpers/types";
import { LevelStateSnapshot } from "@/types/global";

type Props = {
  level: LevelStateSnapshot;
};

export default function LevelBackgroundTilesLayer({ level }: Props) {
  // +1 的意思是最右邊的牆壁(最左邊的牆壁是 0)
  // 0 [1 2 3 4 5 6 7] 8
  // 1 ~ 7 是角色可以走的磁磚
  // 0, 8 表示牆壁
  const widthWithWalls = level.tilesWidth + 1;
  const heightWithWalls = level.tilesHeight + 1;
  const tiles = THEME_TILES_MAP[level.theme];
  // console.log(level.theme)
  // console.log(level.visibleTileBounds)
  // console.log(tiles)
  const { minX, maxX, minY, maxY } = level.visibleTileBounds;

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
  // for (let y = 0; y <= heightWithWalls; y++) {
  //   for (let x = 0; x <= widthWithWalls; x++) {
  for (let y = minY; y <= maxY + 1; y++) {
    for (let x = minX; x <= maxX + 1; x++) {
      // Skip Bottom Left and Bottom Right for intentional blank tiles in those corners
      // 跳過左右底角(不然會凸出來)
      if (y === maxY+1) {
        if (x === 0 || x === maxX+1) {
          continue;
        }
      }

      // add a cell to the map
      canvases.push(
        <MapCell
          level={level}
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
