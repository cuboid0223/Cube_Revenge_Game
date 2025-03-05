import Sprite from "./Sprite";
import styles from "./CiabattaBody.module.css";
import { FrameCoord } from "@/helpers/types";

type CiabattaBodyProps = {
  frameCoord: FrameCoord;
  yTranslate: number;
};

export default function CiabattaBody({ frameCoord, yTranslate }:CiabattaBodyProps) {
  return (
    <div className={styles.ciabatta}>
      <div
        className={styles.ciabattaBody}
        style={{
          transform: `translateY(${yTranslate}px)`,
        }}
      >
        <Sprite frameCoord={frameCoord} size={48} />
      </div>
    </div>
  );
}
