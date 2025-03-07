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

  const [level, setLevel] = useState<LevelStateSnapshot  | null>(null);
  const currentLevelId = useRecoilValue(currentLevelIdAtom);

  useEffect(() => {
    // Create and subscribe to state changes
    const levelState = new LevelState( currentLevelId, (newState) => {
      setLevel(newState);
    },levels);

    //Get initial state
    setLevel(levelState.getState());
    levelState.setEditingMode(false)
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
