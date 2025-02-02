
// 可能的房間型別 (枚舉)
export enum RoomType {
    NONE = 0,     // 非路徑 (封死)
    TYPE1 = 1,    // 左右
    TYPE2 = 2,    // 左右 + 下
    TYPE3 = 3,    // 左右 + 上
    GOAL = 99,    // 終點 (示範)
}

export interface RoomExits {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
}
  
// 每個房間的資料
export type RoomInfo = {
    // 記錄四個方向是否可通
    exits: RoomExits;

    // 其他資訊 (蛇坑? 是否在路徑? 是否 start?)
    isStartRoom?: boolean;
    isGoalRoom?: boolean;
    inSolutionPath: boolean;
}

// 整張房間網格
export type RoomsGrid = RoomInfo[][];

// 最終 tile map (2D array of string / number)
export type TileMap = string[][]; // or number[][] 


// type Template = string[][]   // 2D array of tile

// 每個 key 可能對應多個模板 => Array of Template
export const templateMap: Record<string, string[][][]> = {
    "LR": [
    // Template A

    [
        ["1","1","1"],
        ["0","0","0"],
        ["1","1","1"]
    ],


    //   [
    //     ["1","1","1","1","1"],
    //     ["1","0","0","2","1"], 
    //     ["0","0","0","0","0"],
    //     ["1","0","4","0","1"],
    //     ["1","1","1","1","1"],
    //   ],
      // Template B(再舉例)
    //   [
    //     ["1","1","1","1","1"],
    //     ["1","0","0","0","1"], 
    //     ["0","0","2","0","0"],
    //     ["1","0","0","4","1"],
    //     ["1","1","1","1","1"],
    //   ]
    ],
    "LRD": [
        [
            ["1","1","1"],
            ["0","0","0"],
            ["1","0","1"]
        ],
      // ...
    ],
    "LRU": [
        [
            ["1","0","1"],
            ["0","0","0"],
            ["1","1","1"]
        ],
      // ...
    ],
    "LRUD": [
        [
            ["1","0","1"],
            ["0","0","0"],
            ["1","0","1"]
        ],
      // ...
    ],
    // 也可有 "" => 全封死
    "": [
        [["1","1","1"],["1","1","1"],["1","1","1"]]
    //   [
    //     ["1","1","1","1","1"],
    //     ["1","1","1","1","1"],
    //     ["1","1","1","1","1"],
    //     ["1","1","1","1","1"],
    //     ["1","1","1","1","1"],
    //   ]
    ],
    // 其他組合 ...
  };
  