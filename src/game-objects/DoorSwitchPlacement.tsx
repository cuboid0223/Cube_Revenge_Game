import { Placement } from "./Placement";
import Sprite from "../components/object-graphics/Sprite";
import { TILES } from "../helpers/tiles";
import { BodyPlacement } from "./BodyPlacement";
import { InteractsWithGround } from "@/classes/Collision";



export class DoorSwitchPlacement extends Placement {
  switchesDoorsOnCollide(body: BodyPlacement) {
    if ('interactsWithGround' in body) {
      return (body as InteractsWithGround).interactsWithGround;
    }
    return false;
  }
  renderComponent() {
    return <Sprite frameCoord={TILES.SWITCH} />;
  }
}
