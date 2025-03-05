import {
  DIRECTION_UP,
  DIRECTION_DOWN,
  DIRECTION_RIGHT,
  DIRECTION_LEFT,
} from "../helpers/consts";

export class DirectionControls {
  public directionKeys: Record<string, string>;
  public heldDirections: string[];
  public directionKeyDownHandler: (e: KeyboardEvent) => void;
  public directionKeyUpHandler: (e: KeyboardEvent) => void;

  constructor() {
    this.directionKeys = {
      ArrowDown: DIRECTION_DOWN,
      ArrowUp: DIRECTION_UP,
      ArrowLeft: DIRECTION_LEFT,
      ArrowRight: DIRECTION_RIGHT,
      s: DIRECTION_DOWN,
      w: DIRECTION_UP,
      a: DIRECTION_LEFT,
      d: DIRECTION_RIGHT,
    };
    // 按住的方向鍵會在該陣列裡面
    this.heldDirections = [];

    this.directionKeyDownHandler = (e) => {
      const dir = this.directionKeys[e.key];
      // if 按下按鈕且陣列中沒有按下的鍵
      if (dir && this.heldDirections.indexOf(dir) === -1) {
        // 將該鍵從加入到陣列最前面
        this.heldDirections.unshift(dir);
        // console.log(this.heldDirections);
      }
    };

    this.directionKeyUpHandler = (e) => {
      const dir = this.directionKeys[e.key];
      const index = this.heldDirections.indexOf(dir);
      if (index > -1) {
        // 將該鍵從陣列移除
        this.heldDirections.splice(index, 1);
        // console.log(this.heldDirections);
      }
    };

    // bind function to listener
    document.addEventListener("keydown", this.directionKeyDownHandler);
    document.addEventListener("keyup", this.directionKeyUpHandler);
  }

  get direction() {
    return this.heldDirections[0];
  }

  unbind() {
    document.removeEventListener("keydown", this.directionKeyDownHandler);
    document.removeEventListener("keyup", this.directionKeyUpHandler);
  }
}
