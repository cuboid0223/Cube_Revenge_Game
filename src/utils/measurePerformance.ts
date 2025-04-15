import findSolutionPath from "./findSolutionPath";

// 性能測量函數
function measurePerformance(fn: Function, iterations = 1) {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  return {
    average: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    times,
  };
}

// WASM 版本測試函數
export function testWasm(
  encodedMap,
  width,
  height,
  encodedPlacements,
  iterations = 10
) {
  return measurePerformance(async () => {
    const wasmModule = await import("../../public/wasm/findSolutionPath");
    const { findSolutionPathSimple } = wasmModule;
    return findSolutionPathSimple(encodedMap, width, height, encodedPlacements);
  }, iterations);
}

// TypeScript 版本測試函數
export function testTypeScript(
  gameMap,
  width,
  height,
  placements,
  iterations = 10
) {
  return measurePerformance(() => {
    // 呼叫你的 TypeScript 版本的解決方案
    return findSolutionPath(gameMap, width, height, placements);
  }, iterations);
}
