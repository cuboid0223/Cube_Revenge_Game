// 定義矩形
interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 每個 BSP 節點（Leaf）包含一個區域，可能有左右子節點
interface Leaf {
  rect: Rect; // 此節點代表的區域
  left?: Leaf; // 左側子區域
  right?: Leaf; // 右側子區域
  room?: Rect; // 在此葉節點產生的房間
  corridors?: Rect[]; // 從子節點連接走廊（L型走廊通常由兩條小矩形構成）
}

// 參數設定：最小節點尺寸與房間尺寸
const MIN_LEAF_SIZE = 15; // 區域切分的最小尺寸，防止過小
const MIN_ROOM_SIZE = 6; // 房間的最小尺寸

/**
 * 將 leaf 節點進行切分。如果已經切分過則返回 false。
 */
function splitLeaf(leaf: Leaf): boolean {
  // 如果已經有子區域則不再切分
  if (leaf.left || leaf.right) return false;

  // 根據 leaf 的長寬比例與隨機數決定垂直或水平切分
  let splitH = Math.random() > 0.5;
  if (leaf.rect.width / leaf.rect.height >= 1.25) {
    splitH = false;
  } else if (leaf.rect.height / leaf.rect.width >= 1.25) {
    splitH = true;
  }

  // 取決於切分方向，計算可以切分的最大值
  const max = (splitH ? leaf.rect.height : leaf.rect.width) - MIN_LEAF_SIZE;
  if (max <= MIN_LEAF_SIZE) return false; // 不能切分
  // 隨機選擇一個切分點，但保證兩邊都大於 MIN_LEAF_SIZE
  const split =
    Math.floor(Math.random() * (max - MIN_LEAF_SIZE)) + MIN_LEAF_SIZE;
  if (splitH) {
    // 垂直切分，產生上半部與下半部
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
    // 水平切分，產生左側與右側區域
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

/**
 * 遞迴切分整個地圖，產生一組葉節點，返回所有最終未切分的 leaf。
 */
function createBSPTree(root: Leaf): Leaf[] {
  const leaves: Leaf[] = [root];
  let didSplit = true;
  // 當還有可以切分的節點時，持續嘗試切分
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

/**
 * 在每個葉節點中生成一個房間（房間大小隨機，但不會超出該葉區域）。
 */
function createRooms(leaves: Leaf[]): void {
  for (const leaf of leaves) {
    const { x, y, width, height } = leaf.rect;
    // 房間寬高在 [MIN_ROOM_SIZE, (該區域尺寸-2)] 範圍內
    const roomWidth =
      Math.floor(Math.random() * (width - MIN_ROOM_SIZE)) + MIN_ROOM_SIZE;
    const roomHeight =
      Math.floor(Math.random() * (height - MIN_ROOM_SIZE)) + MIN_ROOM_SIZE;
    const roomX = x + Math.floor(Math.random() * (width - roomWidth));
    const roomY = y + Math.floor(Math.random() * (height - roomHeight));
    leaf.room = { x: roomX, y: roomY, width: roomWidth, height: roomHeight };
  }
}

/**
 * 從 BSP 樹中取得一個房間：
 * 若該 leaf 有房間則返回；否則在子區域中找房間（理論上每個葉節點都會有房間）。
 */
function getRoom(leaf: Leaf): Rect {
  if (leaf.room) return leaf.room;
  if (leaf.left) return getRoom(leaf.left);
  if (leaf.right) return getRoom(leaf.right);
  // 預防萬一
  return leaf.rect;
}

/**
 * 為內部節點的兩個子區域的房間建立走廊。這裡使用簡單的 L 型走廊。
 */
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

    // 隨機選擇走廊型態：先水平後垂直或先垂直後水平
    if (Math.random() > 0.5) {
      // 先水平連線，再垂直連線
      const corridor1: Rect = {
        x: Math.min(center1.x, center2.x),
        y: center1.y,
        width: Math.abs(center1.x - center2.x) + 1,
        height: 1,
      };
      const corridor2: Rect = {
        x: center2.x,
        y: Math.min(center1.y, center2.y),
        width: 1,
        height: Math.abs(center1.y - center2.y) + 1,
      };
      leaf.corridors = [corridor1, corridor2];
    } else {
      // 先垂直連線，再水平連線
      const corridor1: Rect = {
        x: center1.x,
        y: Math.min(center1.y, center2.y),
        width: 1,
        height: Math.abs(center1.y - center2.y) + 1,
      };
      const corridor2: Rect = {
        x: Math.min(center1.x, center2.x),
        y: center2.y,
        width: Math.abs(center1.x - center2.x) + 1,
        height: 1,
      };
      leaf.corridors = [corridor1, corridor2];
    }

    // 遞迴建立子區域的走廊
    createCorridors(leaf.left);
    createCorridors(leaf.right);
  }
}

/**
 * 主函式：根據給定的地圖寬度與高度，利用 BSP 分割生成關卡資料
 */
export function generateBSPLevel(
  mapWidth: number,
  mapHeight: number
): { rooms: Rect[]; corridors: Rect[] } {
  // 初始整個地圖的矩形
  const root: Leaf = {
    rect: { x: 0, y: 0, width: mapWidth, height: mapHeight },
  };
  // 遞迴生成 BSP 樹
  const leaves = createBSPTree(root);
  // 在每個葉節點中建立房間
  createRooms(leaves);
  // 為內部節點建立連接走廊
  createCorridors(root);

  // 收集所有房間與走廊，可用來填充地圖陣列
  const rooms: Rect[] = [];
  const corridors: Rect[] = [];
  for (const leaf of leaves) {
    if (leaf.room) rooms.push(leaf.room);
    if (leaf.corridors) corridors.push(...leaf.corridors);
  }
  return { rooms, corridors };
}

// 使用範例：產生一個 50x50 的關卡
