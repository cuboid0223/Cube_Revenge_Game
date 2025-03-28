import Sprite from "../object-graphics/Sprite";
import { CELL_SIZE } from "../../helpers/consts";
import { handleColoredTile } from "@/utils/handleColoredTile";
import { FrameCoord } from "@/helpers/types";
import { LevelStateSnapshot } from "@/types/global";

type MapCellType = {
  level: LevelStateSnapshot;
  x: number;
  y: number;
  frameCoord: FrameCoord;
};

export default function MapCell({ level, x, y, frameCoord }: MapCellType) {
  const { isColored, frequency, index } = handleColoredTile(
    undefined,
    x,
    y,
    level.solutionPath
  );

  return (
    <div
      style={{
        position: "absolute",
        left: x * CELL_SIZE,
        top: y * CELL_SIZE,
        // backgroundColor: hslColor,
      }}
      onClick={() => {
        if (level.enableEditing) {
          level.addPlacement({
            x: x,
            y: y,
            ...level.editModePlacement,
          });
        }
      }}
    >
      {/* {isColored && (
        <div
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            // backgroundColor: hslColor
            border: "1px solid white",
          }}
          className={`overflow-hidden`}
        >
          <pre className="absolute text-xs"> {frequency}</pre>
        </div>
      )} */}

      <Sprite frameCoord={frameCoord} isColored={isColored} index={index} />
    </div>
  );
}
