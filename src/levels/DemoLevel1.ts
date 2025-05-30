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
} from "../helpers/consts";

const DemoLevel1 = {
  theme: "YELLOW",
  tilesWidth: 10,
  tilesHeight: 10,
  placements: [
    { x: 1, y: 1, type: "HERO" },
    { x: 10, y: 10, type: "GOAL" },
    { type: "WALL", x: 1, y: 7 },
    { type: "WALL", x: 2, y: 7 },
    { type: "WALL", x: 3, y: 7 },
    { type: "WALL", x: 4, y: 7 },
    { type: "WALL", x: 5, y: 7 },
    { type: "CONVEYOR", x: 1, y: 5, direction: "DOWN" },
    { type: "SWITCH_DOOR", x: 5, y: 1, isRaised: false },
    { x: 4, y: 8, type: "FLYING_ENEMY", initialDirection: "LEFT" },
    { x: 4, y: 9, type: "GROUND_ENEMY", initialDirection: "LEFT" },
    { x: 4, y: 10, type: "ROAMING_ENEMY" },
    { type: "WALL", x: 5, y: 8 },
    { type: "WALL", x: 5, y: 9 },
    { type: "WALL", x: 5, y: 10 },
    { type: "WALL", x: 3, y: 1 },
    { type: "WALL", x: 3, y: 2 },
    { type: "WALL", x: 1, y: 4 },
    { type: "LOCK", x: 10, y: 8, color: "BLUE" },
    { type: "WALL", x: 9, y: 7 },
    { type: "WALL", x: 9, y: 6 },
    { type: "WALL", x: 9, y: 8 },
    { type: "WALL", x: 10, y: 6 },
    { type: "FLOUR", x: 10, y: 7 },
    { type: "KEY", x: 10, y: 1, color: "BLUE" },
    { type: "THIEF", x: 10, y: 2 },
    { type: "FIRE", x: 9, y: 9 },
    { type: "FIRE", x: 9, y: 10 },
    { type: "FIRE_PICKUP", x: 6, y: 10 },
    { type: "CONVEYOR", x: 2, y: 5, direction: "LEFT" },
    { type: "CONVEYOR", x: 1, y: 6, direction: "RIGHT" },
    { type: "CONVEYOR", x: 2, y: 6, direction: "RIGHT" },
    { type: "ICE", x: 3, y: 4 },
    { type: "KEY", x: 3, y: 4, color: "BLUE" },
    { type: "WATER", x: 4, y: 5 },
    { type: "FIRE", x: 4, y: 4 },
    { type: "THIEF", x: 3, y: 5 },
    { x: 4, y: 4, type: "FLYING_ENEMY", initialDirection: "LEFT" },

    { type: "FLOUR", x: 4, y: 5 },
    { type: "WATER_PICKUP", x: 4, y: 2 },
  ],
  // ---------TypeScript 真的很嚴格------------
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
  setEditingMode: (enableEdit: boolean) => {},
  setZoom: (n: number) => n,
  changeTheme: () => {},
  addPlacement: (config: Placement) => {},
  deletePlacement: (placement: Placement) => {},
  clearPlacements: () => {},
  updateTilesWidth: (diff: number) => 10 + diff,
  updateTilesHeight: (diff: number) => 10 + diff,
  setEditModePlacement: (newPlacement: Placement) => {},
  copyPlacementsToClipboard: () => {},
  updateSolutionPath: () => {},
};
export default DemoLevel1;
