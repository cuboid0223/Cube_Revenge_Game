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
  PLACEMENT_TYPE_HERO_SPAWN,
  PLACEMENT_TYPE_HERO_EDITING,
  PLACEMENT_TYPE_GOAL_ENABLED,
} from "../helpers/consts";
const DemoLevel4 = {
  theme: "GRAY",
  tilesWidth: 13,
  tilesHeight: 13,
  placements: [
    { x: 7, y: 7, type: "HERO" },
    { x: 12, y: 2, type: "GOAL" },
    { type: "LOCK", x: 11, y: 2, color: "BLUE" },
    { type: "WALL", x: 2, y: 4 },
    { type: "WALL", x: 5, y: 2 },
    { type: "WALL", x: 10, y: 12 },
    { type: "FLOUR", x: 11, y: 1 },
    { type: "WALL", x: 3, y: 13 },
    { type: "WALL", x: 4, y: 6 },
    { type: "WALL", x: 4, y: 12 },
    { type: "WALL", x: 8, y: 3 },
    { type: "WALL", x: 9, y: 5 },
    { type: "WALL", x: 9, y: 10 },
    { type: "WALL", x: 13, y: 6 },
    { type: "WALL", x: 13, y: 11 },
    { type: "WATER", x: 1, y: 6 },
    { type: "WATER", x: 3, y: 1 },
    { type: "WATER", x: 3, y: 11 },
    { type: "WATER", x: 4, y: 7 },
    { type: "WATER", x: 4, y: 13 },
    { type: "WATER", x: 5, y: 13 },
    { type: "WATER", x: 6, y: 2 },
    { type: "WATER", x: 6, y: 10 },
    { type: "WATER", x: 8, y: 12 },
    { type: "WATER", x: 9, y: 3 },
    { type: "WATER", x: 10, y: 9 },
    { type: "WATER", x: 12, y: 1 },
    { type: "WATER", x: 12, y: 11 },
    { type: "WATER", x: 13, y: 7 },
    { type: "ICE", x: 1, y: 1, corner: "TOP_LEFT" },
    { type: "ICE", x: 1, y: 2 },
    { type: "ICE", x: 1, y: 3 },
    { type: "ICE", x: 1, y: 4 },
    { type: "ICE", x: 1, y: 5 },
    { type: "ICE", x: 1, y: 7 },
    { type: "ICE", x: 1, y: 8 },
    { type: "ICE", x: 1, y: 9 },
    { type: "ICE", x: 1, y: 10 },
    { type: "ICE", x: 1, y: 11 },
    { type: "ICE", x: 1, y: 12 },
    { type: "ICE", x: 1, y: 13, corner: "BOTTOM_LEFT" },
    { type: "ICE", x: 2, y: 1 },
    { type: "ICE", x: 2, y: 2 },
    { type: "ICE", x: 2, y: 3 },
    { type: "ICE", x: 2, y: 6 },
    { type: "ICE", x: 2, y: 7 },
    { type: "ICE", x: 2, y: 8 },
    { type: "ICE", x: 2, y: 9 },
    { type: "ICE", x: 2, y: 10 },
    { type: "ICE", x: 2, y: 11 },
    { type: "ICE", x: 2, y: 12 },
    { type: "ICE", x: 2, y: 13 },
    { type: "ICE", x: 3, y: 2 },
    { type: "ICE", x: 3, y: 3 },
    { type: "ICE", x: 3, y: 4 },
    { type: "ICE", x: 3, y: 5 },
    { type: "ICE", x: 3, y: 6 },
    { type: "ICE", x: 3, y: 7 },
    { type: "ICE", x: 3, y: 8 },
    { type: "ICE", x: 3, y: 9 },
    { type: "ICE", x: 3, y: 10 },
    { type: "ICE", x: 3, y: 12 },
    { type: "ICE", x: 4, y: 1 },
    { type: "ICE", x: 4, y: 2 },
    { type: "ICE", x: 4, y: 3 },
    { type: "ICE", x: 4, y: 4 },
    { type: "ICE", x: 4, y: 8 },
    { type: "ICE", x: 4, y: 9 },
    { type: "ICE", x: 4, y: 10 },
    { type: "ICE", x: 4, y: 11 },
    { type: "ICE", x: 5, y: 1 },
    { type: "ICE", x: 5, y: 6 },
    { type: "ICE", x: 5, y: 7 },
    { type: "ICE", x: 5, y: 8 },
    { type: "ICE", x: 5, y: 9 },
    { type: "ICE", x: 5, y: 10 },
    { type: "ICE", x: 5, y: 11 },
    { type: "ICE", x: 5, y: 12 },
    { type: "ICE", x: 6, y: 1 },
    { type: "ICE", x: 6, y: 3 },
    { type: "ICE", x: 6, y: 4 },
    { type: "ICE", x: 6, y: 9 },
    { type: "ICE", x: 6, y: 11 },
    { type: "ICE", x: 6, y: 12 },
    { type: "ICE", x: 6, y: 13 },
    { type: "ICE", x: 7, y: 1 },
    { type: "ICE", x: 7, y: 2 },
    { type: "ICE", x: 7, y: 3 },
    { type: "ICE", x: 7, y: 4 },
    { type: "ICE", x: 7, y: 5 },
    { type: "ICE", x: 7, y: 9 },
    { type: "ICE", x: 7, y: 10 },
    { type: "ICE", x: 7, y: 11 },
    { type: "ICE", x: 7, y: 12 },
    { type: "ICE", x: 7, y: 13 },
    { type: "ICE", x: 8, y: 1 },
    { type: "ICE", x: 8, y: 2 },
    { type: "ICE", x: 8, y: 4 },
    { type: "ICE", x: 8, y: 5 },
    { type: "ICE", x: 8, y: 9 },
    { type: "ICE", x: 8, y: 10 },
    { type: "ICE", x: 8, y: 11 },
    { type: "ICE", x: 8, y: 13 },
    { type: "ICE", x: 9, y: 1 },
    { type: "ICE", x: 9, y: 2 },
    { type: "ICE", x: 9, y: 4 },
    { type: "ICE", x: 9, y: 6 },
    { type: "ICE", x: 9, y: 7 },
    { type: "ICE", x: 9, y: 8 },
    { type: "ICE", x: 9, y: 9 },
    { type: "ICE", x: 9, y: 11 },
    { type: "ICE", x: 9, y: 12 },
    { type: "ICE", x: 9, y: 13 },
    { type: "ICE", x: 10, y: 1 },
    { type: "ICE", x: 10, y: 2 },
    { type: "ICE", x: 10, y: 3 },
    { type: "ICE", x: 10, y: 4 },
    { type: "ICE", x: 10, y: 5 },
    { type: "ICE", x: 10, y: 6 },
    { type: "ICE", x: 10, y: 7 },
    { type: "ICE", x: 10, y: 8 },
    { type: "ICE", x: 10, y: 10 },
    { type: "ICE", x: 10, y: 11 },
    { type: "ICE", x: 10, y: 13 },
    { type: "ICE", x: 11, y: 3 },
    { type: "ICE", x: 11, y: 4 },
    { type: "ICE", x: 11, y: 5 },
    { type: "ICE", x: 11, y: 6 },
    { type: "ICE", x: 11, y: 7 },
    { type: "ICE", x: 11, y: 8 },
    { type: "ICE", x: 11, y: 9 },
    { type: "ICE", x: 11, y: 10 },
    { type: "ICE", x: 11, y: 11 },
    { type: "ICE", x: 11, y: 13 },
    { type: "ICE", x: 12, y: 3 },
    { type: "ICE", x: 12, y: 4 },
    { type: "ICE", x: 12, y: 5 },
    { type: "ICE", x: 12, y: 6 },
    { type: "ICE", x: 12, y: 7 },
    { type: "ICE", x: 12, y: 8 },
    { type: "ICE", x: 12, y: 9 },
    { type: "ICE", x: 12, y: 10 },
    { type: "ICE", x: 12, y: 12 },
    { type: "ICE", x: 12, y: 13 },
    { type: "ICE", x: 13, y: 1, corner: "TOP_RIGHT" },
    { type: "ICE", x: 13, y: 2 },
    { type: "ICE", x: 13, y: 3 },
    { type: "ICE", x: 13, y: 4 },
    { type: "ICE", x: 13, y: 5 },
    { type: "ICE", x: 13, y: 8 },
    { type: "ICE", x: 13, y: 9 },
    { type: "ICE", x: 13, y: 10 },
    { type: "ICE", x: 13, y: 12 },
    { type: "ICE", x: 13, y: 13, corner: "BOTTOM_RIGHT" },
    { type: "ICE", x: 2, y: 5 },
    { type: "FLOUR", x: 2, y: 5 },
    { type: "ICE", x: 5, y: 4 },
    { type: "ICE", x: 5, y: 5 },
    { type: "ICE", x: 4, y: 5 },
    { type: "ICE", x: 6, y: 5 },
    { type: "KEY", x: 6, y: 5, color: "BLUE" },
    { type: "ICE", x: 5, y: 3 },
    { type: "FLOUR", x: 5, y: 3 },
    { type: "ICE", x: 11, y: 12 },
    { type: "FLOUR", x: 11, y: 12 },
  ],
};

export default DemoLevel4;
