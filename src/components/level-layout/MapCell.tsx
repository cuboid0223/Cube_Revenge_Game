import Sprite from "../object-graphics/Sprite";
import { CELL_SIZE } from "../../helpers/consts";
import { handleColoredTile } from "@/utils/handleColoredTile";
import { FrameCoord } from "@/helpers/types";
import { LevelStateSnapshot } from "@/types/global";
import { useToast } from "@/hooks/use-toast";

type MapCellType = {
  level: LevelStateSnapshot;
  x: number;
  y: number;
  frameCoord: FrameCoord;
};

export default function MapCell({ level, x, y, frameCoord }: MapCellType) {
  const { toast } = useToast();
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
          toast({
            title: `新增 ${level.editModePlacement.type}`,
            description: `新增 ${level.editModePlacement.type} 至 [${x}, ${y}]`,
          });
        }
      }}
    >
      <Sprite frameCoord={frameCoord} isColored={isColored} index={index} />
    </div>
  );
}
