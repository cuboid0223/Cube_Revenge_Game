

import { Placement } from "./Placement";
import { TILES } from "../helpers/tiles";
import Sprite from "../components/object-graphics/Sprite";

export class EnemyUpSpawnPlacement extends Placement {


  renderComponent() {
    return <Sprite frameCoord={TILES.ENEMY_UP_SPAWN} />;
  }
}
