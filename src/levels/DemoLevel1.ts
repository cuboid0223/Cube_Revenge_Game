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
} from "../helpers/consts";

const DemoLevel1 = {
  theme: LEVEL_THEMES.YELLOW,
  tilesWidth: 8,
  tilesHeight: 8,
  placements: [
    { x: 3, y: 2, type: PLACEMENT_TYPE_HERO },
    { x: 6, y: 4, type: PLACEMENT_TYPE_GOAL },

    { x: 3, y: 4, type: PLACEMENT_TYPE_CONVEYOR, direction: "DOWN" },
    { x: 3, y: 5, type: PLACEMENT_TYPE_CONVEYOR, direction: "DOWN" },
    { x: 3, y: 6, type: PLACEMENT_TYPE_CONVEYOR, direction: "DOWN" },
    { x: 3, y: 7, type: PLACEMENT_TYPE_CONVEYOR, direction: "RIGHT" },

    { x: 6, y: 6, type: PLACEMENT_TYPE_WALL },
    { x: 8, y: 2, type: PLACEMENT_TYPE_FLOUR },
    { x: 6, y: 2, type: PLACEMENT_TYPE_WATER_PICKUP },
    { x: 7, y: 2, type: PLACEMENT_TYPE_WATER },
    // { x: 6, y: 7, type: PLACEMENT_TYPE_FLYING_ENEMY },
    // { x: 8, y: 7, type: PLACEMENT_TYPE_FLYING_ENEMY, initialDirection: "UP" },
  ],
};

export default DemoLevel1;
