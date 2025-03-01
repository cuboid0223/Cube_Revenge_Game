import { Placement } from "./Placement";
import Sprite from "../components/object-graphics/Sprite";
import { TILES } from "../helpers/tiles";

export class SwitchableDoorPlacement extends Placement {
  constructor(properties, level) {
    super(properties, level);
    this.isRaised = properties.isRaised ?? false;
  }
  toggleIsRaised() {
    this.isRaised = !this.isRaised;
  }

  isSolidForBody() {
    return this.isRaised;
  }

  renderComponent() {
    const frameCoord = this.isRaised
      ? TILES.SWITCH_DOOR_SOLID
      : TILES.SWITCH_DOOR_OUTLINE;
    return <Sprite frameCoord={frameCoord} />;
  }
}
