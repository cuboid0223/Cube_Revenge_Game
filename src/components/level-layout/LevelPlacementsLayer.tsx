import React, { CSSProperties } from "react";
import { GROUND_PLACEMENT_TYPES } from "@/helpers/consts";
import { LevelStateSnapshot } from "@/types/global";
import { selectedPlacementTypeAtom } from "@/atoms/selectedPlacementType";
import { useRecoilValue } from "recoil";
type Props = {
  level: LevelStateSnapshot;
};
export default function LevelPlacementsLayer({ level }: Props) {
  const selectedPlacementType = useRecoilValue(selectedPlacementTypeAtom);
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
          className="z-100"
          style={style}
          onClick={() => {
            if (!level.enableEditing || !placement.canBeDeleted()) {
              return;
            }
            // 如果選取的是 pickup 類 且點選的 placement 不是 pickup 類 則需要浮在上面
            const isFloatingPlacementSelected =
              !GROUND_PLACEMENT_TYPES.includes(selectedPlacementType);
            const isFloatingPlacementBeDeleted =
              !GROUND_PLACEMENT_TYPES.includes(placement.type);
            if (
              isFloatingPlacementSelected &&
              selectedPlacementType !== placement.type
            ) {
              console.log(
                `選取 ${selectedPlacementType} ,isFloatingPlacementSelected: ${isFloatingPlacementSelected}  , ${placement.type}`
              );
              console.log(JSON.stringify(level.editModePlacement));
              level.addPlacement({
                x: placement.x,
                y: placement.y,
                ...level.editModePlacement,
              });
            } else {
              level.deletePlacement(placement);
            }
          }}
        >
          {/* <Sprite frameCoord={placement.frameCoord} /> */}
          {placement.renderComponent()}
        </div>
      );
    });
}
