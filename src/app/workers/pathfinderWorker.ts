// 如果你使用 ES modules 的方式，則需要 import 模組（根據你的專案結構調整路徑）
 // 這個模組內含你原先的 A* 演算法

import findSolutionPath from "@/utils/findSolutionPath";

// 監聽來自主執行緒的訊息
self.onmessage = function(e) {
  // e.data 需包含 gameMap、width、height 以及 placements
  const { gameMap, width, height, placements } = e.data;
  
  // 執行路徑搜尋演算法
  const result = findSolutionPath(gameMap, width, height, placements);
  
  // 回傳結果給主執行緒
  self.postMessage(result);
};

// 如果需要額外處理錯誤，可加入 error 監聽器
self.onerror = function(e) {
  console.error("Worker error:", e);
};
