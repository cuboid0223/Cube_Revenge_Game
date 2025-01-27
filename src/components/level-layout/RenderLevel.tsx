import React, { CSSProperties, useEffect, useState } from "react";
import styles from "./RenderLevel.module.css";
import { PLACEMENT_TYPE_FIRE_PICKUP, PLACEMENT_TYPE_FLOUR, PLACEMENT_TYPE_GOAL, PLACEMENT_TYPE_HERO, PLACEMENT_TYPE_TELEPORT, THEME_BACKGROUNDS } from "../../helpers/consts";
import LevelBackgroundTilesLayer from "./LevelBackgroundTilesLayer";
import LevelPlacementsLayer from "./LevelPlacementsLayer";
import { LevelState } from "../../classes/LevelState";
import { LevelSchema } from "@/helpers/types";
import LevelCompleteMessage from "../hud/LevelCompleteMessage";
import { useRecoilValue } from "recoil";
import { currentLevelIdAtom } from "../../atoms/currentLevelIdAtom";
import DeathMessage from "../hud/DeathMessage";
import TopHud from "../hud/TopHud";
import canCompleteLevel, { aStarWithMechanics, bfsWithMechanics, createMap, findPositions } from "@/utils/canCompleteLevel";
import DemoLevel1 from "@/levels/DemoLevel1";
import DemoLevel2 from "@/levels/DemoLevel2";

export default function RenderLevel() {
  const [level, setLevel] = useState<LevelSchema | null>(null);
  const currentLevelId = useRecoilValue(currentLevelIdAtom);


  useEffect(()=>{
   

    // 生成地圖
    const { gameMap, placements } = createMap(DemoLevel1);

    // 主角、目標、收集物、障礙物
    const heroPos = findPositions(placements, PLACEMENT_TYPE_HERO)[0];
    const goalPos = findPositions(placements,PLACEMENT_TYPE_GOAL)[0];
    const flourPositions = findPositions(placements, PLACEMENT_TYPE_FLOUR);
    const firePickupPositions = findPositions(placements, PLACEMENT_TYPE_FIRE_PICKUP);
    const teleportPositions = findPositions(placements, PLACEMENT_TYPE_TELEPORT);

    // 檢查能否完成
    const canComplete = aStarWithMechanics(
      heroPos,
      // [...flourPositions, goalPos],
      gameMap,
      DemoLevel1.tilesWidth,
      DemoLevel1.tilesHeight,
      placements
    );

    console.log(canComplete);


  },[])

  useEffect(() => {
    // Create and subscribe to state changes
    const levelState = new LevelState(currentLevelId, (newState) => {
      setLevel(newState);
    });

    //Get initial state
    setLevel(levelState.getState());

    //Destroy method when this component unmounts for cleanup
    return () => {
      levelState.destroy();
    };
  }, [currentLevelId]);

  if (!level) {
    return null;
  }
  const cameraTranslate = `translate3d(${level.cameraTransformX}, ${level.cameraTransformY}, 0)`;

  return (
    <div
      className={styles.fullScreenContainer}
      style={{
        background: THEME_BACKGROUNDS[level.theme],
      }}
    >
      <div className={styles.gameScreen}>
        <div
          style={{
            transform: cameraTranslate,
          }}
        >
          {/* 遊戲場景層 */}
          <LevelBackgroundTilesLayer level={level} />
          {/* 遊戲物體層 */}
          <LevelPlacementsLayer level={level} />
        </div>

        {level.isCompleted && <LevelCompleteMessage />}
        {level.deathOutcome && <DeathMessage level={level} />}
      </div>
      <TopHud level={level} />
    </div>
  );
}
