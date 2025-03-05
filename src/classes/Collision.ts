import { PLACEMENT_TYPE_ICE } from "@/helpers/consts";
import { Direction } from "@/types/global";
import { LevelState } from "./LevelState";
import { Placement } from "@/game-objects/Placement";
import { BodyPlacement } from "@/game-objects/BodyPlacement";
import { IcePlacement } from "@/game-objects/IcePlacement";
import { boolean } from "zod";

interface LevelCompletable {
  canCompleteLevel: boolean;
}

interface CollectItems{
  canCollectItems: boolean
}
interface InteractsWithGround{
  interactsWithGround: boolean
}

type PositionType = {
  x: number;
  y: number;
} | null;

export class Collision {
  forBody: BodyPlacement;
  level: LevelState;
  placementsAtPosition: Placement[];
  x: number;
  y: number;
  

  constructor(
    forBody: BodyPlacement,
    level: LevelState,
    position?: PositionType
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

    // if (this.placementsAtPosition.length != 0) {
    //   console.log(
    //     this.forBody.type,
    //     "下一步會遇到了 -> ",
    //     this.placementsAtPosition
    //   );
    // }
  }

  withSolidPlacement() {
    return this.placementsAtPosition.find((p) =>
      p.isSolidForBody(this.forBody)
    );
  }

  withCompletesLevel() {
    // 先確認 forBody 是英雄類型，因為只有這兩種才具有 canCompleteLevel 屬性
    // 直接導入 HeroPlacement 和 HeroEditingPlacement 會造成 BodyPlacement 循環依賴
    if (this.forBody && 'canCompleteLevel' in this.forBody && (this.forBody as LevelCompletable).canCompleteLevel) {
      return this.placementsAtPosition.find((p) => p.completesLevelOnCollide());
    }
    return null;
  }

  withLock() {
    // 當遇到是 lock placement 且有正確的 key，回傳 true
    return this.placementsAtPosition.find((p) => {
      return p.canBeUnlocked();
    });
  }

  withSelfGetsDamaged() {
    return this.placementsAtPosition.find((p) => {
      return p.damagesBodyOnCollide(this.forBody);
    });
  }

  withPlacementAddsToInventory() {
    // 撿到 placements 加入到 inventory
    if (this.forBody && 'canCollectItems' in this.forBody && (this.forBody as CollectItems).canCollectItems) {
      return this.placementsAtPosition.find((p) => {
        return (
          !p.hasBeenCollected && p.addsItemToInventoryOnCollide(this.forBody)
        );
      });
    }
 
    return null;
  }

  withChangesHeroSkin() {
    // 遇到水變更 skin
    return this.placementsAtPosition.find((p) => {
      return p.changesHeroSkinOnCollide();
    });
  }

  withPlacementMovesBody() {
    if (this.forBody && 'interactsWithGround' in this.forBody && (this.forBody as InteractsWithGround).interactsWithGround) {
      return this.placementsAtPosition.find((p) => {
        return p.autoMovesBodyOnCollide(this.forBody);
      });
    }
    return null;
  }

  withIceCorner() {
    return this.placementsAtPosition.find((p) => {
      if (p.type === PLACEMENT_TYPE_ICE && p instanceof IcePlacement) {
        return p.corner;
      }
      return false;
    });
  }

  withDoorSwitch() {
    // 紫色變換門
    return this.placementsAtPosition.find((p) => {
      return p.switchesDoorsOnCollide(this.forBody);
    });
  }

  withTeleport() {
    // 傳送門
    return this.placementsAtPosition.find((p) => {
      const teleportPos = p.teleportsToPositionOnCollide(this.forBody);
      return Boolean(teleportPos);
    });
  }

  withStealsInventory() {
    // Thief placement 重製 inventory
    return this.placementsAtPosition.find((p) => {
      return p.stealsInventoryOnCollide(this.forBody);
    });
  }
}
