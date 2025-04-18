"use client";
import { useEffect, useState } from "react";
import { PLACEMENT_TYPE_HERO, SPRITE_SHEET_SRC } from "../helpers/consts";
import RenderLevel from "../components/level-layout/RenderLevel";
import { useRecoilState, useRecoilValue } from "recoil";
import { spriteSheetImageAtom } from "../atoms/spriteSheetImageAtom";
import soundsManager from "@/classes/Sounds";
import { LevelState } from "@/classes/LevelState";
import { currentLevelIdAtom } from "@/atoms/currentLevelIdAtom";
import levels from "@/levels/levelsMap";
import { ExtendedPlacementConfig, LevelStateSnapshot } from "@/types/global";
import { createMap } from "@/utils/findSolutionPath";
import DemoLevel6 from "@/levels/DemoLevel6";
import DemoLevel5 from "@/levels/DemoLevel5";
import DemoLevel4 from "@/levels/DemoLevel4";
import { testTypeScript, testWasm } from "@/utils/measurePerformance";
import DemoLevel7 from "@/levels/DemoLevel7";
import { encodeGameMap, encodePlacements } from "@/utils/encodeObject";
import DemoLevel2 from "@/levels/DemoLevel2";
import generateMap from "@/utils/generateMap";
import { generateLevelWithTemplates } from "@/utils/test";
import { gm } from "@/utils/gm";
import { TileMap } from "@/helpers/roomTemplatesMap";
import tileMapToLevel from "@/utils/tileMapToLevel";
import DemoLevel1 from "@/levels/DemoLevel1";
import DefaultLevel from "@/levels/DefaultLevel";
import { Placement } from "@/game-objects/Placement";

soundsManager.init();

// 定義區塊大小與玩家視野範圍（以區塊數計算）
const CHUNK_SIZE = 5;
const VIEW_RADIUS = 1; // 玩家周圍 2 個區塊內都會生成

export default function Home() {
  const [spriteSheetImage, setSpriteSheetImage] =
    useRecoilState(spriteSheetImageAtom);

  useEffect(() => {
    const image = new Image();
    image.src = SPRITE_SHEET_SRC;
    image.onload = () => {
      setSpriteSheetImage(image);
    };
  }, [setSpriteSheetImage]);

  const [level, setLevel] = useState<LevelStateSnapshot | null>(null);
  const currentLevelId = useRecoilValue(currentLevelIdAtom);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  // 新增：以 Map 儲存已生成的區塊，key 為 "chunkX,chunkY"，value 為該區塊的 TileMap（此處假設 tile map 為二維字串陣列）
  const [visibleChunks, setVisibleChunks] = useState<Map<string, string[][]>>(
    new Map()
  );
  const [overallTileMap, setOverallTileMap] = useState<TileMap>();

  // useEffect(() => {
  //   async function loadWasm() {
  //     try {
  //       // Use dynamic import with a URL object
  //       const wasmModule = await import("../../public/wasm/findSolutionPath");
  //       const { findSolutionPathSimple } = wasmModule;

  //       const width = level?.tilesWidth;
  //       const height = level?.tilesHeight;
  //       const placements = level?.placements;
  //       const gameMap = level?.gameMap;

  //       if (!gameMap || !placements) return;
  //       const encodedMap = encodeGameMap(gameMap);
  //       const encodedPlacements = encodePlacements(placements);

  //       try {
  //         const solution = findSolutionPathSimple(
  //           encodedMap,
  //           width,
  //           height,
  //           encodedPlacements
  //         );
  //         level.solutionPath = solution;

  //         console.log("WASM 找到解决方案:", solution);
  //       } catch (error) {
  //         console.error("呼叫 WASM 失敗:", error);
  //         // 添加调试信息
  //         console.log("encodedMap:", encodedMap);
  //         console.log("encodedPlacements:", encodedPlacements);
  //       }
  //     } catch (err) {
  //       console.error("Failed to load WASM module:", err);
  //     } finally {
  //       // setLoading(false);
  //     }
  //   }

  //   loadWasm();
  // }, [
  //   level?.gameMap,
  //   level?.placements,
  //   level?.tilesHeight,
  //   level?.tilesWidth,
  // ]);

  // 用來測試 WASM 跟 TS 的效能差異
  // useEffect(() => {
  //   const testCases = [DemoLevel7, DemoLevel6, DemoLevel5, DemoLevel4];
  //   testCases.forEach((testCase, i) => {
  //     console.log(`測試地圖: ${i + 1}`);
  //     const { gameMap } = createMap(testCase);
  //     const encodedMap = encodeGameMap(gameMap);
  //     const encodedPlacements = encodePlacements(
  //       testCase.placements as ExtendedPlacementConfig[]
  //     );
  //     console.log(encodedMap);
  //     console.log(encodedPlacements);

  //     const tsResults = testTypeScript(
  //       gameMap,
  //       testCase.tilesWidth,
  //       testCase.tilesHeight,
  //       testCase.placements,
  //       10
  //     );
  //     const wasmResults = testWasm(
  //       encodedMap,
  //       testCase.tilesWidth,
  //       testCase.tilesHeight,
  //       encodedPlacements,
  //       10
  //     );

  //     console.log(`WASM 平均執行時間: ${wasmResults.average.toFixed(8)}ms`);
  //     console.log(`TypeScript 平均執行時間: ${tsResults.average.toFixed(8)}ms`);
  //     console.log(
  //       `效能提升比例: ${(tsResults.average / wasmResults.average).toFixed(8)}x`
  //     );
  //   });
  // }, []);

  useEffect(() => {
    // Create and subscribe to state changes
    const levelState = new LevelState(
      currentLevelId,
      (newState) => {
        setLevel(newState);
      },
      levels
    );
    if (!levelState.heroRef) return;

    //Get initial state
    setLevel(levelState.getState());
    levelState.setEditingMode(false);
    console.log(levelState.placements)
  
    const heroStartPos = { x: levelState.heroRef?.x, y: levelState.heroRef?.y };
    console.log(heroStartPos)
    setPlayerPos(heroStartPos);

    //Destroy method when this component unmounts for cleanup
    return () => {
      levelState.destroy();
    };
  }, [currentLevelId]);

  useEffect(() => {
    // 使用範例：產生一個 50x50 的關卡
    // console.log(gm());
    const overallTileMap = generateLevelWithTemplates(20, 20);
    setOverallTileMap(overallTileMap);
  }, []);

  // useEffect(() => {
  //   async function init() {
  //     try {
  //       // 等待產生 DemoLevel1 的地圖
  //       const demoLevel1Snapshot = await generateMap();
  //       const levels = {
  //         DemoLevel1: demoLevel1Snapshot as LevelStateSnapshot,
  //         DemoLevel2: DemoLevel2,
  //       };

  //       const levelState = new LevelState(
  //         currentLevelId,
  //         (newState) => {
  //           setLevel(newState);
  //         },
  //         levels
  //       );
  //       setLevel(levelState.getState());
  //     } catch (error) {
  //       console.error("初始化地圖失敗:", error);
  //     }
  //   }
  //   init();
  // }, [currentLevelId]);

  // 玩家位置變化時，更新附近區塊
  // 玩家位置變化時，更新附近區塊
  useEffect(() => {
    if (!level?.heroRef) return;

    // 根據玩家位置生成區塊 - 修改為以玩家為中心的 10x10 區域
    const generatePlayerCenteredChunk = () => {
      const heroX = level.heroRef.x; // 假設這是 15
      const heroY = level.heroRef.y; // 假設這是 10
      
      // 計算視野範圍 (總共 11x11 的區塊大小)
      const viewRadius = CHUNK_SIZE; // 視野半徑為 5
      const chunkSize = viewRadius * 2 + 1; // 11x11
      
      // 計算區塊的起始座標 (左上角) - 確保英雄在中心
      const chunkStartX = heroX - viewRadius; // 應該是 15-5=10
      const chunkStartY = heroY - viewRadius; // 應該是 10-5=5
      
      // 計算區塊的終止座標 (右下角)
      const chunkEndX = chunkStartX + chunkSize - 1; // 應該是 10+11-1=20
      const chunkEndY = chunkStartY + chunkSize - 1; // 應該是 5+11-1=15
      
      // 生成唯一的區塊識別符
      const chunkKey = `${chunkStartX},${chunkStartY}`;
      
      // 如果此區塊已存在，直接返回
      if (visibleChunks.has(chunkKey)) {
        return {
          chunkMap: visibleChunks.get(chunkKey),
          chunkStartX,
          chunkStartY
        };
      }
      
      // 生成新區塊
      let chunkMap;
      
      if (overallTileMap) {
        // 從整體地圖中提取區塊
        chunkMap = Array.from({ length: chunkSize }, (_, row) =>
          Array.from({ length: chunkSize }, (_, col) => {
            // 計算在全局地圖中的實際位置
            const mapX = chunkStartX + col;
            const mapY = chunkStartY + row;
            // console.log(`[${mapX},${mapY}]`)
            // 確保座標在整體地圖範圍內
            if (
              mapX >= 0 &&
              mapX < overallTileMap[0].length &&
              mapY >= 0 &&
              mapY < overallTileMap.length
            ) {
              return overallTileMap[mapY][mapX];
            }
            return "1E"; // 超出範圍時設為牆壁
          })
        );
      } else {
        console.log("沒有 overallTileMap");
        // 簡單生成一個有邊界的區塊
        chunkMap = Array.from({ length: chunkSize }, (_, row) =>
          Array.from({ length: chunkSize }, (_, col) => {
            if (
              row === 0 ||
              col === 0 ||
              row === chunkSize - 1 ||
              col === chunkSize - 1
            ) {
              return "1"; // 邊界設為牆壁
            }
            return "0"; // 內部設為空地
          })
        );
      }
      
      // 儲存新生成的區塊
      const newChunks = new Map(visibleChunks);
      newChunks.set(chunkKey, chunkMap);
      setVisibleChunks(newChunks);
      
      // 計算英雄在區塊中的相對位置
      const heroChunkX = heroX - chunkStartX; // 應該是 15-10=5
      const heroChunkY = heroY - chunkStartY; // 應該是 10-5=5
      console.log(overallTileMap)
      console.log(heroX, heroY)
      console.log(
        `生成區塊: [${chunkStartX},${chunkStartY}] 至 [${chunkEndX},${chunkEndY}]`,
        chunkMap
      );
      console.log(`英雄在區塊中的相對位置: [${heroChunkX},${heroChunkY}]`);
      
      return { chunkMap, chunkStartX, chunkStartY };
    };

    // 更新當前玩家位置並生成區塊
    console.log(`更新 hero pos: [${level.heroRef.x},${level.heroRef.y}]`);
    setPlayerPos({ x: level.heroRef.x, y: level.heroRef.y });

    // 生成新的區塊數據
    const { chunkMap, chunkStartX, chunkStartY } =
      generatePlayerCenteredChunk();

    if (!chunkMap) return;
    console.log(chunkMap);
    // 將區塊轉換為 level 數據
    const chunkLevel = tileMapToLevel(chunkMap as TileMap);

    // 只更新 level 的地圖相關數據，保持其他狀態
    if (level) {
      // 深拷貝當前 level 狀態
      const updatedLevel = { ...level };

      // 更新地圖相關屬性
      updatedLevel.gameMap = chunkMap;
      updatedLevel.tilesWidth = chunkLevel.tilesWidth;
      updatedLevel.tilesHeight = chunkLevel.tilesHeight;
      console.log(chunkLevel);
      // 更新地圖物件位置，加上偏移量來適應區塊位置
      if (chunkLevel.placements) {
        // 轉換放置物件的座標，使其相對於當前區塊
        const adjustedPlacements: Placement[] = chunkLevel.placements.map((placement) => {
          // 根據需要複製並調整放置物件的座標
          return {
            ...placement,
            x: placement.x, // 如果需要偏移，可以加上 chunkStartX - 1
            y: placement.y, // 如果需要偏移，可以加上 chunkStartY - 1
          };
        });

        // 合併原有的和新的放置物件，可能需要過濾重複的
        updatedLevel.placements = [
          // 保留非地圖物件的原始放置物（如英雄）
          ...level.placements.filter((p) => p.type === PLACEMENT_TYPE_HERO),
          // 添加新區塊的地形物件
          ...adjustedPlacements.filter((p) => p.type !== PLACEMENT_TYPE_HERO),
        ];
      }

      // 確保英雄的位置相對於新區塊是正確的
      if (updatedLevel.heroRef) {
        // 如果需要，可以調整英雄的位置
        // updatedLevel.heroRef.x = level.heroRef.x - (chunkStartX - 1);
        // updatedLevel.heroRef.y = level.heroRef.y - (chunkStartY - 1);
      }
      console.log(updatedLevel);

      // 更新 level 狀態
      // setLevel(updatedLevel);
    }
  }, [
    level?.heroRef?.x,
    level?.heroRef?.y,
    overallTileMap,
    level?.heroRef,
    visibleChunks,
  ]);

  if (!spriteSheetImage) {
    return <div>Loading Image...</div>;
  }
  if (!level) {
    return <div>Loading...</div>;
  }

  return <RenderLevel level={level} />;
}
