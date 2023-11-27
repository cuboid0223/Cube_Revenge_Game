import React, { CSSProperties } from "react";
import { LevelSchema } from "@/helpers/types";
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
