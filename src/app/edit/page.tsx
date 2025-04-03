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
import EditorPanel from "@/components/hud/EditorPanel";
soundsManager.init();

import editLevels from "@/levels/editLevelsMap";
import { LevelStateSnapshot } from "@/types/global";

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

  const [level, setLevel] = useState<LevelStateSnapshot | null>(null);
  useEffect(() => {
    // 檢查 localStorage 是否有儲存的 levelState
    const savedLevelJson = localStorage.getItem("levelState");
    let levelState: LevelState;

    if (savedLevelJson) {
      const savedData = JSON.parse(savedLevelJson);
      console.log(savedData);
      // 從 localStorage 的資料中還原 LevelState
      levelState = new LevelState(
        savedData.id,
        (newState) => {
          setLevel(newState);
        },
        { DefaultLevel: savedData }
      );
    } else {
      // 沒有儲存資料，就建立新的 LevelState
      levelState = new LevelState(
        "DefaultLevel",
        (newState) => {
          setLevel(newState);
        },
        editLevels
      );
    }

    // 取得初始狀態
    setLevel(levelState.getState());
    levelState.setEditingMode(true);

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
      <ResizablePanel minSize={15} maxSize={60} defaultSize={20}>
        {/* edit panel */}
        <EditorPanel level={level} />
      </ResizablePanel>
      <ResizableHandle className="w-2" withHandle />

      <ResizablePanel className="relative h-screen" defaultSize={80}>
        <RenderLevel level={level} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
