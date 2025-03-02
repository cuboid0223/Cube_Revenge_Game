import { Level } from "@/helpers/types";
import {
  PLACEMENT_TYPE_WALL,
  PLACEMENT_TYPE_FIRE,
  PLACEMENT_TYPE_WATER,
  PLACEMENT_TYPE_SWITCH,
  PLACEMENT_TYPE_SWITCH_DOOR,
} from "../../helpers/consts";
import styles from "./EditorDropdown.module.css";

type PlacementType = "WALL" | "FIRE" | "WATER" | "SWITCH" | "SWITCH_DOOR";

const placements: Record<PlacementType, string> = {
  [PLACEMENT_TYPE_WALL]: "牆壁",
  [PLACEMENT_TYPE_FIRE]: "火焰",
  [PLACEMENT_TYPE_WATER]: "水",
  [PLACEMENT_TYPE_SWITCH]: "按鈕(升降門)",
  [PLACEMENT_TYPE_SWITCH_DOOR]: "升降門",
};

type PropType = {
  level: Level;
};

export default function EditorDropdown({ level }: PropType) {
  if (!level.enableEditing) {
    return null;
  }

  return (
    <div className={styles.dropdownContainer}>
      {/* <select
        value={level.editModePlacement}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          level.setEditModePlacement(event.target.value);
        }}
      >
        {Object.entries(placements).map(([placementType, label]) => (
          <option key={placementType} value={placementType}>
            {label}
          </option>
        ))}
      </select> */}
      <button
        onClick={() => {
          level.copyPlacementsToClipboard();
        }}
      >
        Export
      </button>
    </div>
  );
}
