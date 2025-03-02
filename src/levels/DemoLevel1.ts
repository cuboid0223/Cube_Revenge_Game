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

// const DemoLevel1 = {
//   theme: LEVEL_THEMES.YELLOW,
//   tilesWidth: 8,
//   tilesHeight: 5,
//   placements: [
//     // { x: 1, y: 1, type: PLACEMENT_TYPE_HERO },
//     // { x: 3, y: 1, type: PLACEMENT_TYPE_CIABATTA },
//     // { x: 2, y: 5, type: PLACEMENT_TYPE_FLYING_ENEMY },
//     // { x: 3, y: 5, type: PLACEMENT_TYPE_GROUND_ENEMY },
//     // { x: 4, y: 5, type: PLACEMENT_TYPE_ROAMING_ENEMY },
//     // { x: 1, y: 5, type: PLACEMENT_TYPE_LOCK },
//     // { x: 5, y: 1, type: PLACEMENT_TYPE_KEY },
//     { x: 1, y: 4, type: PLACEMENT_TYPE_FIRE },
//     { x: 2, y: 4, type: PLACEMENT_TYPE_FIRE },
//     { x: 3, y: 4, type: PLACEMENT_TYPE_FIRE },
//     { x: 1, y: 3, type: PLACEMENT_TYPE_FIRE_PICKUP },
//       {
//           "type": PLACEMENT_TYPE_HERO,
//           "x": 1,
//           "y": 1
//       },
//       {
//           "type": PLACEMENT_TYPE_GOAL,
//           "x": 7,
//           "y": 5
//       },
//       {
//           "type": PLACEMENT_TYPE_WALL,
//           "x": 4,
//           "y": 4
//       },
//       {
//           "type": PLACEMENT_TYPE_FLOUR,
//           "x": 3,
//           "y": 2
//       },
//       {
//           "type": PLACEMENT_TYPE_FLOUR,
//           "x": 6,
//           "y": 4
//       },
//       {
//           "type": PLACEMENT_TYPE_WALL,
//           "x": 4,
//           "y": 1
//       },
//       {
//           "type": PLACEMENT_TYPE_WALL,
//           "x": 4,
//           "y": 2
//       },
//       {
//           "type": PLACEMENT_TYPE_WALL,
//           "x": 4,
//           "y": 3
//       },
//       {
//           "type": PLACEMENT_TYPE_WALL,
//           "x": 7,
//           "y": 4
//       },
//       {
//           "type": PLACEMENT_TYPE_WALL,
//           "x": 6,
//           "y": 5
//       },
//       {
//         "type": PLACEMENT_TYPE_WATER,
//         "x": 6,
//         "y": 2
//     },
//     {
//       "type": PLACEMENT_TYPE_WATER_PICKUP,
//       "x": 2,
//       "y": 1
//   },
//     {
//       "type":PLACEMENT_TYPE_WATER,
//       "x": 7,
//       "y": 2
//   },
//   {
//       "type": PLACEMENT_TYPE_WATER,
//       "x": 6,
//       "y": 3
//   },
//   {
//     "type": PLACEMENT_TYPE_WATER,
//     "x": 7,
//     "y": 3
//   },
//   {
//     "type": PLACEMENT_TYPE_SWITCH,
//     "x": 5,
//     "y": 5
//   },
//   {
//     "type": PLACEMENT_TYPE_SWITCH_DOOR,
//     "x": 8,
//     "y": 4,
//     "isRaised": false
//   },
//   {
//     "type": PLACEMENT_TYPE_SWITCH_DOOR,
//     "x": 3,
//     "y": 1,
//     "isRaised": true
//   }

//   ],
// };

// bug level
const DemoLevel1 = {
  theme: LEVEL_THEMES.YELLOW,
  tilesWidth: 10,
  tilesHeight: 7,
  placements: [
    {
      type: PLACEMENT_TYPE_HERO_SPAWN,
      x: 1,
      y: 1,
    },
    {
      type: PLACEMENT_TYPE_HERO_EDITING,
      x: 5,
      y: 2,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 5,
      y: 4,
    },
    {
      type: PLACEMENT_TYPE_ICE,
      x: 4,
      y: 4,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      // "corner": "BOTTOM_RIGHT",
      x: 3,
      y: 4,
    },

    {
      type: PLACEMENT_TYPE_ICE,
      x: 4,
      y: 5,
    },
    {
      type: PLACEMENT_TYPE_ICE,
      corner: "BOTTOM_RIGHT",
      x: 4,
      y: 6,
    },
    {
      type: PLACEMENT_TYPE_ICE_PICKUP,
      x: 6,
      y: 3,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 3,
      y: 6,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 2,
      y: 4,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 2,
      y: 3,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 2,
      y: 2,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 6,
      y: 4,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 7,
      y: 4,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 8,
      y: 4,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 8,
      y: 3,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 8,
      y: 2,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 2,
      y: 1,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 10,
      y: 5,
    },
    {
      type: PLACEMENT_TYPE_WALL,
      x: 9,
      y: 6,
    },
    {
      type: PLACEMENT_TYPE_GOAL,
      x: 5,
      y: 5,
    },
    {
      type: PLACEMENT_TYPE_FLOUR,
      x: 3,
      y: 5,
    },
    {
      type: PLACEMENT_TYPE_FLOUR,
      x: 6,
      y: 5,
    },
    // {
    //   type: PLACEMENT_TYPE_CONVEYOR,
    //   direction: "DOWN",
    //   x: 1,
    //   y: 2,
    // },
    // {
    //   type: PLACEMENT_TYPE_CONVEYOR,
    //   direction: "DOWN",
    //   x: 1,
    //   y: 3,
    // },
    // {
    //   type: PLACEMENT_TYPE_CONVEYOR,
    //   direction: "DOWN",
    //   x: 1,
    //   y: 4,
    // },
    // {
    //   type: PLACEMENT_TYPE_CONVEYOR,
    //   direction: "RIGHT",
    //   x: 1,
    //   y: 5,
    // },
    // {
    //   type: PLACEMENT_TYPE_ICE,
    //   x: 6,
    //   y: 1,
    // },
    // {
    //   type: PLACEMENT_TYPE_ICE,
    //   x: 7,
    //   y: 1,
    // },
    // {
    //   type: PLACEMENT_TYPE_ICE,
    //   x: 8,
    //   y: 1,
    // },
    // {
    //   type: PLACEMENT_TYPE_ICE,
    //   corner: "TOP_RIGHT",
    //   x: 9,
    //   y: 1,
    // },
    // {
    //   type: PLACEMENT_TYPE_ICE,
    //   x: 9,
    //   y: 2,
    // },
    // {
    //   type: PLACEMENT_TYPE_ICE,
    //   x: 9,
    //   y: 3,
    // },
    // {
    //   type: PLACEMENT_TYPE_ICE,
    //   x: 9,
    //   y: 4,
    // },
    // {
    //   type: PLACEMENT_TYPE_ICE,
    //   x: 9,
    //   y: 5,
    // },
    // {
    //   type: PLACEMENT_TYPE_ICE,
    //   x: 8,
    //   y: 5,
    // },
    // {
    //   type: PLACEMENT_TYPE_ICE,
    //   x: 7,
    //   y: 5,
    // },

    // {
    //   type: PLACEMENT_TYPE_SWITCH_DOOR,
    //   x: 3,
    //   y: 1,
    //   isRaised: true,
    // },
    // {
    //   type: PLACEMENT_TYPE_SWITCH_DOOR,
    //   x: 4,
    //   y: 1,
    //   isRaised: false,
    // },
    // {
    //   type: PLACEMENT_TYPE_SWITCH_DOOR,
    //   x: 3,
    //   y: 3,
    // },
    {
      type: PLACEMENT_TYPE_FLYING_ENEMY,
      x: 7,
      y: 1,
      initialDirection: DIRECTION_RIGHT,
    },
  ],
};

export default DemoLevel1;
