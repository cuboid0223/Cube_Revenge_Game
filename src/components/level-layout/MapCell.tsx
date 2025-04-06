import Sprite from "../object-graphics/Sprite";
import { CELL_SIZE } from "../../helpers/consts";
import { handleColoredTile } from "@/utils/handleColoredTile";
import { FrameCoord } from "@/helpers/types";
import { LevelStateSnapshot } from "@/types/global";
import { useToast } from "@/hooks/use-toast";
import { isValidPlacementCombination } from "@/utils/isValidPlacementCombination";
import { usePathname } from 'next/navigation'

type MapCellType = {
  level: LevelStateSnapshot;
  x: number;
  y: number;
  frameCoord: FrameCoord;
};

export default function MapCell({ level, x, y, frameCoord }: MapCellType) {
  const pathname = usePathname()
  const isEditPage = pathname === '/edit'
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
        // backgroundColor: "red",
      }}
      onClick={() => {
        if (isEditPage && isValidPlacementCombination(level, x, y)) {
          // 檢查該位置是否已經有相同類型的 placement
          const existingPlacement = level.placements.some(
            (p) =>
              p.x === x && p.y === y && p.type === level.editModePlacement.type
          );

          // 如果已有相同類型的 placement，則阻止新增
          if (existingPlacement) {
            toast({
              title: `新增 ${level.editModePlacement.type} 至 [${x}, ${y}] 失敗`,
              description: `此位置已經有相同類型的元素。`,
            });
            return;
          }

          // 清除解法路徑並新增 placement
          level.clearSolutionPath();
          level.addPlacement({
            x: x,
            y: y,
            ...level.editModePlacement,
          });

          // 新增完成後給予反饋
          toast({
            title: `新增 ${level.editModePlacement.type}`,
            description: `新增 ${level.editModePlacement.type} 至 [${x}, ${y}]`,
          });
        } else {
          // 如果條件不符合，顯示錯誤
          if(isEditPage){
            toast({
              title: `新增 ${level.editModePlacement.type} 至 [${x}, ${y}] 失敗`,
              description: `同位置只能剛好由一個浮動元素及一個地面元素組成。`,
            });
          }
        }
      }}
    >
      <Sprite
        level={level}
        frameCoord={frameCoord}
        isColored={isColored}
        index={index}
      />
    </div>
  );
}
