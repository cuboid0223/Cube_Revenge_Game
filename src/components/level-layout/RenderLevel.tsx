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

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { usePathname } from "next/navigation";
import EditorPanel from "../hud/EditorPanel";
import { transform } from "next/dist/build/swc";

soundsManager.init();

export default function RenderLevel() {
  const [level, setLevel] = useState<Level | null>(null);
  const currentLevelId = useRecoilValue(currentLevelIdAtom);

  const pathname = usePathname();
  const showEditorPanel = pathname === "/edit";

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
    <ResizablePanelGroup direction="horizontal">
      {showEditorPanel && (
        <>
          <ResizablePanel>
            {/* edit panel */}
            <EditorPanel level={level} />
          </ResizablePanel>
          <ResizableHandle />
        </>
      )}

      <ResizablePanel className="relative h-screen">
        <div
          className={styles.fullScreenContainer}
          style={{
            background: THEME_BACKGROUNDS[level.theme],
          }}
        >
          <div className={styles.gameScreen}>
            <div
              style={{
               transform: `scale(${level.zoom}) ${cameraTranslate}`,
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
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
