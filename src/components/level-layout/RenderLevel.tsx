import React, { useEffect, useState } from "react";
import styles from "./RenderLevel.module.css";
import { THEME_BACKGROUNDS } from "../../helpers/consts";
import LevelBackgroundTilesLayer from "./LevelBackgroundTilesLayer";
import LevelPlacementsLayer from "./LevelPlacementsLayer";
import { LevelState } from "../../classes/LevelState";
import { Level } from "@/helpers/types";
import LevelCompleteMessage from "../hud/LevelCompleteMessage";
import { useRecoilValue } from "recoil";
import { currentLevelIdAtom } from "../../atoms/currentLevelIdAtom";
import DeathMessage from "../hud/DeathMessage";
import TopHud from "../hud/TopHud";

import soundsManager from "@/classes/Sounds";
import { usePathname } from "next/navigation";

soundsManager.init();

type RenderLevelProps = {
  level: Level
}

export default function RenderLevel({ level }:RenderLevelProps) {
  const pathname = usePathname();
  const showEditorPanel = pathname === "/edit";
  // const cameraTranslate = `translate3d(${level.cameraTransformX}, ${level.cameraTransformY}, 0)`;
  const zoomFactor = showEditorPanel ? level.zoom : 1;
const adjustedCameraTranslate = `translate3d(${level.cameraTransformX / zoomFactor}px, ${level.cameraTransformY / zoomFactor}px, 0)`;
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
            transform: `scale(${showEditorPanel ? level.zoom: 1}) ${adjustedCameraTranslate}  `,
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
      <TopHud level={level} showEditorPanel={showEditorPanel}/>
    </div>
  );
}
