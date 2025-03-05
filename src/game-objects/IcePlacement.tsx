import { Placement } from "./Placement";
import Sprite from "../components/object-graphics/Sprite";
import { TILES } from "../helpers/tiles";
import {
  DIRECTION_UP,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_DOWN,
  BODY_SKINS,
  ICE_CORNERS,
  PLACEMENT_TYPE_HERO,
  PLACEMENT_TYPE_ICE_PICKUP,
} from "../helpers/consts";
import { Placement as PlacementType, Level } from "@/helpers/types";
import { Direction } from "@/types/global";

const iceTileCornerFramesMap = {
  [ICE_CORNERS.TOP_LEFT]: TILES.ICE_TOP_LEFT,
  [ICE_CORNERS.TOP_RIGHT]: TILES.ICE_TOP_RIGHT,
  [ICE_CORNERS.BOTTOM_LEFT]: TILES.ICE_BOTTOM_LEFT,
  [ICE_CORNERS.BOTTOM_RIGHT]: TILES.ICE_BOTTOM_RIGHT,
};

export const iceTileCornerRedirection = {
  TOP_LEFT: {
    [DIRECTION_UP]: DIRECTION_RIGHT,
    [DIRECTION_LEFT]: DIRECTION_DOWN,
  },
  TOP_RIGHT: {
    [DIRECTION_UP]: DIRECTION_LEFT,
    [DIRECTION_RIGHT]: DIRECTION_DOWN,
  },
  BOTTOM_LEFT: {
    [DIRECTION_LEFT]: DIRECTION_UP,
    [DIRECTION_DOWN]: DIRECTION_RIGHT,
  },
  BOTTOM_RIGHT: {
    [DIRECTION_RIGHT]: DIRECTION_UP,
    [DIRECTION_DOWN]: DIRECTION_LEFT,
  },
};
// 處理坐上雪橇遇到防護欄能穿越問題
// 針對不同的 corner 制定那些邊要關起來
export const iceTileCornerBlockedMoves = {
  TOP_LEFT: {
    [DIRECTION_UP]: true,
    [DIRECTION_LEFT]: true,
  },
  TOP_RIGHT: {
    [DIRECTION_UP]: true,
    [DIRECTION_RIGHT]: true,
  },
  BOTTOM_LEFT: {
    [DIRECTION_DOWN]: true,
    [DIRECTION_LEFT]: true,
  },
  BOTTOM_RIGHT: {
    [DIRECTION_DOWN]: true,
    [DIRECTION_RIGHT]: true,
  },
};

export class IcePlacement extends Placement {
  corner: string | null;
  
  constructor(properties: PlacementType, level: Level) {
    super(properties, level);
    this.corner = properties.corner ?? null;
  }

  blocksMovementDirection(direction: Direction): boolean {
    // 根據角色行進方向禁止對應的邊，並回傳 boolean
    if (this.corner) {
      return iceTileCornerBlockedMoves[this.corner][direction];
    }
    return false;
  }

  autoMovesBodyOnCollide(body) {
    // 角色得到 "防滑寶石"
    if (
      body.type === PLACEMENT_TYPE_HERO &&
      this.level.inventory.has(PLACEMENT_TYPE_ICE_PICKUP)
    ) {
      return null;
    }

    // ice placement with corner
    const possibleRedirects = iceTileCornerRedirection[this.corner];
    if (possibleRedirects) {
      return possibleRedirects[body.movingPixelDirection];
    }
    // normal ice placement
    return body.movingPixelDirection;
  }

  isSolidForBody(body) {
    const bodyIsBelow = this.y < body.y;
    if (bodyIsBelow && this.corner?.includes("BOTTOM")) {
      return true;
    }
    const bodyIsAbove = this.y > body.y;
    if (bodyIsAbove && this.corner?.includes("TOP")) {
      return true;
    }
    const bodyIsToLeft = this.x > body.x;
    if (bodyIsToLeft && this.corner?.includes("LEFT")) {
      return true;
    }
    const bodyIsToRight = this.x < body.x;
    if (bodyIsToRight && this.corner?.includes("RIGHT")) {
      return true;
    }

    return false
  }

  changesHeroSkinOnCollide() {
    if (this.level.inventory.has(PLACEMENT_TYPE_ICE_PICKUP)) {
      return BODY_SKINS.ICE;
    }
    return null
  }

  renderComponent() {
    const frameCoord = this.corner
      ? iceTileCornerFramesMap[this.corner]
      : TILES.ICE;
    return <Sprite frameCoord={frameCoord} />;
  }
}
