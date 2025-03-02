import { Placement } from "./Placement";
import { TILES } from "../helpers/tiles";
import Sprite from "../components/object-graphics/Sprite";

export class HeroSpawnPlacement extends Placement {

  canBeDeleted() {
    return false;
  }
  renderComponent() {
    return <Sprite frameCoord={TILES.HERO_SPAWN} />;
  }
}
