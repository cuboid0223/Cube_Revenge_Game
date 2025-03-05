import { Placement } from "./Placement";
import Sprite from "../components/object-graphics/Sprite";
import { TILES } from "../helpers/tiles";
import { BodyPlacement } from "./BodyPlacement";

export class DoorSwitchPlacement extends Placement {
  switchesDoorsOnCollide(body: BodyPlacement) {
    return body.interactsWithGround;
  }
  renderComponent() {
    return <Sprite frameCoord={TILES.SWITCH} />;
  }
}
