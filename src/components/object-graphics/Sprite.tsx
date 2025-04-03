import React, { useState } from "react";
import { useEffect, useRef } from "react";
import { CELL_SIZE } from "../../helpers/consts";
import { useRecoilValue } from "recoil";
import { spriteSheetImageAtom } from "../../atoms/spriteSheetImageAtom";
import { FrameCoord } from "@/helpers/types";
import { LevelStateSnapshot } from "@/types/global";

type SpriteProps = {
  level: LevelStateSnapshot;
  frameCoord: FrameCoord;
  size?: number;
  isColored: boolean;
  index: number[];
};

function Sprite({
  level,
  frameCoord,
  size = 16,
  isColored,
  index,
}: SpriteProps) {
  const spriteSheetImage = useRecoilValue(spriteSheetImageAtom);
  const [isMouseHover, setIsMouseHover] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    /** @type {HTMLCanvasElement} */
    const canvasEl = canvasRef.current;
    if (!canvasEl || !spriteSheetImage) return;

    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;
    //Clear out anything in the canvas tag
    // ctx efs to "context"
    // 在畫布上繪製新內容之前使用，用來清除舊內容在畫布上繪製新內容之前使用，用來清除舊內容
    // 把這行註解起來會造成 switch door 兩個圖層疊加
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    // Create a temporary canvas for processing
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = size;
    tempCanvas.height = size;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    //Draw a graphic to the canvas tag
    // frameCoord => "1x0", "2x0"
    const tileSheetX = Number(frameCoord?.split("x")[0]);
    const tileSheetY = Number(frameCoord?.split("x")[1]);
    tempCtx.drawImage(
      spriteSheetImage, // Image to pull from
      tileSheetX * CELL_SIZE, // Left X corner of frame
      tileSheetY * CELL_SIZE, // Top Y corner of frame
      size, //How much to crop from the sprite sheet (X)
      size, //How much to crop from the sprite sheet (Y)
      0, //Where to place this on canvas tag X (0)
      0, //Where to place this on canvas tag Y (0)
      size, //How large to scale it (X)
      size //How large to scale it (Y)
    );

    ctx.drawImage(tempCanvas, 0, 0);
  }, [spriteSheetImage, frameCoord, size, isColored]);

  const handleBackgroundColor = () => {
    if (!level?.enableEditing) return;
    setIsMouseHover(true);
  };

  const clearBackgroundColor = () => {
    if (!level?.enableEditing) return;
    setIsMouseHover(false);
  };

  return (
    <div
      className={`relative`}
      onMouseEnter={handleBackgroundColor}
      onMouseLeave={clearBackgroundColor}
    >
      {/* Solution Path 路徑數字標記 */}
      <div
        className={`${
          isColored
            ? " absolute z-40 h-4 w-4 grid grid-flow-col grid-rows-3 grid-cols-2"
            : ""
        }`}
      >
        {isColored &&
          index.map((i) => {
            return (
              <p
                key={i}
                className="text-[4px] w-fit h-fit px-[1px] text-center text-white bg-yellow-500 rounded-full"
              >
                {i + 1}
              </p>
            );
          })}
      </div>

      {/* 編輯模式下滑鼠移動到 TILE上背景會變色 */}
      <div
        className={`${
          isMouseHover ? "absolute z-50 h-4 w-4 opacity-40 bg-yellow-500" : ""
        }`}
      ></div>
      <canvas width={size} height={size} ref={canvasRef} />
    </div>
  );
}

const MemoizedSprite = React.memo(Sprite);
export default MemoizedSprite;
