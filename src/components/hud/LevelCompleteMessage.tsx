import { useRecoilState } from "recoil";
import { currentLevelIdAtom } from "../../atoms/currentLevelIdAtom";

import styles from "./PopupMessage.module.css";
import LevelCompletedSvg from "../object-graphics/LevelCompletedSvg";
import { useKeyPress } from "@/hooks/useKeyPress";
import levels from "@/levels/levelsMap";

export default function LevelCompleteMessage() {
  const [currentId, setCurrentId] = useRecoilState(currentLevelIdAtom);

  const handleGoToNextLevel = () => {
    const levelsArray = Object.keys(levels);
    const currentIndex = levelsArray.findIndex((id) => {
      return id === currentId;
    });
    const nextLevelId = levelsArray[currentIndex + 1] ?? levelsArray[0];
    setCurrentId(nextLevelId);
  };

  useKeyPress("Enter", () => {
    handleGoToNextLevel();
  });

  return (
    <div className={styles.outerContainer}>
      <div className={styles.popupContainer}>
        <button className={styles.quietButton} onClick={handleGoToNextLevel}>
          <LevelCompletedSvg />
        </button>
      </div>
    </div>
  );
}
