import Sprite from "../object-graphics/Sprite";
import { CELL_SIZE } from "../../helpers/consts";
import { handleColoredTile } from "@/utils/handleColoredTile";
import { Level } from "@/helpers/types";
import { FrameCoord } from "@/types/global";

type MapCellType = {
  level: Level;
  x: number;
  y: number;
  frameCoord: FrameCoord;
};

export default function MapCell({ level, x, y, frameCoord }: MapCellType) {
  const { isColored, hslColor, frequency } = handleColoredTile(
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
        backgroundColor: hslColor,
      }}
      onClick={() => {
        if (level.enableEditing) {
          level.addPlacement({
            x: x,
            y: y,
            type: level.editModePlacementType,
          });
        }
      }}
    >
      {isColored && (
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
      )}

      <Sprite frameCoord={frameCoord} />
    </div>
  );
}
