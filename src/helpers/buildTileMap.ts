import { BOTTOM_PLACEMENTS, PLACEMENT_TYPES_CODE } from "./consts";
import { RoomExits, RoomInfo, RoomsGrid, TileMap } from "./roomTemplatesMap";

/**
 * 將 macro-level 的 RoomsGrid 轉成最終 tileMap。
 *
 * @param rooms - NxN 房間網格
 * @param roomW - 每個房間模板的寬度
 * @param roomH - 每個房間模板的高度
 * @param templateMap - 出口組合對應的模板集合 (key 為出口組合字串，value 為多個模板)
 * @returns 最終生成的 tileMap (2D 字串陣列)
 */
export function buildTileMap(
  rooms: RoomsGrid,
  roomW: number,
  roomH: number,
  templateMap: Record<string, string[][][]>
): TileMap {
  const N = rooms.length; // 房間數量：NxN
  const tileRows = N * roomH;
  const tileCols = N * roomW;

  // 初始化 tileMap 為全 "0" 二維陣列
  const tileMap: TileMap = Array.from({ length: tileRows }, () =>
    new Array(tileCols).fill("0")
  );

  // 逐一處理每個房間
  for (let roomRow = 0; roomRow < N; roomRow++) {
    for (let roomCol = 0; roomCol < N; roomCol++) {
      const room = rooms[roomRow][roomCol];
      const exitsKey = buildExitsKey(room.exits);
      const templates = templateMap[exitsKey] || templateMap[""];
      const chosenTemplate = randomPick(templates);

      placeRoomTemplate(
        tileMap,
        chosenTemplate,
        roomRow,
        roomCol,
        roomW,
        roomH,
        room
      );
    }
  }

  return tileMap;
}

/**
 * 根據房間出口資訊建立模板 key 字串。
 * 順序需與 templateMap 的 key 一致。
 *
 * @param exits - 房間出口資訊
 * @returns 模板 key 字串 (例如："LR", "LRU", "LRD", "LRUD", 等)
 */
function buildExitsKey(exits: RoomExits) {
  // 固定包含左右 ("LR")，依據出口資訊增加上下
  let key = "LR";
  if (exits.up) {
    key += "U";
  }
  if (exits.down) {
    key += "D";
  }
  return key as "LR" | "LRU" | "LRD" | "LRUD";
}

/**
 * 從陣列中隨機選取一個元素。
 *
 * @param arr - 任意陣列
 * @returns 隨機選取的元素
 */
function randomPick<T>(arr: T[]): T {
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
}

/**
 * 根據房間模板將內容貼到 tileMap 上，並確保若房間為起始或目標房間，
 * 則必定會有一個特殊 tile ("H" 或 "G") 被放置。
 *
 * @param tileMap - 全局 tileMap
 * @param roomTemplate - 房間模板 (2D 字串陣列)
 * @param roomRow - 房間在房間網格中的列索引
 * @param roomCol - 房間在房間網格中的行索引
 * @param roomW - 房間模板寬度
 * @param roomH - 房間模板高度
 * @param room - 房間資訊 (包含 isStartRoom 與 isGoalRoom)
 */
function placeRoomTemplate(
  tileMap: TileMap,
  roomTemplate: string[][],
  roomRow: number,
  roomCol: number,
  roomW: number,
  roomH: number,
  room: RoomInfo
): void {
  const startRow = roomRow * roomH;
  const startCol = roomCol * roomW;

  // 將模板內容貼到 tileMap 中
  for (let r = 0; r < roomH; r++) {
    for (let c = 0; c < roomW; c++) {
      const code = mergeCodeByProbability(roomTemplate[r][c]);

      // 若模板 tile 為特殊 tile ("h" 或 "g")，根據房間類型轉換成 "H" 或 "G"
      let finalTile = code;
      if (code === PLACEMENT_TYPES_CODE.DEFAULT_HERO_CODE && room.isStartRoom) {
        finalTile = PLACEMENT_TYPES_CODE.HERO;
      } else if (
        code === PLACEMENT_TYPES_CODE.DEFAULT_GOAL_CODE &&
        room.isGoalRoom
      ) {
        finalTile = PLACEMENT_TYPES_CODE.GOAL;
      }

      tileMap[startRow + r][startCol + c] = finalTile;
    }
  }

  // 若房間為起始或目標房間，檢查是否已放置特殊 tile，
  // 若沒有則從候選空白位置中隨機補上一個 "H" 或 "G"
  if (room.isStartRoom || room.isGoalRoom) {
    if (
      !isSpecialTilePresent(tileMap, startRow, startCol, roomW, roomH, room)
    ) {
      placeRandomSpecialTile(tileMap, startRow, startCol, roomW, roomH, room);
    }
  }
}

/**
 * 檢查在指定區域內是否已存在特殊 tile ("H" 或 "G")。
 *
 * @param tileMap - 全局 tileMap
 * @param startRow - 區域起始列索引
 * @param startCol - 區域起始行索引
 * @param roomW - 區域寬度
 * @param roomH - 區域高度
 * @param room - 房間資訊
 * @returns 若找到特殊 tile 則回傳 true，否則回傳 false
 */
function isSpecialTilePresent(
  tileMap: TileMap,
  startRow: number,
  startCol: number,
  roomW: number,
  roomH: number,
  room: RoomInfo
): boolean {
  const specialTile = room.isStartRoom
    ? PLACEMENT_TYPES_CODE.HERO
    : PLACEMENT_TYPES_CODE.GOAL;
  for (let r = 0; r < roomH; r++) {
    for (let c = 0; c < roomW; c++) {
      if (tileMap[startRow + r][startCol + c] === specialTile) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 在指定區域內隨機挑選一個值為 "0" 的 tile，並放置特殊 tile ("H" 或 "G")。
 *
 * @param tileMap - 全局 tileMap
 * @param startRow - 區域起始列索引
 * @param startCol - 區域起始行索引
 * @param roomW - 區域寬度
 * @param roomH - 區域高度
 * @param room - 房間資訊
 */
function placeRandomSpecialTile(
  tileMap: TileMap,
  startRow: number,
  startCol: number,
  roomW: number,
  roomH: number,
  room: RoomInfo
): void {
  const candidates: [number, number][] = [];

  for (let r = 0; r < roomH; r++) {
    for (let c = 0; c < roomW; c++) {
      if (tileMap[startRow + r][startCol + c] === PLACEMENT_TYPES_CODE.EMPTY) {
        candidates.push([startRow + r, startCol + c]);
      }
    }
  }

  if (candidates.length > 0) {
    const [globalRow, globalCol] = randomPick(candidates);
    tileMap[globalRow][globalCol] = room.isStartRoom
      ? PLACEMENT_TYPES_CODE.HERO
      : PLACEMENT_TYPES_CODE.GOAL;
  }
}

/**
 * 將包含機率的字串拆分為 code 部分與機率部分。
 * 範例：
 *   "I_TL-50" 會拆分成 { codePart: "I_TL", probability: 50 }
 *   "1" 則回傳 { codePart: "1", probability: 100 }，預設機率為 100。
 *
 * @param codeString - 包含機率的字串，例如 "I_TL-50"
 * @returns 物件包含 codePart 與 probability (以百分比數值表示)
 */
function splitCodeProbability(codeString: string): {
  codePart: string;
  probability: number;
} {
  if (codeString.includes("-")) {
    // 使用 dash 分隔，例如 "I_TL-50" 分成 ["I_TL", "50"]
    const [codePart, probabilityStr] = codeString.split("-");
    // 將機率部分轉為數字（例如 50 代表 50%）
    const probability = parseInt(probabilityStr, 10) / 100;
    return { codePart, probability };
  } else {
    // 若無 dash，預設機率為 100%
    return { codePart: codeString, probability: 1 };
  }
}

/**
 * 將包含機率的字串合併為最終的 code 字串。
 * 例如當 codeString 為 "I-50&F-50&WP" 時，
 * 如果 I 或 F 其中一個已經被選中，後續同屬於 BOTTOM_TILES 的 code 就不會再加入，
 * 最終可能出現 "I&WP" 或 "F&WP"（而不會同時出現 I 與 F）。
 * @param codeString - The code string to merge.
 * @returns The merged code string.
 */
function mergeCodeByProbability(codeString: string): string {
  const mergedCodes: string[] = [];
  // 用來記錄是否已加入過 BOTTOM_TILES 的 tile
  let bottomTileAdded = false;

  if (codeString.includes("&")) {
    const codeTypes = codeString.split("&");
    codeTypes.forEach((c) => {
      const { codePart, probability } = splitCodeProbability(c);
      // 根據機率判斷是否加入該 tile
      if (Math.random() < probability) {
        // 如果這個 tile 屬於 BOTTOM_TILES
        if (BOTTOM_PLACEMENTS.includes(codePart)) {
          // 如果尚未加入過任何 BOTTOM_TILES 的 tile，則加入並標記
          if (!bottomTileAdded) {
            mergedCodes.push(codePart);
            bottomTileAdded = true;
          }
          // 若已加入過，則跳過此 tile
        } else {
          // 非 BOTTOM_TILES 類型直接加入
          mergedCodes.push(codePart);
        }
      }
    });
  } else {
    const { codePart, probability } = splitCodeProbability(codeString);
    if (Math.random() < probability) {
      mergedCodes.push(codePart);
    } else {
      mergedCodes.push(PLACEMENT_TYPES_CODE.EMPTY);
    }
  }

  return mergedCodes.join("&");
}
