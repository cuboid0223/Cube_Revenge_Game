import {
  DIRECTION_LEFT,
  BODY_SKINS,
  HERO_RUN_1,
  HERO_RUN_2,
  Z_INDEX_LAYER_SIZE,
} from "../helpers/consts";
import { TILES } from "../helpers/tiles";
import { BodyPlacement } from "./BodyPlacement";
import Body from "../components/object-graphics/Body";

import { DeathCause, Direction } from "@/types/global";
import { LevelState } from "@/classes/LevelState";
import { LockPlacement } from "./LockPlacement";
import { tree } from "next/dist/build/templates/app-page";

const heroSkinMap = {
  [BODY_SKINS.NORMAL]: [TILES.HERO_EDITING_LEFT, TILES.HERO_EDITING_RIGHT],
  [BODY_SKINS.WATER]: [TILES.HERO_WATER_LEFT, TILES.HERO_WATER_RIGHT],
  [BODY_SKINS.SCARED]: [TILES.HERO_DEATH_LEFT, TILES.HERO_DEATH_RIGHT],
  [BODY_SKINS.ICE]: [TILES.HERO_ICE_LEFT, TILES.HERO_ICE_RIGHT],
  [BODY_SKINS.FIRE]: [TILES.HERO_FIRE_LEFT, TILES.HERO_FIRE_RIGHT],
  [BODY_SKINS.CONVEYOR]: [TILES.HERO_CONVEYOR_LEFT, TILES.HERO_CONVEYOR_RIGHT],
  [BODY_SKINS.TELEPORT]: [TILES.HERO_TELEPORT_LEFT, TILES.HERO_TELEPORT_RIGHT],
  [HERO_RUN_1]: [TILES.HERO_EDITING_LEFT, TILES.HERO_EDITING_RIGHT],
  [HERO_RUN_2]: [TILES.HERO_EDITING_LEFT, TILES.HERO_EDITING_RIGHT],
  [BODY_SKINS.DEATH]: [TILES.HERO_DEATH_LEFT, TILES.HERO_DEATH_RIGHT],
};

export class HeroEditingPlacement extends BodyPlacement {
  public canCollectItems: boolean;
  public canCompleteLevel: boolean;
  public interactsWithGround: boolean;

  constructor(properties: BodyPlacement, level: LevelState) {
    super(properties, level);
    this.canCollectItems = true;
    this.canCompleteLevel = false;
    this.interactsWithGround = true;
  }

  controllerMoveRequested(direction: Direction) {
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
      if (possibleLock instanceof LockPlacement) {
        possibleLock.unlock();
      }
      return;
    }

    //Make sure the next space is available
    if (this.isSolidAtNextPosition(direction)) {
      console.log("撞牆");
      return;
    }

    // Maybe hop out of non-normal skin
    if (this.skin === BODY_SKINS.WATER) {
      const collision = this.getCollisionAtNextPosition(direction);
      if (!collision.withChangesHeroSkin()) {
        this.skin = BODY_SKINS.NORMAL;
      }
    }

    //Start the move
    this.movingPixelsRemaining = 16;
    this.movingPixelDirection = direction;

    this.updateFacingDirection();
    this.updateWalkFrame();
  }
  // 處理 skin 渲染
  getFrame() {
    //Which frame to show? left or right?
    const index = this.spriteFacingDirection === DIRECTION_LEFT ? 0 : 1;

    // If dead, show the dead skin
    // if (this.level.deathOutcome) {
    //   return heroSkinMap[BODY_SKINS.DEATH][index];
    // }

    //If is moving, use correct walking frame per direction
    if (this.movingPixelsRemaining > 0) {
      const walkKey = this.spriteWalkFrame === 0 ? HERO_RUN_1 : HERO_RUN_2;
      return heroSkinMap[walkKey][index];
    }

    return heroSkinMap[this.skin][index];
  }

  // onAutoMovement(direction: Direction) {
  //   console.log("onAutoMovement : ", direction);
  //   this.controllerMoveRequested(direction);
  // }

  takesDamage(deathType: DeathCause) {
    this.level.setDeathOutcome(deathType);
  }

  zIndex() {
    return this.y * Z_INDEX_LAYER_SIZE + 1;
  }

  canBeDeleted() {
    return false;
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
