import React, { CSSProperties } from "react";
import { GROUND_PLACEMENT_TYPES } from "@/helpers/consts";
import { LevelStateSnapshot } from "@/types/global";
import { selectedPlacementTypeAtom } from "@/atoms/selectedPlacementType";
import { useRecoilValue } from "recoil";
import { Placement } from "@/game-objects/Placement";
import { useToast } from "@/hooks/use-toast";

type Props = {
  level: LevelStateSnapshot;
};
export default function LevelPlacementsLayer({ level }: Props) {
  const { toast } = useToast();
  const selectedPlacementType = useRecoilValue(selectedPlacementTypeAtom);

  const handleEditObject = (placement: Placement) => {
    if (!level.enableEditing || !placement.canBeDeleted()) {
      return;
    }
    // 如果選取的是 pickup 類 且點選的 placement 不是 pickup 類 則需要浮在上面
    const isFloatingPlacementSelected = !GROUND_PLACEMENT_TYPES.includes(
      selectedPlacementType
    );
    const isFloatingPlacementBeDeleted = !GROUND_PLACEMENT_TYPES.includes(
      placement.type
    );
    if (
      isFloatingPlacementSelected &&
      !GROUND_PLACEMENT_TYPES.includes(placement.type) &&
      selectedPlacementType !== placement.type
    ) {
      // console.log(
      //   `選取 ${selectedPlacementType} ,isFloatingPlacementSelected: ${isFloatingPlacementSelected}  , ${placement.type}`
      // );
      // console.log(JSON.stringify(level.editModePlacement));
      level.addPlacement({
        x: placement.x,
        y: placement.y,
        ...level.editModePlacement,
      });
      toast({
        title: `新增 ${selectedPlacementType}`,
        description: `新增 ${selectedPlacementType} 至 ${placement.type}([${placement.x}, ${placement.y}])上方`,
      });
    } else {
      level.deletePlacement(placement);
      toast({
        title: `移除 ${placement.type}`,
        description: `從 [${placement.x}, ${placement.y}] 移除  ${placement.type}`,
      });
    }
  };

  return level.placements
    .filter((placement) => {
      return !placement.hasBeenCollected;
    })
    .map((placement) => {
      // Wrap each Sprite in a positioned div
      const [x, y] = placement.displayXY();
      const style: CSSProperties = {
        position: "absolute",
        transform: `translate3d(${x}px, ${y}px, 0)`,
        zIndex: placement.zIndex(),
      };

      return (
        <div
          key={placement.id}
          className="z-10"
          style={style}
          onClick={() => handleEditObject(placement)}
        >
          {/* <Sprite frameCoord={placement.frameCoord} /> */}
          {placement.renderComponent()}
        </div>
      );
    });
}
