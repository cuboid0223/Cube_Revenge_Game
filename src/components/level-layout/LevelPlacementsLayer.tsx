import React, { CSSProperties } from "react";
import { Level } from "@/helpers/types";
import {
  CELL_SIZE,
  GROUND_PLACEMENT_TYPES,
  PLACEMENT_TYPE_CONVEYOR,
  PLACEMENT_TYPE_FIRE,
  PLACEMENT_TYPE_ICE,
  PLACEMENT_TYPE_SWITCH,
  PLACEMENT_TYPE_SWITCH_DOOR,
  PLACEMENT_TYPE_TELEPORT,
  PLACEMENT_TYPE_THIEF,
  PLACEMENT_TYPE_WATER,
} from "@/helpers/consts";
import { handleColoredTile } from "@/utils/handleColoredTile";
import { Placement } from "@/game-objects/Placement";
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
