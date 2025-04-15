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
import { LevelStateSnapshot } from "@/types/global";
import { createMap } from "@/utils/findSolutionPath";
import DemoLevel6 from "@/levels/DemoLevel6";
import DemoLevel5 from "@/levels/DemoLevel5";
import DemoLevel4 from "@/levels/DemoLevel4";
import { testTypeScript, testWasm } from "@/utils/measurePerformance";
// import * as wasm_js from "../../public/pkg/findSolutionPath.js";

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

  useEffect(() => {
    async function loadWasm() {
      try {
        // Use dynamic import with a URL object
        const wasmModule = await import("../../public/wasm/findSolutionPath");

        // Access your WASM functions
        const { findSolutionPathSimple } = wasmModule;
        const placements = level?.placements;
        const gameMap = level?.gameMap;
        if (!gameMap || !placements) return;
        const encodedMap = gameMap?.map((row) => row.join(",")).join("|");
        const encodedPlacements = placements
          ?.map((p) => {
            // 基本字段
            let parts = [p.x, p.y, p.type];

            // 添加可选字段
            if (p.direction) parts.push(p.direction);
            else parts.push("");

            if (p.isRaised !== undefined) parts.push(String(p.isRaised));
            else parts.push("");

            if (p.color) parts.push(p.color);
            // 其他字段根据需要添加...

            return parts.join(",");
          })
          .join("|");

        // 调用函数
        try {
          const width = gameMap[0].length;
          const height = gameMap?.length;
          const solution = findSolutionPathSimple(
            encodedMap,
            width,
            height,
            encodedPlacements
          );

          console.log("找到解决方案:", solution);
        } catch (error) {
          console.error("调用失败:", error);
          // 添加调试信息
          console.log("编码后的地图:", encodedMap);
          console.log("编码后的放置数据:", encodedPlacements);
        }
      } catch (err) {
        console.error("Failed to load WASM module:", err);
        // setError("Failed to load WASM module");
      } finally {
        // setLoading(false);
      }
    }

    loadWasm();
  }, [level?.gameMap, level?.placements]);

  useEffect(() => {
    const testCases = [DemoLevel6, DemoLevel5, DemoLevel4];
    testCases.forEach((testCase, i) => {
      console.log(`測試案例: ${i + 1}`);
      const { gameMap } = createMap(testCase);
      const encodedMap = gameMap?.map((row) => row.join(",")).join("|");
      const encodedPlacements = testCase.placements
        ?.map((p) => {
          // 基本字段
          let parts = [p.x, p.y, p.type];

          // 添加可选字段
          if (p.direction) parts.push(p.direction);
          else parts.push("");

          if (p.isRaised !== undefined) parts.push(String(p.isRaised));
          else parts.push("");

          if (p.color) parts.push(p.color);
          // 其他字段根据需要添加...

          return parts.join(",");
        })
        .join("|");

      // const tsResults = testTypeScript(
      //   gameMap,
      //   testCase.tilesWidth,
      //   testCase.tilesHeight,
      //   testCase.placements
      // );
      const wasmResults = testWasm(
        encodedMap,
        testCase.tilesWidth,
        testCase.tilesHeight,
        encodedPlacements
      );

      console.log(`WASM 平均執行時間: ${wasmResults.average.toFixed(2)}ms`);
      // console.log(`TypeScript 平均執行時間: ${tsResults.average.toFixed(2)}ms`);
      // console.log(
      //   `效能提升比例: ${(tsResults.average / wasmResults.average).toFixed(2)}x`
      // );
    });
  }, []);

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

  if (!spriteSheetImage) {
    return null;
  }
  if (!level) {
    return null;
  }

  return <RenderLevel level={level} />;
}
