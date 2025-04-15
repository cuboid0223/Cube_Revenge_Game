import { ExtendedPlacementConfig } from "@/types/global";

/*
這個 func 的用處是將 Placements 轉換成字串
原因是 WASM 不接受 複雜的物件
*/
export const encodePlacements = (
  placements: ExtendedPlacementConfig[]
): string => {
  return placements
    ?.map((p) => {
      let parts = [p.x, p.y, p.type];

      // 有些 placement 有特別的屬性
      // 例如 ice 有 CORNER
      // 或是 lock 有 color 區別等
      if (p.direction) parts.push(p.direction);
      else parts.push("");

      if (p.isRaised) parts.push(String(p.isRaised));
      else parts.push("");

      if (p.color) parts.push(p.color);

      return parts.join(",");
    })
    .join("|");
};

/*
這個 func 的用處是將 gameMap 轉換成字串
原因是 WASM 不接受 複雜的物件
*/
export const encodeGameMap = (gameMap: string[][]): string => {
  return gameMap.map((row) => row.join(",")).join("|");
};
