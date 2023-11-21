import { Placement } from "./Placement";
import Hero from "../components/object-graphics/Hero";
import { LevelSchema } from "@/helpers/types";
import { Collision } from "../classes/Collision";
import {
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  directionUpdateMap,
  BODY_SKINS,
  HERO_RUN_1,
  HERO_RUN_2,
  Z_INDEX_LAYER_SIZE,
  PLACEMENT_TYPE_CELEBRATION,
} from "../helpers/consts";
import { TILES } from "../helpers/tiles";

const heroSkinMap = {
  [BODY_SKINS.NORMAL]: [TILES.HERO_LEFT, TILES.HERO_RIGHT],
  [HERO_RUN_1]: [TILES.HERO_RUN_1_LEFT, TILES.HERO_RUN_1_RIGHT],
  [HERO_RUN_2]: [TILES.HERO_RUN_2_LEFT, TILES.HERO_RUN_2_RIGHT],
  [BODY_SKINS.DEATH]: [TILES.HERO_DEATH_LEFT, TILES.HERO_DEATH_RIGHT],
};

export class HeroPlacement extends Placement {
  controllerMoveRequested(direction) {
    // Attempt to start moving
    // 因為 controllerMoveRequested 是在每一 frame 呼叫的，所以避免重複呼叫需要下面的 return，
    // return; 的意思是指 不讓角色移動
    if (this.movingPixelsRemaining > 0) {
      return;
    }

    // check for lock at next position
    const possibleLock = this.getLockAtNextPosition(direction);
    if (possibleLock) {
      console.log("解鎖 : ", possibleLock);
      possibleLock.unlock();
      return;
    }

    //Make sure the next space is available
    if (this.isSolidAtNextPosition(direction)) {
      return;
    }

    //Start the move
    this.movingPixelsRemaining = 16;
    this.movingPixelDirection = direction;

    this.updateFacingDirection();
    this.updateWalkFrame();
  }

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
  }

  // 處理 skin 渲染
  getFrame() {
    //Which frame to show? left or right?
    const index = this.spriteFacingDirection === DIRECTION_LEFT ? 0 : 1;

    // If dead, show the dead skin
    if (this.level.deathOutcome) {
      return heroSkinMap[BODY_SKINS.DEATH][index];
    }

    //If is moving, use correct walking frame per direction
    if (this.movingPixelsRemaining > 0) {
      const walkKey = this.spriteWalkFrame === 0 ? HERO_RUN_1 : HERO_RUN_2;
      return heroSkinMap[walkKey][index];
    }

    return heroSkinMap[BODY_SKINS.NORMAL][index];
  }

  getYTranslate() {
    // Stand on ground when not moving
    if (this.movingPixelsRemaining === 0) {
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
  }

  handleCollisions() {
    // handle collisions!
    const collision = new Collision(this, this.level);
    const collideThatAddsToInventory = collision.withPlacementAddsToInventory();

    // 當角色遇到可拾取物件
    if (collideThatAddsToInventory) {
      // console.log("HANDLE COLLISION!", collideThatAddsToInventory);
      collideThatAddsToInventory.collect();
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
    return this.y * Z_INDEX_LAYER_SIZE + 1;
  }

  renderComponent() {
    return (
      <Hero frameCoord={this.getFrame()} yTranslate={this.getYTranslate()} />
    );
  }
}
