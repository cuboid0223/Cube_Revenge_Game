import styles from "./ClockCount.module.css";
import Sprite from "../object-graphics/Sprite";
import { TILES } from "../../helpers/tiles";
import PixelNumber from "../object-graphics/PixelNumber";
import { LevelStateSnapshot } from "@/types/global";

export default function ClockCount({ level }:{level: LevelStateSnapshot}) {
  return (
    <div className={styles.clockCount}>
      <Sprite frameCoord={TILES.CLOCK} />
      <PixelNumber number={level.secondsRemaining} />
    </div>
  );
}
