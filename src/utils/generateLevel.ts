import { generateLevelWithTemplates } from "./generateLevelWithTemplates";
import tileMapToLevel from "./tileMapToLevel";

const generateLevel = async (
  overallWidth: number = 50,
  overallHeight: number = 50
) => {
  const wasm = await import("../../public/wasm/findSolutionPath");
  let generatedTileMap = generateLevelWithTemplates(
    overallWidth,
    overallHeight
  );
  let generatedLevelConfig = tileMapToLevel(generatedTileMap);
  //   如果無法通關或是通關路徑小於20 步 重新 generateLevelWithTemplates

//   let solution = wasm.findSolutionPathSimple(
//     generatedTileMap,
//     overallWidth,
//     overallHeight,
//     generatedLevelConfig.placements
//   );
//   while (solution.length === 0 || solution.length <= 20) {
//     generatedTileMap = generateLevelWithTemplates(overallWidth, overallHeight);
//     generatedLevelConfig = tileMapToLevel(generatedTileMap);
//     console.log(generatedTileMap);
//     console.log(generatedLevelConfig);
//     solution = wasm.findSolutionPathSimple(
//       generatedTileMap,
//       overallWidth,
//       overallHeight,
//       generatedLevelConfig.placements
//     );
//   }

  console.log(generatedTileMap);
  console.log(generatedLevelConfig);

  return { generatedTileMap, generatedLevelConfig };
};

export default generateLevel;
