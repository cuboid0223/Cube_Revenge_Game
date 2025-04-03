import { CellKey, PLACEMENT_TYPES_CODE } from "./consts";
import { TileMap } from "./roomTemplatesMap";

export const convertGameMapToTileMap = (gameMap: string[][]) => {
  if (gameMap.length === 0) return;
  const roomW = gameMap[0].length;
  const roomH = gameMap.length;
  const tileMap: TileMap = Array.from({ length: roomH }, () =>
    new Array(roomW).fill("0")
  );

  for (let r = 0; r < roomH; r++) {
    for (let c = 0; c < roomW; c++) {
      const cellValue = gameMap[r][c];
      if (!cellValue) continue;
      tileMap[r][c] = processCell(cellValue);
    }
  }
  return tileMap;
};
const processCell = (cellValue: string): string => {
  if (cellValue.includes("&")) {
    return processMultiTypeCell(cellValue);
  }
  return PLACEMENT_TYPES_CODE[cellValue as CellKey] || "0";
};

const processMultiTypeCell = (cellValue: string): string => {
  const types = cellValue.split("&");
  let code = "";

  for (let type of types) {
    if (type === "HERO_EDITING") continue;

    const typeCode =
      PLACEMENT_TYPES_CODE[type as keyof typeof PLACEMENT_TYPES_CODE];

    if (!typeCode) {
      console.log(`No matching type found for: ${type}`);
      continue;
    }

    code += typeCode + "&";
  }

  return code.slice(0, -1); // Remove the last "&"
};
