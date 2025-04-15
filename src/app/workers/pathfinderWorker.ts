import findSolutionPath from "@/utils/findSolutionPath";
// import * as wasm from "/wasm/findSolutionPath.js";

// 監聽來自主執行緒的訊息
self.onmessage = function (e) {
  // e.data 需包含 gameMap、width、height 以及 placements
  const { gameMap, width, height, placements } = e.data;

  // 執行路徑搜尋演算法
  const result = wasm.findSolutionPathSimple(
    gameMap,
    width,
    height,
    placements
  );

  // 回傳結果給主執行緒
  self.postMessage(result);
};

// 如果需要額外處理錯誤，可加入 error 監聽器
self.onerror = function (e) {
  console.error("Worker error:", e);
};
