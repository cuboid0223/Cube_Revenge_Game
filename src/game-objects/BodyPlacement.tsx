import { Placement } from "./Placement";
import {
  BODY_SKINS,
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  directionUpdateMap,
  PLACEMENT_TYPE_CELEBRATION,
  Z_INDEX_LAYER_SIZE,
} from "../helpers/consts";
import { Collision } from "../classes/Collision";

export class BodyPlacement extends Placement {
  getCollisionAtNextPosition(direction) {
    // 取得移動到下一個位置遇到的 placements
    // e.g. lock placement
    const { x, y } = directionUpdateMap[direction];
    const nextX = this.x + x;
    const nextY = this.y + y;
    return new Collision(this, this.level, { x: nextX, y: nextY });
  }

  getLockAtNextPosition(direction) {
    const collision = this.getCollisionAtNextPosition(direction);
    return collision.withLock();
  }

  isSolidAtNextPosition(direction) {
    const collision = this.getCollisionAtNextPosition(direction);

    const isOutOfBounds = this.level.isPositionOutOfBounds(
      collision.x,
      collision.y
    );
    if (isOutOfBounds) {
      return true;
    }

    return Boolean(collision.withSolidPlacement());
  }

  updateFacingDirection() {
    if (
      this.movingPixelDirection === DIRECTION_LEFT ||
      this.movingPixelDirection === DIRECTION_RIGHT
    ) {
      // 新增  spriteFacingDirection 這個變數的用意是
      // 假設我們要讓角色踩到機關並倒退一格，這時角色的應該面向右邊而往左後退或是面向左邊而往右後退
      // 所以我們將 spriteFacingDirection, movingPixelDirection 兩個看似作用相同的變數分開
      this.spriteFacingDirection = this.movingPixelDirection;
    }
  }

  updateWalkFrame() {
    this.spriteWalkFrame = this.spriteWalkFrame === 1 ? 0 : 1;
  }

  tick() {
    this.tickMovingPixelProgress();
    this.tickAttemptAiMove();
  }

  getYTranslate() {
    // Stand on ground when not moving
    if (this.movingPixelsRemaining === 0 || this.skin !== BODY_SKINS.NORMAL) {
      return 0;
    }

    //Elevate ramp up or down at beginning/end of movement
    // 在移動的一開始或快結束時，yTranslate 為 -1
    const PIXELS_FROM_END = 2;
    if (
      this.movingPixelsRemaining < PIXELS_FROM_END ||
      this.movingPixelsRemaining > 16 - PIXELS_FROM_END
    ) {
      return -1;
    }

    // Highest in the middle of the movement
    // 在移動的距離接近中間時，yTranslate 為 -2
    return -2;
  }

  tickMovingPixelProgress() {
    if (this.movingPixelsRemaining === 0) {
      return;
    }

    this.movingPixelsRemaining -= this.travelPixelsPerFrame;
    if (this.movingPixelsRemaining <= 0) {
      this.movingPixelsRemaining = 0;
      this.onDoneMoving();
    }
  }

  onDoneMoving() {
    // Update my x / y!
    const { x, y } = directionUpdateMap[this.movingPixelDirection];
    this.x += x;
    this.y += y;

    this.handleCollisions();
    this.onPostMove();
  }

  onPostMove() {
    // Randomly choose a new direction
    const directions = [
      DIRECTION_UP,
      DIRECTION_DOWN,
      DIRECTION_LEFT,
      DIRECTION_RIGHT,
    ].filter((direction) => {
      return !this.isSolidAtNextPosition(direction);
    });
    if (directions.length) {
      this.movingPixelDirection =
        directions[Math.floor(Math.random() * directions.length)];
    }
  }

  handleCollisions() {
    // handle collisions!
    const collision = new Collision(this, this.level);
    const collideThatAddsToInventory = collision.withPlacementAddsToInventory();
    this.skin = BODY_SKINS.NORMAL;
    const changesHeroSkin = collision.withChangesHeroSkin();
    if (changesHeroSkin) {
      this.skin = changesHeroSkin.changesHeroSkinOnCollide();
    }
    // 當角色遇到可拾取物件
    if (collideThatAddsToInventory) {
      // console.log("HANDLE COLLISION!", collideThatAddsToInventory);
      collideThatAddsToInventory.collect();
      // 撿到物品後的 bling bling特效
      this.level.addPlacement({
        type: PLACEMENT_TYPE_CELEBRATION,
        x: this.x,
        y: this.y,
      });
    }
    // 當角色碰到某些物體死亡
    const takesDamages = collision.withSelfGetsDamaged();
    if (takesDamages) {
      console.log("掛了，因為 ", takesDamages.type);
      this.level.setDeathOutcome(takesDamages.type);
    }

    // 當角色踩上傳送門，呼叫 level 的 completeLevel
    const completesLevel = collision.withCompletesLevel();

    if (completesLevel) {
      console.log("Hero is on the goal!");
      this.level.completeLevel();
    }
  }

  zIndex() {
    return this.y * Z_INDEX_LAYER_SIZE;
  }

  renderComponent() {
    const showShadow = this.skin !== BODY_SKINS.WATER;
    return (
      <Body
        frameCoord={this.getFrame()}
        yTranslate={this.getYTranslate()}
        showShadow={showShadow}
      />
    );
  }
}
