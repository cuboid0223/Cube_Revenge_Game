"use client";
import { useEffect, useState } from "react";
import {
  OVERALL_HEIGHT,
  OVERALL_WIDTH,
  SPRITE_SHEET_SRC,
} from "../helpers/consts";
import RenderLevel from "../components/level-layout/RenderLevel";
import { useRecoilState, useRecoilValue } from "recoil";
import { spriteSheetImageAtom } from "../atoms/spriteSheetImageAtom";
import soundsManager from "@/classes/Sounds";
import { LevelState } from "@/classes/LevelState";
import { currentLevelIdAtom } from "@/atoms/currentLevelIdAtom";
import {

  LevelStateSnapshot,
 
} from "@/types/global";

import { TileMap } from "@/helpers/roomTemplatesMap";

import generateLevel from "@/utils/generateLevel";

soundsManager.init();

const MIN_STEPS = 50
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

  useEffect(() => {
    let levelState: LevelState | undefined;

    async function initLevel() {
      let generatedTileMap: TileMap;
      let generatedLevelConfig: LevelStateSnapshot;
      let solutionPath: [number, number][] = [];

      // 重複產生關卡，直到 solutionPath 長度超過 MIN_STEPS
      do {
        const tmpLevel = await generateLevel(OVERALL_WIDTH, OVERALL_HEIGHT);
        generatedTileMap = tmpLevel.generatedTileMap ;
        generatedLevelConfig = tmpLevel.generatedLevelConfig;

        const tempState = new LevelState(
          currentLevelId,
          () => {}, // 不需要更新 UI 所以先用 空 func
          { "DemoLevel1": generatedLevelConfig }
        );

        solutionPath = await tempState.updateSolutionPath();

        tempState.destroy();
      } while (!solutionPath || solutionPath.length <= MIN_STEPS);

      levelState = new LevelState(
        currentLevelId,
        (newState) => setLevel(newState),
        { DemoLevel1: generatedLevelConfig }
      );


      setLevel(levelState);
      levelState.solutionPath = solutionPath;
      levelState.setEditingMode(false);

    }

    initLevel();
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
