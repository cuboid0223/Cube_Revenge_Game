This game is based on a paid course from https://drewconley.itch.io/ciabattas-revenge.
In this project, additional features have been implemented, including shortest path generation (based on game mechanics) and random level generation.

The hero must collect all the `FLOUR` on the map and reach the goal to clear the level.

## Features

1. No game engine used; rendering is entirely handled with React.

2. Implements an **A\* algorithm to find the shortest path to complete the game based on game mechanics**.
   ![image](/public/ice_path.png)
   ![image](/public/path_2.png)
   ![image](/public/path_3.png)

3. **Random level generation is achieved through the Random Walker algorithm**.
   ![image](/public/random%20(1).gif)

4. Dynamic rendering improves rendering performance.
  ![image](/public/dynamic_render.gif)
  

## Getting Started

First, run the development server:

```bash
npm install
```

Second, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Editing Room Templates

You can edit your own level templates in `helpers/roomTemplatesMap.ts.`

Please follow the coding guidelines below to edit levels.

```javascript
export const PLACEMENT_TYPES_CODE = {
  EMPTY: "0",
  DEFAULT_HERO_CODE: "h",
  HERO: "H", // "h" 代表該模板房間入被選為出生房間其預設出生位置
  DEFAULT_GOAL_CODE: "g",
  GOAL: "G", //  "g" 代表該模板房間入被選為終點房間其預設終點位置
  WALL: "1", // 1-50, 1-25, 1-75  使用 dash 後面接數字代表該物體出現機率，例如 1-50 代表 WALL 出現機率 50%

  WATER: "W",
  WATER_PICKUP: "WP", // 可以使用 & 在同一位置上出現兩種物體 例如在該冰上有50%機率出現 WATER_PICKUP 則 "I&WP-50"
  FIRE: "F",
  FIRE_PICKUP: "FP",
  ICE: "I",
  ICE_BOTTOM_RIGHT: "I_BR",
  ICE_BOTTOM_LEFT: "I_BL",
  ICE_TOP_LEFT: "I_TL",
  ICE_TOP_RIGHT: "I_TR",

  ICE_PICKUP: "IP",

  FLOUR: "M",
  LOCK: "L",
  KEY: "K",
  CONVEYOR: "C",
  // CONVEYOR_RIGHT: "C_R",
  // CONVEYOR_LEFT: "C_L",
  // CONVEYOR_UP: "C_U",
  // CONVEYOR_DOWN: "C_D",

  TELEPORT: "T",
  THIEF: "R", // Reset tile
  SWITCH_DOOR: "SD",
  SWITCH_DOOR_Default_Raised: "SD_1",
  SWITCH_DOOR_Default_Without_Raised: "SD_0",
  SWITCH: "S",

  GROUND_ENEMY: "GE",
  // 預設 ENEMY 是水平(左右)移動 也可以設置  GE_D (DOWN)或是 GE_U (UP) 垂直走
  FLYING_ENEMY: "FE", // 同理 GROUND_ENEMY ，FE_D, FE_U
  ROAMING_ENEMY: "RE", // ROAMING_ENEMY 是隨機行走的
  CIABATTA: "BOSS",
};
```

### Room Template Example 1

```javascript
    [
      ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1"],
      ["1", "0", "FE_D", "1", "0", "0", "1", "0", "0", "1"],
      ["1", "0", "0", "1", "S", "S", "1", "0", "0", "1"],
      ["1", "0", "0", "1", "GE_D", "0", "1", "0", "0", "1"],
      ["0", "SD_0", "0", "SD_1", "S-50", "S-25", "SD_0", "0", "SD_1", "0"],
      ["0", "SD_0", "0", "SD_1", "S-25", "S-50", "SD_0", "0", "SD_1", "0"],
      ["1", "0", "0", "1", "0", "GE_U", "1", "0", "0", "1"],
      ["1", "0", "0", "1", "S", "S", "1", "0", "0", "1"],
      ["1", "0", "0", "1", "0", "0", "1", "FE_U", "0", "1"],
      ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1"],
    ],
```

![image](/public/2.gif)

### Room Template Example 2

For placements such as `WP`, `FP`,`K` and `M`, which can be picked up, they must be placed at the end of the string, e.g., `"I-50&F-50&WP"`. If they are placed at the beginning of the string, they will be overridden, e.g., `"WP&I-50&F-50"`.

```javascript
    [
      ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1"],
      ["1", "0", "0", "0", "0", "0", "0", "0", "0", "1"],
      ["1", "0", "0", "0", "0", "0", "0", "0", "0", "1"],
      ["1", "0", "0", "0", "0", "W&IP", "0", "GE&I", "0", "1"],
      ["0", "0", "0", "0", "0", "I-50&F-50&WP", "0", "0", "0", "0"],
      ["1", "0", "0", "0", "0", "I&FP", "0", "0", "0", "1"],
      ["1", "0", "0", "0", "0", "R&M", "0", "0", "0", "1"],
      ["1", "0", "0", "0", "0", "0", "0", "0", "0", "1"],
      ["1", "0", "0", "0", "0", "g", "0", "0", "0", "1"],
      ["1", "1", "1", "1", "1", "1", "1", "1", "1", "1"],
    ],
```

![image](/public/3.gif)

## Demo

### All Game Placements

![image](/public/all.png)

<!-- [![Demo](https://i.imgur.com/jY0A8Ge.png)](https://youtu.be/L0lZiz0Harg "demo")

[![Demo2](https://i.imgur.com/cbusTjL.png)](https://youtu.be/TXq1DlpzvV8 "demo2") -->

### Level Editor

![image](/public/editor.gif)

## Future Works

1. Level Editor: Utilize a visual interface to prevent errors caused by manual code input.
2. Level Entry and Transition Animations: Enhance the game experience with smooth level entry and transition animations.

## Reference

https://drewconley.itch.io/ciabattas-revenge
https://tinysubversions.com/spelunkyGen/
https://tinysubversions.com/spelunkyGen2/
