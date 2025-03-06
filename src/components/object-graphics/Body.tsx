import Sprite from "./Sprite";
import { TILES } from "../../helpers/tiles";
import styles from "./Hero.module.css";
import { FrameCoord } from "@/types/global";

type BodyProps = {
  frameCoord: FrameCoord;
  yTranslate: number;
  showShadow?: boolean
};


export default function Body({ frameCoord, yTranslate, showShadow }: BodyProps) {
  // 設置 yTranslate 讓角色在移動時有跳動的感覺
  return (
    <div className={styles.hero}>
      <div>{showShadow && <Sprite frameCoord={TILES.SHADOW} />}</div>
      <div
        className={styles.heroBody}
        style={{
          transform: `translateY(${yTranslate}px)`,
        }}
      >
        <Sprite frameCoord={frameCoord} size={32} />
      </div>
    </div>
  );
}
