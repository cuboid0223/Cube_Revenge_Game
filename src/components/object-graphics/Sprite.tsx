import React from "react";
import { useEffect, useRef } from "react";
import { CELL_SIZE } from "../../helpers/consts";
import { useRecoilValue } from "recoil";
import { spriteSheetImageAtom } from "../../atoms/spriteSheetImageAtom";
import { FrameCoord } from "@/helpers/types";

type SpriteProps = {
  frameCoord: FrameCoord;
  size?: number;
  isColored: boolean;
  index: number[];
};

function Sprite({ frameCoord, size = 16, isColored, index }: SpriteProps) {
  const spriteSheetImage = useRecoilValue(spriteSheetImageAtom);
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

  return (
    <div className="relative">
      <div className={`${isColored ? " absolute z-50 h-4 w-4 " : ""}`}>
        {isColored &&
          index.map((i) => {
            return (
              <p
                key={i} // 確保每個元素有唯一的 `key`
                className="text-[4px] w-fit h-fit px-[1px] text-right text-white opacity-100 bg-yellow-500 rounded-full"
              >
                {i + 1}
              </p>
            );
          })}
      </div>
      <canvas width={size} height={size} ref={canvasRef} />
    </div>
  );
}

const MemoizedSprite = React.memo(Sprite);
export default MemoizedSprite;
