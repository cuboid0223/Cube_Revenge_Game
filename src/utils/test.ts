// --------------------
// 型別與常數定義
// --------------------

import { templateMap, TileMap } from "@/helpers/roomTemplatesMap";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Leaf {
  rect: Rect;
  left?: Leaf;
  right?: Leaf;
  room?: Rect;
  corridors?: Rect[];
  isStartRoom?: boolean;
  isGoalRoom?: boolean;
  exits?: RoomExits; // 代表該房間四個方向是否開放
}

export type RoomExits = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

// BSP 與走廊相關常數
const MIN_LEAF_SIZE = 15; // 15*15 or 3*5 ?
const MIN_ROOM_SIZE = 6; // 6*6 or 3*2 ?
const CORRIDOR_WIDTH = 1; // 走廊寬度

// BSP 分割，遞迴切分 leaf
function splitLeaf(leaf: Leaf): boolean {
  if (leaf.left || leaf.right) return false;
  let splitH = Math.random() > 0.5;
  if (leaf.rect.width / leaf.rect.height >= 1.25) {
    splitH = false;
  } else if (leaf.rect.height / leaf.rect.width >= 1.25) {
    splitH = true;
  }
  const max = (splitH ? leaf.rect.height : leaf.rect.width) - MIN_LEAF_SIZE;
  if (max <= MIN_LEAF_SIZE) return false;
  const split =
    Math.floor(Math.random() * (max - MIN_LEAF_SIZE)) + MIN_LEAF_SIZE;
  if (splitH) {
    leaf.left = {
      rect: {
        x: leaf.rect.x,
        y: leaf.rect.y,
        width: leaf.rect.width,
        height: split,
      },
    };
    leaf.right = {
      rect: {
        x: leaf.rect.x,
        y: leaf.rect.y + split,
        width: leaf.rect.width,
        height: leaf.rect.height - split,
      },
    };
  } else {
    leaf.left = {
      rect: {
        x: leaf.rect.x,
        y: leaf.rect.y,
        width: split,
        height: leaf.rect.height,
      },
    };
    leaf.right = {
      rect: {
        x: leaf.rect.x + split,
        y: leaf.rect.y,
        width: leaf.rect.width - split,
        height: leaf.rect.height,
      },
    };
  }
  return true;
}

function createBSPTree(root: Leaf): Leaf[] {
  const leaves: Leaf[] = [root];
  let didSplit = true;
  while (didSplit) {
    didSplit = false;
    for (let i = 0; i < leaves.length; i++) {
      const leaf = leaves[i];
      if (!leaf.left && !leaf.right) {
        if (
          leaf.rect.width > MIN_LEAF_SIZE ||
          leaf.rect.height > MIN_LEAF_SIZE
        ) {
          if (splitLeaf(leaf)) {
            leaves.push(leaf.left!);
            leaves.push(leaf.right!);
            didSplit = true;
          }
        }
      }
    }
  }
  return leaves;
}

// 根據房間出口資訊產生模板鍵，順序依次為：左、右、上、下
function getRoomTemplateKey(exits: RoomExits): string {
  let key = "";
  if (exits.left) key += "L";
  if (exits.right) key += "R";
  if (exits.up) key += "U";
  if (exits.down) key += "D";
  return key;
}

// 從 templateMap 選取符合出口的模板（若找不到，則使用預設模板）
function selectTemplateForRoom(exits: RoomExits): TileMap {
  const key = getRoomTemplateKey(exits); // 出口方向
  const templates = templateMap[key] || templateMap[""]; // 根據出口方向選擇模板列表，沒有的話選擇預設模板
  const idx = Math.floor(Math.random() * templates.length); // 隨機選擇
  return templates[idx];
}

// 將模板貼入房間區域（模板居中）
function applyRoomTemplate(
  overallTileMap: TileMap,
  roomRect: Rect,
  roomTemplate: TileMap
): void {
  const templateWidth = roomTemplate[0].length;
  const templateHeight = roomTemplate.length;
  const offsetX = roomRect.x + Math.floor((roomRect.width - templateWidth) / 2);
  const offsetY =
    roomRect.y + Math.floor((roomRect.height - templateHeight) / 2);
  // console.log(`房間大小(Rect): ${roomRect.width}*${roomRect.height}`);
  // console.log(`模板大小(template): ${templateWidth}*${templateHeight}`);
  // console.log(`貼上模板到房間上的偏移量:[${offsetX},${offsetY}]`);
  for (let j = 0; j < templateHeight; j++) {
    for (let i = 0; i < templateWidth; i++) {
      overallTileMap[offsetY + j][offsetX + i] = roomTemplate[j][i];
    }
  }
}

// 此處僅以隨機模擬出口資訊
// TODO: 根據走廊連接情形決定
function determineRoomExits(): RoomExits {
  return {
    up: Math.random() > 0.5,
    down: Math.random() > 0.5,
    left: Math.random() > 0.5,
    right: Math.random() > 0.5,
  };
}

// 若 leaf 中沒有明確的 room，遞迴取得子節點中的 room
function getRoom(leaf: Leaf): Rect {
  if (leaf.room) return leaf.room;
  if (leaf.left) return getRoom(leaf.left);
  if (leaf.right) return getRoom(leaf.right);
  return leaf.rect;
}

// 建立走廊，依據全局 CORRIDOR_WIDTH 設定走廊矩形
function createCorridors(leaf: Leaf): void {
  if (leaf.left && leaf.right) {
    const room1 = getRoom(leaf.left);
    const room2 = getRoom(leaf.right);
    const center1 = {
      x: room1.x + Math.floor(room1.width / 2),
      y: room1.y + Math.floor(room1.height / 2),
    };
    const center2 = {
      x: room2.x + Math.floor(room2.width / 2),
      y: room2.y + Math.floor(room2.height / 2),
    };
    if (Math.random() > 0.5) {
      // 先水平後垂直
      const corridorH: Rect = {
        x: Math.min(center1.x, center2.x),
        y: center1.y - Math.floor(CORRIDOR_WIDTH / 2),
        width: Math.abs(center1.x - center2.x) + 1,
        height: CORRIDOR_WIDTH,
      };
      const corridorV: Rect = {
        x: center2.x - Math.floor(CORRIDOR_WIDTH / 2),
        y: Math.min(center1.y, center2.y),
        width: CORRIDOR_WIDTH,
        height: Math.abs(center1.y - center2.y) + 1,
      };
      leaf.corridors = [corridorH, corridorV];
    } else {
      // 先垂直後水平
      const corridorV: Rect = {
        x: center1.x - Math.floor(CORRIDOR_WIDTH / 2),
        y: Math.min(center1.y, center2.y),
        width: CORRIDOR_WIDTH,
        height: Math.abs(center1.y - center2.y) + 1,
      };
      const corridorH: Rect = {
        x: Math.min(center1.x, center2.x),
        y: center2.y - Math.floor(CORRIDOR_WIDTH / 2),
        width: Math.abs(center1.x - center2.x) + 1,
        height: CORRIDOR_WIDTH,
      };
      leaf.corridors = [corridorV, corridorH];
    }
    createCorridors(leaf.left);
    createCorridors(leaf.right);
  }
}

// --------------------
// 主流程：產生整體關卡 tile map 並結合模板與走廊
// --------------------

export function generateLevelWithTemplates(
  mapWidth: number,
  mapHeight: number
): TileMap {
  // 初始化整體 tile map，預設填充為牆壁 "1"
  const overallTileMap: TileMap = Array.from({ length: mapHeight }, () =>
    Array(mapWidth).fill("1")
  );

  const root: Leaf = {
    rect: { x: 0, y: 0, width: mapWidth, height: mapHeight },
  };
  const leaves = createBSPTree(root);

  // 為每個葉節點（房間）建立房間區域並結合模板
  for (const leaf of leaves) {
    const roomPadding = 1;
    const roomRect: Rect = {
      x: leaf.rect.x + roomPadding,
      y: leaf.rect.y + roomPadding,
      width: leaf.rect.width - roomPadding * 2,
      height: leaf.rect.height - roomPadding * 2,
    };
    leaf.room = roomRect;
    // 這裡模擬出口資訊，實際可依走廊連線決定
    leaf.exits = determineRoomExits();
    const roomTemplate = selectTemplateForRoom(leaf.exits);
    applyRoomTemplate(overallTileMap, roomRect, roomTemplate);
  }

  // 建立走廊並更新 tile map，走廊標記以 "0" 表示
  createCorridors(root);
  function fillCorridors(leaf: Leaf) {
    if (leaf.corridors) {
      for (const corridor of leaf.corridors) {
        for (let j = corridor.y; j < corridor.y + corridor.height; j++) {
          for (let i = corridor.x; i < corridor.x + corridor.width; i++) {
            overallTileMap[j][i] = "0";
          }
        }
      }
    }
    if (leaf.left) fillCorridors(leaf.left);
    if (leaf.right) fillCorridors(leaf.right);
  }
  fillCorridors(root);

  // 新增步驟：指定唯一的起始與目標房間、調整模板中的 "h" 與 "g"
  assignHeroAndGoalPoints(overallTileMap, leaves);

  return overallTileMap;
}

/**
 * 在所有房間中選取唯一的起始房與目標房，
 * 並在各自的房間內將 "h" 改成 "H"，"g" 改成 "G"，
 * 其他房間內若有 "h" 或 "g"，則移除（改為 "0" 地板）
 */
function assignHeroAndGoalPoints(overallTileMap: TileMap, leaves: Leaf[]): void {
  // 只選取沒有子節點並有 room 的葉節點
  const roomLeaves = leaves.filter(leaf => !leaf.left && !leaf.right && leaf.room);
  if (roomLeaves.length === 0) return;

  // 隨機選一個房間作為起始房
  const startIndex = Math.floor(Math.random() * roomLeaves.length);
  let startLeaf = roomLeaves[startIndex];

  // 如果至少有兩間房，隨機選另一間作為目標房
  let goalLeaf = startLeaf;
  if (roomLeaves.length > 1) {
    let goalIndex = Math.floor(Math.random() * roomLeaves.length);
    while (goalIndex === startIndex) {
      goalIndex = Math.floor(Math.random() * roomLeaves.length);
    }
    goalLeaf = roomLeaves[goalIndex];
  }

  // 設定房間標記，用於後續判斷
  startLeaf.isStartRoom = true;
  goalLeaf.isGoalRoom = true;

  // 對每個房間的區域進行掃描替換
  for (const leaf of roomLeaves) {
    const room = leaf.room!;
    let heroReplaced = false;
    let goalReplaced = false;
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (overallTileMap[y][x] === "h") {
          // 僅在起始房且首次出現時設置 H，其它替換成 "0"
          if (leaf === startLeaf && !heroReplaced) {
            overallTileMap[y][x] = "H";
            heroReplaced = true;
          } else {
            overallTileMap[y][x] = "0";
          }
        }
        if (overallTileMap[y][x] === "g") {
          // 僅在目標房且首次出現時設置 G，其它替換成 "0"
          if (leaf === goalLeaf && !goalReplaced) {
            overallTileMap[y][x] = "G";
            goalReplaced = true;
          } else {
            overallTileMap[y][x] = "0";
          }
        }
      }
    }
  }
}

