import { PLACEMENT_TYPE_ICE } from "@/helpers/consts";
import { LevelSchema, PlacementSchema } from "@/helpers/types";
import { Direction } from "@/types/global";

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
    // 尋找 傳送門 placement 並呼叫 completesLevelOnCollide
    if (this.forBody.canCompleteLevel) {
      return this.placementsAtPosition.find((p) => {
        return p.completesLevelOnCollide();
      });
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
    if (this.forBody.canCollectItems) {
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
    if (this.forBody.interactsWithGround) {
      return this.placementsAtPosition.find((p) => {
        return p.autoMovesBodyOnCollide(this.forBody);
      });
    }
    return null;
  }

  withIceCorner() {
    // 檢查角色是否在有 corner 的冰上，並回傳該 ice corner tile
    return this.placementsAtPosition.find((p) => {
      return p.type === PLACEMENT_TYPE_ICE && p.corner;
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
