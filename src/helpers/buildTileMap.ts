import { RoomExits, RoomInfo, RoomsGrid, TileMap } from "./roomTemplatesMap";

/**
 * 將 macro-level 的 RoomsGrid 轉成最終 tileMap
 * @param rooms    NxN
 * @param roomW    每個房間模板寬
 * @param roomH    每個房間模板高
 * @param templateMap  出口組合 -> 多個Template
 * @returns  最終 2D tileMap
 */
export function buildTileMap(
    rooms: RoomsGrid, 
    roomW: number, 
    roomH: number,
    templateMap: Record<string, string[][][]>
  ): TileMap {
  
    const N = rooms.length; // NxN
    // 最終地圖大小
    const tileRows = N * roomH;
    const tileCols = N * roomW;
  
    // 初始化 tileMap
    let tileMap: TileMap = [];
    for (let r=0; r<tileRows; r++){
      tileMap.push(new Array(tileCols).fill("0"));
    }
  
    // 逐一房間
    for (let R=0; R<N; R++){
      for (let C=0; C<N; C++){
        const room = rooms[R][C];
        // 產生key: e.g. "L", "LR", "LRD", ...
        const key = buildExitsKey(room.exits);
        // 從 templateMap[key] 隨機挑一個
        const templates = templateMap[key] || templateMap[""];
        const chosen = randomPick(templates);
  
        // 貼上
        placeRoomTemplate(tileMap, chosen, R, C, roomW, roomH, room);
      }
    }
    return tileMap;
  }
  

  function buildExitsKey(exits: RoomExits): string {
    // 依 up/down/left/right => 拼接 "U", "D", "L", "R"
    // 但 Spelunky 常規: "L" + "R" => "LR", "LRD", "LRU", "LRUD"...
    // 順序可自訂 (LRUD or LRU or UD...) 只要與 templateMap key一致即可
    let key = "LR";
    // if (exits.left)  key += "L";
    // if (exits.right) key += "R";
    if (exits.up)    key += "U";
    if (exits.down)  key += "D";
    return key; 
  }

  function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random()*arr.length)];
  }


  function placeRoomTemplate(
    tileMap: TileMap,
    roomTemplate: string[][],
    roomR: number, 
    roomC: number, 
    roomW: number, 
    roomH: number, 
    room: RoomInfo
  ){
    const startRow = roomR * roomH;
    const startCol = roomC * roomW;
  
    for (let r=0; r<roomH; r++){
      for (let c=0; c<roomW; c++){
        let ch = roomTemplate[r][c];
        // 機率判斷
        if (ch === "2") {
          // 50% => "1" or "0"
          ch = (Math.random()<0.5) ? "1" : "0";
        } else if (ch === "4") {
          // 25% => "pushBlock"
          ch = (Math.random()<0.25) ? "pushBlock" : "0";
        }
        // 其他 ...
        tileMap[startRow + r][startCol + c] = ch;
      }
    }

      // 若該房間是start/goal，找所有 '0' cell
  if (room.isStartRoom || room.isGoalRoom) {
    const candidates: [number, number][] = [];
    for (let r = 0; r < roomH; r++) {
      for (let c = 0; c < roomW; c++) {
        const globalR = startRow + r;
        const globalC = startCol + c;
        if (tileMap[globalR][globalC] === "0") {
          candidates.push([globalR, globalC]);
        }
      }
    }

    if (candidates.length > 0) {
      const [gr, gc] = randomPick(candidates); // 隨機取一個
      tileMap[gr][gc] = room.isStartRoom ? "H" : "G";
    }
  }
  }
  