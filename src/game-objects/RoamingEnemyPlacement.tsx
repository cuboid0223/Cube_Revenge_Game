import { GroundEnemyPlacement } from "./GroundEnemyPlacement";
import Body from "../components/object-graphics/Body";
import { TILES } from "../helpers/tiles";
import {
  DIRECTION_RIGHT,
  DIRECTION_LEFT,
  DIRECTION_UP,
  DIRECTION_DOWN,
} from "../helpers/consts";

export class RoamingEnemyPlacement extends GroundEnemyPlacement {
  constructor(properties, level) {
    super(properties, level);
    this.tickBetweenMovesInterval = 48;
    this.ticksUntilNextMove = this.tickBetweenMovesInterval;
    this.turnsAroundAtWater = true;
  }

  renderComponent() {
    return <Body frameCoord={TILES.ENEMY_ROAMING} yTranslate={0} />;
  }
}