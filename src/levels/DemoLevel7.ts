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
  PLACEMENT_TYPE_HERO_EDITING,
  PLACEMENT_TYPE_HERO_SPAWN,
  PLACEMENT_TYPE_GOAL_ENABLED,
} from "../helpers/consts";
const DemoLevel7 = {
  theme: LEVEL_THEMES.GRAY,
  tilesWidth: 13,
  tilesHeight: 13,
  placements: [
    // { x: 7, y: 4, type: PLACEMENT_TYPE_HERO },
    { x: 7, y: 4, type: PLACEMENT_TYPE_HERO_EDITING },
    { x: 7, y: 4, type: PLACEMENT_TYPE_HERO_SPAWN },
    { x: 7, y: 10, type: PLACEMENT_TYPE_GOAL_ENABLED },

    // { x: 7, y: 1, type: PLACEMENT_TYPE_CIABATTA },

    { x: 5, y: 6, type: PLACEMENT_TYPE_SWITCH_DOOR, isRaised: false },
    { x: 6, y: 6, type: PLACEMENT_TYPE_SWITCH_DOOR, isRaised: false },
    { x: 7, y: 6, type: PLACEMENT_TYPE_SWITCH_DOOR, isRaised: false },
    { x: 7, y: 13, type: PLACEMENT_TYPE_SWITCH_DOOR, isRaised: false },
    { x: 8, y: 6, type: PLACEMENT_TYPE_SWITCH_DOOR, isRaised: false },
    { x: 9, y: 6, type: PLACEMENT_TYPE_SWITCH_DOOR, isRaised: false },
    { x: 4, y: 1, type: PLACEMENT_TYPE_SWITCH },
    { x: 10, y: 1, type: PLACEMENT_TYPE_SWITCH },

    { x: 1, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 1, y: 6, type: PLACEMENT_TYPE_WALL },
    { x: 2, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 2, y: 6, type: PLACEMENT_TYPE_WALL },
    { x: 3, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 3, y: 6, type: PLACEMENT_TYPE_WALL },
    { x: 4, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 4, y: 6, type: PLACEMENT_TYPE_WALL },
    { x: 5, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 6, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 7, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 8, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 9, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 10, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 10, y: 6, type: PLACEMENT_TYPE_WALL },
    { x: 11, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 11, y: 6, type: PLACEMENT_TYPE_WALL },
    { x: 12, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 12, y: 6, type: PLACEMENT_TYPE_WALL },
    { x: 13, y: 2, type: PLACEMENT_TYPE_WALL },
    { x: 13, y: 6, type: PLACEMENT_TYPE_WALL },

    { x: 1, y: 3, type: PLACEMENT_TYPE_ICE, corner: "TOP_LEFT" },
    { x: 1, y: 4, type: PLACEMENT_TYPE_ICE },
    { x: 1, y: 5, type: PLACEMENT_TYPE_ICE, corner: "BOTTOM_LEFT" },
    { x: 1, y: 11, type: PLACEMENT_TYPE_ICE },
    { x: 1, y: 12, type: PLACEMENT_TYPE_ICE },
    { x: 1, y: 13, type: PLACEMENT_TYPE_ICE, corner: "BOTTOM_LEFT" },
    { x: 2, y: 3, type: PLACEMENT_TYPE_ICE },
    { x: 2, y: 4, type: PLACEMENT_TYPE_ICE },
    { x: 2, y: 5, type: PLACEMENT_TYPE_ICE },
    { x: 2, y: 11, type: PLACEMENT_TYPE_ICE },
    { x: 2, y: 12, type: PLACEMENT_TYPE_ICE },
    { x: 2, y: 13, type: PLACEMENT_TYPE_ICE },
    { x: 3, y: 3, type: PLACEMENT_TYPE_ICE },
    { x: 3, y: 4, type: PLACEMENT_TYPE_ICE },
    { x: 3, y: 11, type: PLACEMENT_TYPE_ICE },
    { x: 3, y: 12, type: PLACEMENT_TYPE_ICE },
    { x: 3, y: 13, type: PLACEMENT_TYPE_ICE },
    { x: 4, y: 3, type: PLACEMENT_TYPE_ICE },
    { x: 4, y: 5, type: PLACEMENT_TYPE_ICE },
    { x: 4, y: 7, type: PLACEMENT_TYPE_ICE },
    { x: 4, y: 8, type: PLACEMENT_TYPE_ICE },
    { x: 4, y: 9, type: PLACEMENT_TYPE_ICE, corner: "BOTTOM_LEFT" },

    { x: 5, y: 7, type: PLACEMENT_TYPE_ICE },
    { x: 5, y: 8, type: PLACEMENT_TYPE_ICE },
    { x: 5, y: 9, type: PLACEMENT_TYPE_ICE },
    { x: 5, y: 10, type: PLACEMENT_TYPE_ICE },
    { x: 5, y: 11, type: PLACEMENT_TYPE_ICE },
    { x: 5, y: 12, type: PLACEMENT_TYPE_ICE, corner: "BOTTOM_LEFT" },
    { x: 6, y: 7, type: PLACEMENT_TYPE_ICE },
    { x: 6, y: 8, type: PLACEMENT_TYPE_ICE },
    { x: 6, y: 9, type: PLACEMENT_TYPE_ICE },
    { x: 6, y: 10, type: PLACEMENT_TYPE_ICE },
    { x: 6, y: 11, type: PLACEMENT_TYPE_ICE },
    { x: 6, y: 12, type: PLACEMENT_TYPE_ICE },
    { x: 7, y: 7, type: PLACEMENT_TYPE_ICE },
    { x: 7, y: 8, type: PLACEMENT_TYPE_ICE },
    { x: 7, y: 9, type: PLACEMENT_TYPE_ICE },
    { x: 7, y: 11, type: PLACEMENT_TYPE_ICE },
    { x: 7, y: 12, type: PLACEMENT_TYPE_ICE },
    { x: 8, y: 7, type: PLACEMENT_TYPE_ICE },
    { x: 8, y: 8, type: PLACEMENT_TYPE_ICE },
    { x: 8, y: 9, type: PLACEMENT_TYPE_ICE },
    { x: 8, y: 10, type: PLACEMENT_TYPE_ICE },
    { x: 8, y: 11, type: PLACEMENT_TYPE_ICE },
    { x: 8, y: 12, type: PLACEMENT_TYPE_ICE },
    { x: 9, y: 7, type: PLACEMENT_TYPE_ICE },
    { x: 9, y: 8, type: PLACEMENT_TYPE_ICE },
    { x: 9, y: 9, type: PLACEMENT_TYPE_ICE },
    { x: 9, y: 10, type: PLACEMENT_TYPE_ICE },
    { x: 9, y: 11, type: PLACEMENT_TYPE_ICE },
    { x: 9, y: 12, type: PLACEMENT_TYPE_ICE, corner: "BOTTOM_RIGHT" },

    { x: 10, y: 3, type: PLACEMENT_TYPE_ICE },
    { x: 10, y: 5, type: PLACEMENT_TYPE_ICE },
    { x: 10, y: 7, type: PLACEMENT_TYPE_ICE, corner: "TOP_RIGHT" },
    { x: 10, y: 8, type: PLACEMENT_TYPE_ICE },
    { x: 10, y: 9, type: PLACEMENT_TYPE_ICE },
    { x: 11, y: 4, type: PLACEMENT_TYPE_ICE },
    { x: 11, y: 5, type: PLACEMENT_TYPE_ICE },
    { x: 11, y: 11, type: PLACEMENT_TYPE_ICE },
    { x: 11, y: 12, type: PLACEMENT_TYPE_ICE },
    { x: 11, y: 13, type: PLACEMENT_TYPE_ICE },
    { x: 12, y: 3, type: PLACEMENT_TYPE_ICE },
    { x: 12, y: 4, type: PLACEMENT_TYPE_ICE },
    { x: 12, y: 5, type: PLACEMENT_TYPE_ICE },
    { x: 12, y: 11, type: PLACEMENT_TYPE_ICE },
    { x: 12, y: 12, type: PLACEMENT_TYPE_ICE },
    { x: 12, y: 13, type: PLACEMENT_TYPE_ICE },
    { x: 13, y: 3, type: PLACEMENT_TYPE_ICE, corner: "TOP_RIGHT" },
    { x: 13, y: 4, type: PLACEMENT_TYPE_ICE },
    { x: 13, y: 5, type: PLACEMENT_TYPE_ICE, corner: "BOTTOM_RIGHT" },
    { x: 13, y: 11, type: PLACEMENT_TYPE_ICE },
    { x: 13, y: 12, type: PLACEMENT_TYPE_ICE },
    { x: 13, y: 13, type: PLACEMENT_TYPE_ICE, corner: "BOTTOM_RIGHT" },

    { x: 1, y: 13, type: PLACEMENT_TYPE_WATER_PICKUP },
    { x: 1, y: 7, type: PLACEMENT_TYPE_WATER },
    { x: 1, y: 8, type: PLACEMENT_TYPE_WATER },
    { x: 1, y: 9, type: PLACEMENT_TYPE_WATER },
    { x: 2, y: 7, type: PLACEMENT_TYPE_WATER },
    { x: 2, y: 8, type: PLACEMENT_TYPE_WATER },
    { x: 2, y: 9, type: PLACEMENT_TYPE_WATER },
    { x: 3, y: 5, type: PLACEMENT_TYPE_WATER },
    { x: 3, y: 7, type: PLACEMENT_TYPE_WATER },
    { x: 3, y: 8, type: PLACEMENT_TYPE_WATER },
    { x: 3, y: 9, type: PLACEMENT_TYPE_WATER },

    { x: 13, y: 7, type: PLACEMENT_TYPE_WATER },
    { x: 13, y: 8, type: PLACEMENT_TYPE_WATER },
    { x: 13, y: 9, type: PLACEMENT_TYPE_WATER },
    { x: 12, y: 7, type: PLACEMENT_TYPE_WATER },
    { x: 12, y: 8, type: PLACEMENT_TYPE_WATER },
    { x: 12, y: 9, type: PLACEMENT_TYPE_WATER },
    { x: 11, y: 3, type: PLACEMENT_TYPE_WATER },
    { x: 11, y: 7, type: PLACEMENT_TYPE_WATER },
    { x: 11, y: 8, type: PLACEMENT_TYPE_WATER },
    { x: 11, y: 9, type: PLACEMENT_TYPE_WATER },

    { x: 7, y: 8, type: PLACEMENT_TYPE_FIRE_PICKUP },
    { x: 2, y: 10, type: PLACEMENT_TYPE_FIRE },
    { x: 3, y: 10, type: PLACEMENT_TYPE_FIRE },
    { x: 4, y: 11, type: PLACEMENT_TYPE_FIRE },
    { x: 4, y: 12, type: PLACEMENT_TYPE_FIRE },
    { x: 4, y: 13, type: PLACEMENT_TYPE_FIRE },
    { x: 5, y: 13, type: PLACEMENT_TYPE_FIRE },
    { x: 6, y: 13, type: PLACEMENT_TYPE_FIRE },

    { x: 12, y: 10, type: PLACEMENT_TYPE_FIRE },
    { x: 11, y: 10, type: PLACEMENT_TYPE_FIRE },
    { x: 10, y: 11, type: PLACEMENT_TYPE_FIRE },
    { x: 10, y: 12, type: PLACEMENT_TYPE_FIRE },
    { x: 10, y: 13, type: PLACEMENT_TYPE_FIRE },
    { x: 9, y: 13, type: PLACEMENT_TYPE_FIRE },
    { x: 8, y: 13, type: PLACEMENT_TYPE_FIRE },

    { x: 1, y: 10, type: PLACEMENT_TYPE_THIEF },
    { x: 13, y: 10, type: PLACEMENT_TYPE_THIEF },

    { x: 4, y: 4, type: PLACEMENT_TYPE_CONVEYOR, direction: "LEFT" },
    { x: 10, y: 4, type: PLACEMENT_TYPE_CONVEYOR, direction: "RIGHT" },

    { x: 2, y: 8, type: PLACEMENT_TYPE_FLOUR },
    { x: 2, y: 12, type: PLACEMENT_TYPE_FLOUR },
    { x: 12, y: 8, type: PLACEMENT_TYPE_FLOUR },
    { x: 12, y: 12, type: PLACEMENT_TYPE_FLOUR },
    { x: 12, y: 4, type: PLACEMENT_TYPE_KEY, color: "GREEN" },
    { x: 10, y: 10, type: PLACEMENT_TYPE_LOCK, color: "GREEN" },
    { x: 2, y: 4, type: PLACEMENT_TYPE_KEY, color: "BLUE" },
    { x: 4, y: 10, type: PLACEMENT_TYPE_LOCK, color: "BLUE" },
  ],
};

export default DemoLevel7;
