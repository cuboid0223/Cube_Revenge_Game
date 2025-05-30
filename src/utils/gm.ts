import { LEVEL_THEMES } from "@/helpers/consts";
import { generateLevelWithTemplates } from "./generateLevelWithTemplates";
import tileMapToLevel from "./tileMapToLevel";

export const gm = (mapWidth:number = 20 ,mapHeight:number = 20 ) => {
  const levelTileMap = generateLevelWithTemplates(mapWidth, mapHeight);
  // console.log("Generated Level Tile Map:");
  // console.log(levelTileMap.map((row) => row.join(" ")).join("\n"));
  const levelData = tileMapToLevel(levelTileMap, LEVEL_THEMES.YELLOW);

  return [levelData, levelTileMap];
};
