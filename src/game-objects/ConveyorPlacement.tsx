import { Placement } from "./Placement";
import Sprite from "../components/object-graphics/Sprite";
import { TILES } from "../helpers/tiles";
import {
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  DIRECTION_DOWN,
  BODY_SKINS,
} from "../helpers/consts";
import { Direction, FrameCoord } from "@/types/global";
import { LevelState } from "@/classes/LevelState";

const directionFrameMap: Record<string, FrameCoord> = {
  [DIRECTION_LEFT]: TILES.CONVEYOR_LEFT,
  [DIRECTION_RIGHT]: TILES.CONVEYOR_RIGHT,
  [DIRECTION_UP]: TILES.CONVEYOR_UP,
  [DIRECTION_DOWN]: TILES.CONVEYOR_DOWN,
};

export interface ConveyorPlacementConfig extends Placement {
  direction: Direction;
}

export class ConveyorPlacement extends Placement {
  public direction: Direction;
  constructor(properties: ConveyorPlacementConfig, level: LevelState) {
    super(properties, level);
    this.direction = properties.direction;
  }

  changesHeroSkinOnCollide() {
    return BODY_SKINS.CONVEYOR;
  }

  autoMovesBodyOnCollide(): Direction {
    return this.direction;
  }

  renderComponent() {
    return <Sprite frameCoord={directionFrameMap[this.direction]} />;
  }
}
