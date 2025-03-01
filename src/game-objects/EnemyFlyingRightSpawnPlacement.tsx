
import { Placement } from "./Placement";
import { TILES } from "../helpers/tiles";
import Sprite from "../components/object-graphics/Sprite";

export class EnemyFlyingRightSpawnPlacement extends Placement {


  renderComponent() {
    return <Sprite frameCoord={TILES.ENEMY_FLYING_RIGHT_SPAWN} />;
  }
}
