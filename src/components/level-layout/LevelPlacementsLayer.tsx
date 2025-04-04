import React, { CSSProperties } from "react";
import {
  FLOATING_PLACEMENT_TYPES,
  GROUND_PLACEMENT_TYPES,
} from "@/helpers/consts";
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

  const handleEditMap = (placement: Placement) => {
    if (!level.enableEditing || !placement.canBeDeleted()) {
      return;
    }
    level.clearSolutionPath();
    // 如果選取的是 pickup 類 且點選的 placement 不是 pickup 類 則需要浮在上面
    const isFloatingPlacementSelected = FLOATING_PLACEMENT_TYPES.includes(
      level.editModePlacement.type
    );
    const isGroundPlacementBeClicked = GROUND_PLACEMENT_TYPES.includes(
      placement.type
    );
    console.log(
      `選取 ${JSON.stringify(
        level.editModePlacement
      )} ,isFloatingPlacementSelected: ${isFloatingPlacementSelected}  , ${
        placement.type
      }`
    );
    if (
      isFloatingPlacementSelected &&
      isGroundPlacementBeClicked &&
      selectedPlacementType !== placement.type
    ) {
      level.addPlacement({
        x: placement.x,
        y: placement.y,
        ...level.editModePlacement,
      });
      toast({
        title: `新增 ${level.editModePlacement.type}`,
        description: `新增 ${level.editModePlacement.type} 至 ${placement.type}([${placement.x}, ${placement.y}])上方`,
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
          // className="z-10"
          style={style}
          onClick={() => handleEditMap(placement)}
        >
          {/* <Sprite frameCoord={placement.frameCoord} /> */}
          {placement.renderComponent()}
        </div>
      );
    });
}
