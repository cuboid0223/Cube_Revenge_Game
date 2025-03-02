import styles from "./TopHud.module.css";
import FlourCount from "./FlourCount";
import ClockCount from "./ClockCount";
import InventoryList from "./InventoryList";
import EditorDropdown from "./EditorDropdown";
import { usePathname } from "next/navigation";
import { Level } from "@/helpers/types";

type TopHudProps = {
  level: Level;
};

export default function TopHud({ level }: TopHudProps) {
  const pathname = usePathname();
  const showEditorPanel = pathname === "/edit";

  return (
    <div className={styles.topHud}>
      <div
        className={styles.topHudLeft}

      >
        <FlourCount level={level} />
        <ClockCount level={level} />
        <InventoryList level={level} />
      </div>
      <div className={styles.topHudRight}>
        {showEditorPanel && <EditorDropdown level={level} />}
      </div>
    </div>
  );
}
