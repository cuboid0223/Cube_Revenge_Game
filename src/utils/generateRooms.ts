import { RoomInfo, RoomsGrid, RoomType } from "@/helpers/roomTemplatesMap";
/**
 * 產生一個 NxN 的房間網格。
 * 從 (sr, sc) 開始，隨機往上下左右走，直到到達 (gr, gc)。
 * - 如果撞到邊界，就往下 (或強制其他方向)。
 * - 防止無限迴圈：若步數超過 limit，就強制往下 or 往右直到到底。
 */

function createEmptyRooms(n: number): RoomsGrid {
  const rooms: RoomsGrid = [];
  for (let r = 0; r < n; r++) {
    const row: RoomInfo[] = [];
    for (let c = 0; c < n; c++) {
      row.push({
        exits: { up: false, down: false, left: true, right: true },
        inSolutionPath: false,
        isStartRoom: false,
        isGoalRoom: false,
      });
    }
    rooms.push(row);
  }
  return rooms;
}

/**
 * 產生一個 NxN 的房間網格.
 * 如果 N=3  則會產生 3*3 = 9 個房間
 * 每個房間存有 {up,down,left,right} 布林，表示出口方向。
 * 從 (sr,sc) => (gr,gc) 隨機走上下左右 (撞牆→往下, 超過步數→connectToGoal)。
 */
export default function generateRooms(n: number): RoomsGrid {
  const rooms = createEmptyRooms(n);

  // 設定最小距離，例如可以設定為 n/2 (根據需求調整)
  const minDistance = Math.floor(n / 2);

  // 隨機選取 start 房間
  const [sr, sc] = pickRandomRoom(n);

  // 反覆選取 goal 房間，直到符合最小距離的限制
  let gr: number, gc: number;

  do {
    [gr, gc] = pickRandomRoom(n);
  } while (
    (sr === gr && sc === gc) ||
    Math.abs(sr - gr) + Math.abs(sc - gc) < minDistance
  );

  rooms[sr][sc].isStartRoom = true;
  rooms[gr][gc].isGoalRoom = true;

  let r = sr,
    c = sc;
  rooms[r][c].inSolutionPath = true;

  const limit = n * n * 5;
  let steps = 0;

  while (true) {
    steps++;
    if (steps > limit) {
      // 超過 limit 則直接連通到 goal
      connectToGoalExits(r, c, gr, gc, rooms);
      break;
    }

    if (r === gr && c === gc) {
      // 到達 goal
      break;
    }

    // 擲骰 (6 面骰)
    const dice = Math.floor(Math.random() * 6) + 1;
    let nr = r,
      nc = c;

    switch (dice) {
      case 1: // left
        nc = c - 1;
        break;
      case 2: // right
        nc = c + 1;
        break;
      case 3: // down
        nr = r + 1;
        break;
      case 4: // up
        nr = r - 1;
        break;
      case 5: // right
        nc = c + 1;
        break;
      case 6: // down
        nr = r + 1;
        break;
    }

    // 邊界檢查
    if (nr < 0 || nr >= n || nc < 0 || nc >= n) {
      // 撞到邊界則往下走
      nr = r + 1;
      nc = c;
    }
    if (nr >= n) {
      connectToGoalExits(r, c, gr, gc, rooms);
      break;
    }

    // 如果是往下
    if (nr === r + 1 && nc === c) {
      rooms[r][c].exits.down = true;
      rooms[nr][nc].exits.up = true;
    }
    // 如果是往上
    else if (nr === r - 1 && nc === c) {
      rooms[r][c].exits.up = true;
      rooms[nr][nc].exits.down = true;
    }
    // 左右出口一開始預設就是 true

    // 標記進入解題路徑
    rooms[nr][nc].inSolutionPath = true;
    r = nr;
    c = nc;
  }

  return rooms;
}

/**
 * 與前面 connectToGoal 的概念相似,
 * 直接把 (r,c) => (gr,gc) 都用 connectRoom(...) 連上
 * (先上下,再左右,或反之).
 */
// 直接連通到Goal
function connectToGoalExits(
  r: number,
  c: number,
  gr: number,
  gc: number,
  rooms: RoomsGrid
) {
  const n = rooms.length;
  // 簡易: 先上下,再左右
  while (r < gr && r < n - 1) {
    rooms[r][c].exits.down = true;
    rooms[r + 1][c].exits.up = true;
    rooms[r + 1][c].inSolutionPath = true;
    r++;
  }
  while (r > gr && r > 0) {
    rooms[r][c].exits.up = true;
    rooms[r - 1][c].exits.down = true;
    rooms[r - 1][c].inSolutionPath = true;
    r--;
  }
  while (c < gc && c < n - 1) {
    // 左右已是true, 其實不用再設
    rooms[r][c].inSolutionPath = true;
    c++;
  }
  while (c > gc && c > 0) {
    rooms[r][c].inSolutionPath = true;
    c--;
  }
  rooms[r][c].inSolutionPath = true;
}

function pickRandomRoom(n: number): [number, number] {
  // n×n 的房間網格 => 隨機 row,col in [0..n-1]
  const r = Math.floor(Math.random() * n);
  const c = Math.floor(Math.random() * n);
  return [r, c];
}
