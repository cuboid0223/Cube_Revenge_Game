import { Placement } from "@/game-objects/Placement";
import {
  LEVEL_THEMES,
  PLACEMENT_TYPE_FLOUR,
  PLACEMENT_TYPE_GOAL,
  PLACEMENT_TYPE_HERO,
  PLACEMENT_TYPE_WALL,
  PLACEMENT_TYPE_LOCK,
  PLACEMENT_TYPE_KEY,
  PLACEMENT_TYPE_WATER,
  PLACEMENT_TYPE_WATER_PICKUP,
  PLACEMENT_TYPE_GROUND_ENEMY,
  PLACEMENT_TYPE_FLYING_ENEMY,
  PLACEMENT_TYPE_ROAMING_ENEMY,
  PLACEMENT_TYPE_CONVEYOR,
  PLACEMENT_TYPE_ICE,
  PLACEMENT_TYPE_ICE_PICKUP,
  PLACEMENT_TYPE_FIRE,
  PLACEMENT_TYPE_FIRE_PICKUP,
  PLACEMENT_TYPE_SWITCH_DOOR,
  PLACEMENT_TYPE_SWITCH,
  PLACEMENT_TYPE_TELEPORT,
  PLACEMENT_TYPE_THIEF,
  PLACEMENT_TYPE_CIABATTA,
  DIRECTION_RIGHT,
  DIRECTION_LEFT,
  DIRECTION_UP,
  DIRECTION_DOWN,
  PLACEMENT_TYPE_HERO_EDITING,
  PLACEMENT_TYPE_HERO_SPAWN,
  PLACEMENT_TYPE_GOAL_ENABLED,
} from "../helpers/consts";

const DefaultLevel = {

  theme: LEVEL_THEMES.YELLOW,
  tilesWidth: 10,
  tilesHeight: 10,
  placements: [
    {
      type: PLACEMENT_TYPE_HERO_SPAWN,
      x: 1,
      y: 1,
    },
    {
      type: PLACEMENT_TYPE_HERO_EDITING,
      x: 5,
      y: 5,
    },

    {
      type: PLACEMENT_TYPE_GOAL_ENABLED,
      x: 10,
      y: 10,
    },
  ],
  // --------TypeScript 真的很嚴格-------------
  solutionPath: null,
  deathOutcome: null,
  isCompleted: false,
  cameraTransformX: 0,
  cameraTransformY: 0,
  zoom: 1,
  secondsRemaining: 60,
  inventory: {},
  restart: () => {
    // 實作 restart 邏輯
  },
  enableEditing: true,
  editModePlacement: { type: "WALL" },
  setZoom: (n: number) => n,
  setEditingMode: (enableEdit: boolean) => {},
  changeTheme: () => {},
  addPlacement: (config: Placement) => {},
  deletePlacement: (placement:Placement) => {},
  clearPlacements: () => {},
  updateTilesWidth: (diff: number) => 10 + diff,
  updateTilesHeight: (diff: number) => 10 + diff,
  setEditModePlacement: (newPlacement:Placement) => {},
  copyPlacementsToClipboard: () => {},
  updateSolutionPath: () => {},
  
};

export default DefaultLevel;
