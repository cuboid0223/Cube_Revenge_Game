import { LEVEL_THEMES } from "@/helpers/consts";
import { generateLevelWithTemplates } from "./test";
import tileMapToLevel from "./tileMapToLevel";

export const gm = () => {
  const levelTileMap = generateLevelWithTemplates(50, 50);
  console.log("Generated Level Tile Map:");
  console.log(levelTileMap.map((row) => row.join(" ")).join("\n"));
  const levelData = tileMapToLevel(levelTileMap, LEVEL_THEMES.YELLOW);

  return levelData;
};
