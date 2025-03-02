import { Placement } from "./Placement";
import { TILES } from "../helpers/tiles";
import Sprite from "../components/object-graphics/Sprite";

export class GoalEnabledPlacement extends Placement {
  canBeDeleted() {
    return false;
  }

  renderComponent() {
    return <Sprite frameCoord={TILES.GOAL_ENABLED} />;
  }
}
