"use client";
import { useEffect, useState } from "react";
import { SPRITE_SHEET_SRC } from "../helpers/consts";
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

soundsManager.init();

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

    //Get initial state
    setLevel(levelState.getState());
    levelState.setEditingMode(false);
    // test(levelState.gameMap, levelState.placements);
    //Destroy method when this component unmounts for cleanup
    return () => {
      levelState.destroy();
    };

    

  }, [currentLevelId]);

  useEffect(() => {
    // 使用範例：產生一個 50x50 的關卡
    console.log(gm());
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

  if (!spriteSheetImage) {
    return <div>Loading Image...</div>;
  }
  if (!level) {
    return <div>Loading...</div>;
  }

  return <RenderLevel level={level} />;
}
