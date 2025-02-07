import React, { CSSProperties } from "react";
import { LevelSchema } from "@/helpers/types";
import {
  CELL_SIZE,
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
type Props = {
  level: LevelSchema;
};
export default function LevelPlacementsLayer({ level }: Props) {
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
            level.deletePlacement(placement);
          }}
        >
          {/* <Sprite frameCoord={placement.frameCoord} /> */}
          {placement.renderComponent()}
        </div>
      );
    });
}
