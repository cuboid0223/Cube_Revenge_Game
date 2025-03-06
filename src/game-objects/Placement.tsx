// import { Level} from "@/helpers/types";
import { LevelState } from "@/classes/LevelState";
import {
  DIRECTION_RIGHT,
  CELL_SIZE,
  DIRECTION_LEFT,
  DIRECTION_UP,
  BODY_SKINS,
} from "../helpers/consts";
import { PlacementType } from "@/classes/PlacementFactory";
import { BodyPlacement } from "./BodyPlacement";
import { Direction } from "@/types/global";

export abstract class Placement {
  id: number;
  type: PlacementType;
  x: number;
  y: number;
  level: LevelState;
  skin: string;
  travelPixelsPerFrame: number;
  movingPixelsRemaining: number;
  movingPixelDirection: string;
  spriteFacingDirection: string
  spriteWalkFrame: number;
  hasBeenCollected: boolean;
  canBeStolen: boolean;

  renderFn: () => React.JSX.Element | null;

  constructor(properties: Placement, level: LevelState) {
    this.id = properties.id;
    this.type = properties.type;
    this.x = properties.x;
    this.y = properties.y;
    this.level = level;
    this.skin = BODY_SKINS.NORMAL;
    this.renderFn = () => null;

    this.travelPixelsPerFrame = 1.5; // how quickly the character is going to move( 1 frame 1.5 pixel)
    this.movingPixelsRemaining = 0;
    this.movingPixelDirection = DIRECTION_RIGHT;

    this.spriteFacingDirection = DIRECTION_RIGHT;
    this.spriteWalkFrame = 0;

    this.hasBeenCollected = false;
    this.canBeStolen = true;
  }

  tick() {
    // base class init tick()
  }

  tickAttemptAiMove(): void | null {
    return null;
  }

  isSolidForBody(_body: Placement): boolean {
    // base class init isSolidForBody()
    return false;
  }

  addsItemToInventoryOnCollide(_body?: Placement): string | null {
    // base class init addsItemToInventoryOnCollide()
    return null;
  }

  completesLevelOnCollide() {
    // base class init completesLevelOnCollide()
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
    // console.log(this.movingPixelsRemaining);
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

  canBeUnlocked() {
    return false;
  }

  zIndex() {
    return 1;
  }

  collect() {
    this.hasBeenCollected = true;
    const item = this.addsItemToInventoryOnCollide();
    if (item !== null) {
      this.level.inventory.add(item);
    }
  }

  autoMovesBodyOnCollide(_body: BodyPlacement):boolean | Direction {
    return false;
  }

  changesHeroSkinOnCollide(): string {
    return "";
  }

  switchesDoorsOnCollide(_body: BodyPlacement): boolean | null {
    return null;
  }

  teleportsToPositionOnCollide(_body: BodyPlacement): { x: number; y: number } | null {
    return null;
  }

  stealsInventoryOnCollide(_body: BodyPlacement): boolean | null  {
    return null;
  }

  damagesBodyOnCollide(_body: Placement): string | null {
    return null;
  }

  resetHasBeenCollected() {
    if (this.canBeStolen && this.hasBeenCollected) {
      this.hasBeenCollected = false;
    }
  }

  canBeDeleted() {
    return true;
  }

  renderComponent(): JSX.Element | null {
    // base class init renderComponent()
    return this.renderFn();
  }
}
