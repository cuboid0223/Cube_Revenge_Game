import { Placement } from "./Placement";
import { LOCK_KEY_COLORS } from "../helpers/consts";
import { TILES } from "../helpers/tiles";
import Sprite from "../components/object-graphics/Sprite";

export class LockPlacement extends Placement {
  constructor(properties, level) {
    super(properties, level);
    this.color = properties.color ?? LOCK_KEY_COLORS.BLUE;
    this.collectInFrames = 0;
  }

  isSolidForBody(_body) {
    // 是否是實體無法讓角色穿過?
    return true;
  }

  tick() {
    // collectInFrames 會遞減 直到為 0 才刪除 lock placement
    // 在遞減期間會有刪除動畫(閃白屏)
    if (this.collectInFrames > 0) {
      this.collectInFrames -= 1;
      if (this.collectInFrames === 0) {
        console.log("移除鎖", this);
        this.level.deletePlacement(this);
      }
    }
  }

  canBeUnlocked() {
    // canBeUnlocked -> 字面意思就是能否被解開?

    // if you have right color key
    const requiredKey = `KEY_${this.color}`;
    return this.level.inventory.has(requiredKey);
  }

  unlock() {
    // 呼叫 unlock 時，設置 collectInFrames 為 11
    if (this.collectInFrames > 0) {
      return;
    }
    this.collectInFrames = 11;
  }

  renderComponent() {
    let frameCoord =
      this.color === LOCK_KEY_COLORS.BLUE ? TILES.BLUE_LOCK : TILES.GREEN_LOCK;
    if (this.collectInFrames > 0) {
      frameCoord = TILES.UNLOCKED_LOCK;
    }
    return <Sprite frameCoord={frameCoord} />;
  }
}
