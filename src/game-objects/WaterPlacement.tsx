import { Placement } from "./Placement";
import Sprite from "../components/object-graphics/Sprite";
import { TILES } from "../helpers/tiles";
import {
  BODY_SKINS,
  PLACEMENT_TYPE_HERO,
  PLACEMENT_TYPE_WATER_PICKUP,
} from "../helpers/consts";
import { BodyPlacement } from "./BodyPlacement";
import { PlacementType } from "@/classes/PlacementFactory";

export class WaterPlacement extends Placement {
  changesHeroSkinOnCollide() {
    // 當碰到水變更為潛水 skin
    return BODY_SKINS.WATER;
  }

  isSolidForBody(body: BodyPlacement) {
    return body.turnsAroundAtWater ?? false;
  }

  // damagesBodyOnCollide(body) {
  //   const { inventory } = this.level;
  //   return (
  //     body.type === PLACEMENT_TYPE_HERO &&
  //     // 沒有潛水面具則死
  //     !inventory.has(PLACEMENT_TYPE_WATER_PICKUP)
  //   );
  // }

  damagesBodyOnCollide(body: BodyPlacement): PlacementType | null {
    const { inventory } = this.level;
    if (
      body.type === PLACEMENT_TYPE_HERO &&
      !inventory.has(PLACEMENT_TYPE_WATER_PICKUP)
    ) {
      return this.type;
    }
    return null;
  }

  renderComponent() {
    const waterFrame = this.level.animatedFrames.waterFrame;
    return <Sprite frameCoord={waterFrame} />;
  }
}
