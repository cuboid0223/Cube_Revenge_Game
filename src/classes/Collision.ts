import { LevelSchema, PlacementSchema } from "@/helpers/types";

type PositionType = {
  x: number;
  y: number;
} | null;

export class Collision {
  forBody: PlacementSchema;
  level: LevelSchema;
  placementsAtPosition: PlacementSchema[];
  x: number;
  y: number;

  constructor(
    forBody: PlacementSchema,
    level: LevelSchema,
    position: PositionType
  ) {
    this.forBody = forBody;
    this.level = level;
    this.placementsAtPosition = [];

    // check is there any custom position?
    this.x = position ? position.x : forBody.x;
    this.y = position ? position.y : forBody.y;
    this.scanPlacementsAtPosition();
  }

  scanPlacementsAtPosition() {
    // check 撞到哪個 placements 並加入到 placementsAtPosition
    this.placementsAtPosition = this.level.placements.filter((p) => {
      const isSelf = p.id === this.forBody.id;
      return !isSelf && p.x === this.x && p.y === this.y;
    });
    console.log(this.placementsAtPosition);
  }

  withSolidPlacement() {
    return this.placementsAtPosition.find((p) =>
      p.isSolidForBody(this.forBody)
    );
  }

  withPlacementAddsToInventory() {
    // 撿到 placements 加入到 inventory
    return this.placementsAtPosition.find((p) => {
      return (
        !p.hasBeenCollected && p.addsItemToInventoryOnCollide(this.forBody)
      );
    });
  }
}
