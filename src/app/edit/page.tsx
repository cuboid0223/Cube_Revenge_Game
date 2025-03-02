"use client";
import { useEffect, useState } from "react";
import { SPRITE_SHEET_SRC } from "@/helpers/consts";
import RenderLevel from "@/components/level-layout/RenderLevel";
import { useRecoilState } from "recoil";
import { spriteSheetImageAtom } from "@/atoms/spriteSheetImageAtom";
import soundsManager from "@/classes/Sounds";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { LevelState } from "../../classes/LevelState";
import { Level } from "@/helpers/types";
import EditorPanel from "@/components/hud/EditorPanel";
soundsManager.init();

import editLevels from "@/levels/editLevelsMap";

export default function EditPage() {
  const [spriteSheetImage, setSpriteSheetImage] =
    useRecoilState(spriteSheetImageAtom);


  useEffect(() => {
    const image = new Image();
    image.src = SPRITE_SHEET_SRC;
    image.onload = () => {
      setSpriteSheetImage(image);
    };
  }, [setSpriteSheetImage]);

  const [level, setLevel] = useState<Level | null>(null);
  useEffect(() => {
    // 檢查 localStorage 是否有儲存的 levelState
    const savedLevelJson = localStorage.getItem("levelState");
    let levelState: LevelState;
    
    if (savedLevelJson) {
      console.log(savedLevelJson)
      const savedData = JSON.parse(savedLevelJson);
      // 從 localStorage 的資料中還原 LevelState
      levelState =  new LevelState({
        "DefaultLevel": savedData,
      }
      , savedData.id, (newState) => {
        setLevel(newState);
      });
    } else {
      // 沒有儲存資料，就建立新的 LevelState
      levelState = new LevelState(editLevels, "DefaultLevel", (newState) => {
        setLevel(newState);
      });
    }

    // 取得初始狀態
    setLevel(levelState.getState());

    // 當元件卸載時，清理 LevelState
    return () => {
      levelState.destroy();
    };
  }, []);

  if (!spriteSheetImage || !level) {
    return null;
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        {/* edit panel */}
        <EditorPanel level={level} />
      </ResizablePanel>
      <ResizableHandle />

      <ResizablePanel className="relative h-screen">
        <RenderLevel level={level} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
