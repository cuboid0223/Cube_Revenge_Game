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
import { generateLevelWithTemplates } from "@/utils/test";
import { gm } from "@/utils/gm";
import { TileMap } from "@/helpers/roomTemplatesMap";
import tileMapToLevel from "@/utils/tileMapToLevel";
import DemoLevel1 from "@/levels/DemoLevel1";
import DefaultLevel from "@/levels/DefaultLevel";
import { Placement } from "@/game-objects/Placement";
import { placementFactory } from "@/classes/PlacementFactory";

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
  // 新增：以 Map 儲存已生成的區塊，key 為 "chunkX,chunkY"，value 為該區塊的 TileMap（此處假設 tile map 為二維字串陣列）
  const [visibleChunks, setVisibleChunks] = useState<Map<string, string[][]>>(
    new Map()
  );
  const [overallTileMap, setOverallTileMap] = useState<TileMap>();

  // useEffect(() => {
  //   // 使用範例：產生一個 50x50 的關卡
  //   // console.log(gm());
  //   const overallTileMap = generateLevelWithTemplates(50, 50);
  //   setOverallTileMap(overallTileMap);
  // }, []);

  useEffect(() => {
    const generatedTileMap = generateLevelWithTemplates(50, 50); // Or your desired size
    setOverallTileMap(generatedTileMap);
    const levelConfig = tileMapToLevel(generatedTileMap);
console.log(levelConfig)
    // Create and subscribe to state changes
    const levelState = new LevelState(
      currentLevelId,
      (newState) => {
        setLevel(newState);
      },
      // levels
      { "DemoLevel1": levelConfig }
    );
    if (!levelState.heroRef) return;

    //Get initial state
    setLevel(levelState);
    levelState.setEditingMode(false);
    // console.log(levelState.placements);

    const heroStartPos = { x: levelState.heroRef?.x, y: levelState.heroRef?.y };
    // console.log(heroStartPos);
    setPlayerPos(heroStartPos);

    //Destroy method when this component unmounts for cleanup
    return () => {
      levelState.destroy();
    };
  }, [currentLevelId]);




  
  if (!spriteSheetImage) {
    return <div>Loading Image...</div>;
  }
  if (!level) {
    return <div>Loading...</div>;
  }

  return <RenderLevel level={level} />;
}
