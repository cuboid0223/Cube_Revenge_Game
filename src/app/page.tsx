"use client";
import { useEffect, useState } from "react";
import {
  PLACEMENT_TYPE_HERO,
  PLACEMENT_TYPE_HERO_EDITING,
  SPRITE_SHEET_SRC,
} from "../helpers/consts";
import RenderLevel from "../components/level-layout/RenderLevel";
import { useRecoilState, useRecoilValue } from "recoil";
import { spriteSheetImageAtom } from "../atoms/spriteSheetImageAtom";
import soundsManager from "@/classes/Sounds";
import { LevelState } from "@/classes/LevelState";
import { currentLevelIdAtom } from "@/atoms/currentLevelIdAtom";
import levels from "@/levels/levelsMap";
import {
  ExtendedPlacementConfig,
  LevelStateSnapshot,
  PlacementConfig,
} from "@/types/global";
import { createMap } from "@/utils/findSolutionPath";
import DemoLevel6 from "@/levels/DemoLevel6";
import DemoLevel5 from "@/levels/DemoLevel5";
import DemoLevel4 from "@/levels/DemoLevel4";
import { testTypeScript, testWasm } from "@/utils/measurePerformance";
import DemoLevel7 from "@/levels/DemoLevel7";
import { encodeGameMap, encodePlacements } from "@/utils/encodeObject";
import DemoLevel2 from "@/levels/DemoLevel2";
import generateMap from "@/utils/generateMap";
import { generateLevelWithTemplates } from "@/utils/generateLevelWithTemplates";
import { gm } from "@/utils/gm";
import { TileMap } from "@/helpers/roomTemplatesMap";
import tileMapToLevel from "@/utils/tileMapToLevel";
import DemoLevel1 from "@/levels/DemoLevel1";
import DefaultLevel from "@/levels/DefaultLevel";
import { Placement } from "@/game-objects/Placement";
import { placementFactory } from "@/classes/PlacementFactory";
import generateLevelConfig from "@/utils/generateLevelConfig";

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

  const [level, setLevel] = useState<LevelState | null>(null);
  const currentLevelId = useRecoilValue(currentLevelIdAtom);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [overallTileMap, setOverallTileMap] = useState<TileMap>();

  useEffect(() => {
    let levelState: LevelState | undefined;

    async function initLevel() {
      let generatedTileMap;
      let generatedLevelConfig;
      let solutionPath: [number, number][] = [];

      // 重複產生關卡，直到 solutionPath 長度超過 50
      do {
        // 1. 產生新的 map + config
        const res = await generateLevelConfig(50, 50);
        generatedTileMap = res.generatedTileMap;
        generatedLevelConfig = res.generatedLevelConfig;

        // 2. 使用臨時的 LevelState 來試算路徑
        const tempState = new LevelState(
          currentLevelId,
          () => {}, // 不需要更新 UI
          { DemoLevel1: generatedLevelConfig }
        );

        solutionPath = await tempState.updateSolutionPath();
        // 清理這個臨時物件
        tempState.destroy();
      } while (!solutionPath || solutionPath.length <= 50);

      // 到這裡就有一組可解的 generatedLevelConfig
      levelState = new LevelState(
        currentLevelId,
        (newState) => setLevel(newState),
        { DemoLevel1: generatedLevelConfig }
      );

      // 最後真正 set state
      setOverallTileMap(generatedTileMap);
      setLevel(levelState);
      levelState.solutionPath = solutionPath;
      levelState.setEditingMode(false);

      // 英雄起始位置
      if (levelState.heroRef) {
        setPlayerPos({
          x: levelState.heroRef.x,
          y: levelState.heroRef.y,
        });
      }
    }

    initLevel();
    // 通關後清除
    return () => {
      levelState?.destroy();
    };
  }, [currentLevelId]);

  if (!spriteSheetImage) {
    return <div>Loading assets...</div>;
  }
  if (!level?.heroRef) {
    return <div>Loading level...</div>;
  }

  return <RenderLevel level={level} />;
}
