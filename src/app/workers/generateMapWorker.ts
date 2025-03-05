// 若使用 TypeScript，最上面可以加入：
/// <reference lib="webworker" />


import generateMap from "@/utils/generateMap";

// 監聽主執行緒傳入的訊息
self.onmessage = (event) => {
  // event.data 為傳入的參數，型別為 MapInfo (例如 { roomGridSize, roomWidth, roomHeight, levelTheme, maxAttempts })
  const config = event.data;
  try {
    // 執行生成地圖的運算
    const levelData = generateMap(config);
    // 將結果回傳給主執行緒
    self.postMessage({ success: true, levelData });
  } catch (error) {
    let message = 'Unknown error';
    if (error instanceof Error) {
      message = error.message;
    }
    self.postMessage({ success: false, error: message });
  }
};

// 若需要監聽錯誤事件也可以這樣寫：
self.onerror = (error) => {
  console.error("Worker error:", error);
};
