import Body from "@/components/object-graphics/Body";
import { Placement } from "./Placement";
import { TILES } from "@/helpers/tiles";
import {
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
} from "@/helpers/consts";
import { BodyPlacement } from "./BodyPlacement";

export class GroundEnemyPlacement extends BodyPlacement {
  constructor(properties, level) {
    super(properties, level);
    this.tickBetweenMovesInterval = 28; // hop! wait 28 frames and hop! wait 28 frames
    this.ticksUntilNextMove = this.tickBetweenMovesInterval;
    this.turnsAroundAtWater = true;
    this.movingPixelDirection = properties.initialDirection ?? DIRECTION_RIGHT; // 上下移動
    this.interactsWithGround = true;
  }

  tickAttemptAiMove() {
    this.checkForOverlapWithHero();

    if (this.ticksUntilNextMove > 0) {
      this.ticksUntilNextMove -= 1;
      return;
    }
    this.internalMoveRequested(this.movingPixelDirection);
  }

  checkForOverlapWithHero() {
    const [myX, myY] = this.displayXY();
    const [heroX, heroY] = this.level.heroRef.displayXY();
    const xDiff = Math.abs(myX - heroX); // how far from hero (horizontal)
    const yDiff = Math.abs(myY - heroY); // how far from hero (vertical)
    if (xDiff <= 2 && yDiff <= 2) {
      this.level.setDeathOutcome(this.type);
    }
  }

  internalMoveRequested(direction) {
    //Attempt to start moving
    if (this.movingPixelsRemaining > 0) {
      return;
    }

    if (this.isSolidAtNextPosition(direction)) {
      this.switchDirection();
      return;
    }

    //Start the move
    this.ticksUntilNextMove = this.tickBetweenMovesInterval;
    this.movingPixelsRemaining = 16;
    this.movingPixelDirection = direction;
    this.updateFacingDirection();
    this.updateWalkFrame();
  }

  onAutoMovement(direction) {
    this.internalMoveRequested(direction);
  }

  switchDirection() {
    const currentDir = this.movingPixelDirection;

    // Horizontal change
    if (currentDir === DIRECTION_LEFT || currentDir === DIRECTION_RIGHT) {
      this.movingPixelDirection =
        currentDir === DIRECTION_LEFT ? DIRECTION_RIGHT : DIRECTION_LEFT;
      return;
    }
    // Vertical change
    currentDir === DIRECTION_UP ? DIRECTION_DOWN : DIRECTION_UP;
  }



  renderComponent() {
    const frameCoord =
      this.spriteFacingDirection === DIRECTION_LEFT
        ? TILES.ENEMY_LEFT
        : TILES.ENEMY_RIGHT;
    return (
      <Body
        frameCoord={frameCoord}
        yTranslate={this.getYTranslate()}
        showShadow={true}
      />
    );
  }
}
