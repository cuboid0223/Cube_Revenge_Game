import { Placement } from "./Placement";
import { TILES } from "../helpers/tiles";
import Sprite from "../components/object-graphics/Sprite";
import {
  PLACEMENT_TYPE_FIRE_PICKUP,
  PLACEMENT_TYPE_HERO,
  BODY_SKINS,
  PLACEMENT_TYPE_CIABATTA,
} from "@/helpers/consts";
import { BodyPlacement } from "./BodyPlacement";
import { PlacementType } from "@/classes/PlacementFactory";

export class FirePlacement extends Placement {
  damagesBodyOnCollide(body: BodyPlacement): PlacementType | null {
    const { inventory } = this.level;
    if (
      body.type === PLACEMENT_TYPE_HERO &&
      !inventory.has(PLACEMENT_TYPE_FIRE_PICKUP)
    ) {
      return this.type;
    }
    //  CIABATTA 踩到火焰
    if (body.type === PLACEMENT_TYPE_CIABATTA) {
      return this.type;
    }
    return null;
  }

  changesHeroSkinOnCollide() {
    return BODY_SKINS.FIRE;
  }
  renderComponent() {
    const fireFrame = this.level.animatedFrames.fireFrame;
    return <Sprite frameCoord={fireFrame} />;
  }
}
