import React from "react";
import { useEffect, useRef } from "react";
import { CELL_SIZE } from "../../helpers/consts";
import { useRecoilValue } from "recoil";
import { spriteSheetImageAtom } from "../../atoms/spriteSheetImageAtom";
import { FrameCoord } from "@/helpers/types";
type SpriteProps = {
  frameCoord: FrameCoord;
  size?: number;
};

function Sprite({ frameCoord, size = 16 }: SpriteProps) {
  const spriteSheetImage = useRecoilValue(spriteSheetImageAtom);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    /** @type {HTMLCanvasElement} */
    const canvasEl = canvasRef.current;
    if (!canvasEl || !spriteSheetImage) return;

    const ctx = canvasEl.getContext("2d");

    //Clear out anything in the canvas tag
    // ctx efs to "context"
    // 在畫布上繪製新內容之前使用，用來清除舊內容在畫布上繪製新內容之前使用，用來清除舊內容
    // 把這行註解起來會造成 switch door 兩個圖層疊加
    ctx?.clearRect(0, 0, canvasEl.width, canvasEl.height);

    //Draw a graphic to the canvas tag
    // frameCoord => "1x0", "2x0"
    const tileSheetX = Number(frameCoord.split("x")[0]);
    const tileSheetY = Number(frameCoord.split("x")[1]);

    ctx?.drawImage(
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
  }, [spriteSheetImage, frameCoord, size]);

  return <canvas width={size} height={size} ref={canvasRef} />;
}

const MemoizedSprite = React.memo(Sprite);
export default MemoizedSprite;
