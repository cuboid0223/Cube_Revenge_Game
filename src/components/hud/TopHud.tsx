import styles from "./TopHud.module.css";
import FlourCount from "./FlourCount";
import ClockCount from "./ClockCount";
import InventoryList from "./InventoryList";
import EditorDropdown from "./EditorDropdown";
import { usePathname } from "next/navigation";
import { LevelSchema } from "@/helpers/types";


type TopHudProps  = {
  level: LevelSchema
}

export default function TopHud({ level }:TopHudProps ) {
  const pathname = usePathname();
  const showEditorDropdown = pathname === "/edit";
  return (
    <div className={styles.topHud}>
      <div className={styles.topHudLeft}>
        <FlourCount level={level} />
        <ClockCount level={level} />
        <InventoryList level={level} />
      </div>
      <div className={styles.topHudRight}>
        {/*<span>Come back to me</span>*/}
        {showEditorDropdown &&  <EditorDropdown level={level} />}
       
      </div>
    </div>
  );
}
