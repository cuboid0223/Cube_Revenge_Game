import { LevelSchema, PlacementSchema } from "@/helpers/types";
import {
  DIRECTION_RIGHT,
  CELL_SIZE,
  DIRECTION_LEFT,
  DIRECTION_UP,
} from "../helpers/consts";

export class Placement {
  id: number;
  type?: string;
  x: number;
  y: number;
  level: LevelSchema;
  travelPixelsPerFrame: number;
  movingPixelsRemaining: number;
  movingPixelDirection: string;
  renderFn: () => React.JSX.Element | null;

  constructor(properties: PlacementSchema, level: LevelSchema) {
    this.id = properties.id;
    this.type = properties.type;
    this.x = properties.x;
    this.y = properties.y;
    this.level = level;
    this.renderFn = () => null;

    this.travelPixelsPerFrame = 1.5; // how quickly the character is going to move( 1 frame 1.5 pixel)
    this.movingPixelsRemaining = 0;
    this.movingPixelDirection = DIRECTION_RIGHT;

    this.spriteFacingDirection = DIRECTION_RIGHT;
    this.spriteWalkFrame = 0;
  }

  tick() {}

  isSolidForBody(_body: PlacementSchema): boolean {
    return false;
  }

  displayXY() {
    if (this.movingPixelsRemaining > 0) {
      return this.displayMovingXY();
    }

    const x = this.x * CELL_SIZE;
    const y = this.y * CELL_SIZE;
    return [x, y];
  }

  displayMovingXY() {
    const x = this.x * CELL_SIZE;
    const y = this.y * CELL_SIZE;
    // movingPixelsRemaining 介於 1 - 16
    // 會隨時間每個 frame 遞減 1.5 pixel
    // 16 -> 14.5 -> 13 -> ... 1.5
    console.log(this.movingPixelsRemaining);
    const progressPixels = CELL_SIZE - this.movingPixelsRemaining;
    switch (this.movingPixelDirection) {
      case DIRECTION_LEFT:
        return [x - progressPixels, y];
      case DIRECTION_RIGHT:
        return [x + progressPixels, y];
      case DIRECTION_UP:
        return [x, y - progressPixels];
      default:
        return [x, y + progressPixels];
    }
  }

  zIndex() {
    return 1;
  }

  renderComponent(): JSX.Element | null {
    return this.renderFn();
  }
}
