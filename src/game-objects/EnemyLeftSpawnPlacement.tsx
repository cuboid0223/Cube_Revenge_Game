import { Placement } from "./Placement";
import { TILES } from "../helpers/tiles";
import Sprite from "../components/object-graphics/Sprite";

export class EnemyLeftSpawnPlacement extends Placement {


  renderComponent() {
    return <Sprite frameCoord={TILES.ENEMY_LEFT_SPAWN} />;
  }
}
