import { Placement } from "./Placement";
import Sprite from "../components/object-graphics/Sprite";
import { THEME_TILES_MAP } from "../helpers/consts";
import { BodyPlacement } from "./BodyPlacement";

export class WallPlacement extends Placement {
  isSolidForBody(_body: BodyPlacement) {
    // _body 下底線的意思表示這個參數不會被用到
    return true;
  }

  renderComponent() {
    const wallTileCoord = THEME_TILES_MAP[this.level.theme].WALL;
    return <Sprite frameCoord={wallTileCoord} />;
  }
}
