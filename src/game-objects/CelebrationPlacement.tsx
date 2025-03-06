import { Placement } from "./Placement";
import { Z_INDEX_LAYER_SIZE } from "../helpers/consts";
import Sprite from "../components/object-graphics/Sprite";
import { TILES } from "../helpers/tiles";
import { LevelState } from "@/classes/LevelState";

export class CelebrationPlacement extends Placement {
  private frame: number;
  constructor(properties:Placement, level: LevelState) {
    super(properties, level);
    this.frame = 1;
  }

  tick() {
    if (this.frame <= 8) {
      this.frame += 0.5;
      return;
    }
    this.level.deletePlacement(this);
  }

  zIndex() {
    return this.y * Z_INDEX_LAYER_SIZE + 2;
  }

  renderComponent() {
    const frameCoord = `PARTICLE_${Math.ceil(this.frame)}`;
    return <Sprite frameCoord={TILES[frameCoord as keyof typeof TILES]} />;
  }
}
