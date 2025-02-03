import Sprite from "../object-graphics/Sprite";
import { CELL_SIZE } from "../../helpers/consts";
import { handleColoredTile } from "@/utils/handleColoredTile";

export default function MapCell({ level, x, y, frameCoord }) {

  const {isColored, hslColor,frequency} = handleColoredTile(undefined, x, y, level.solutionPath)

  return (
    <div
      style={{
        position: "absolute",
        left: x * CELL_SIZE,
        top: y * CELL_SIZE,
        backgroundColor: hslColor
      }}
      onClick={() => {
        if (level.enableEditing) {
          level.addPlacement({
            x: x,
            y: y,
            type: level.editModePlacementType,
          });
          level.updateSolutionPath()
        }
      }}
    >
      {isColored && (
        <div 
        style={{
          width: CELL_SIZE,
          height: CELL_SIZE,
          // backgroundColor: hslColor
        }}  
        className={` overflow-hidden`}>
          <pre className="absolute text-xs z-100"> {frequency}</pre>
        </div>
      )}

      <Sprite frameCoord={frameCoord} />
    </div>
  );
}
