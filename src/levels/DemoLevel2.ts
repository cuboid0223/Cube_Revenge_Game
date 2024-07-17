import {
  LEVEL_THEMES, PLACEMENT_TYPE_CIABATTA,
  PLACEMENT_TYPE_FLOUR, PLACEMENT_TYPE_FLYING_ENEMY,
  PLACEMENT_TYPE_GOAL,
  PLACEMENT_TYPE_HERO,
  PLACEMENT_TYPE_WALL,
  PLACEMENT_TYPE_GROUND_ENEMY,
  PLACEMENT_TYPE_ROAMING_ENEMY,
  PLACEMENT_TYPE_LOCK,
  PLACEMENT_TYPE_KEY,
} from "../helpers/consts";

const DemoLevel2 = {
  theme: LEVEL_THEMES.YELLOW,
  tilesWidth: 8,
  tilesHeight: 5,
  placements: [
    { x: 1, y: 1, type: PLACEMENT_TYPE_HERO },
    { x: 3, y: 1, type: PLACEMENT_TYPE_CIABATTA },
    { x: 2, y: 5, type: PLACEMENT_TYPE_FLYING_ENEMY },
    { x: 3, y: 5, type: PLACEMENT_TYPE_GROUND_ENEMY },
    { x: 4, y: 5, type: PLACEMENT_TYPE_ROAMING_ENEMY },
    { x: 1, y: 5, type: PLACEMENT_TYPE_LOCK },
    { x: 5, y: 1, type: PLACEMENT_TYPE_KEY },
    { x: 7, y: 5, type: PLACEMENT_TYPE_GOAL },
    { x: 4, y: 4, type: PLACEMENT_TYPE_WALL },
    { x: 3, y: 2, type: PLACEMENT_TYPE_FLOUR },
    { x: 6, y: 4, type: PLACEMENT_TYPE_FLOUR },
  ],
};

export default DemoLevel2;
