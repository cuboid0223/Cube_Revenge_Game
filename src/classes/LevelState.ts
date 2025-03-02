import { Level, Placement } from "@/helpers/types";
import {
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
  DIRECTION_UP,
  PLACEMENT_TYPE_CIABATTA,
  PLACEMENT_TYPE_FLYING_ENEMY,
  PLACEMENT_TYPE_GOAL_ENABLED,
  PLACEMENT_TYPE_GROUND_ENEMY,
  PLACEMENT_TYPE_HERO,
  PLACEMENT_TYPE_HERO_EDITING,
  PLACEMENT_TYPE_HERO_SPAWN,
  PLACEMENT_TYPE_ROAMING_ENEMY,
  PLACEMENT_TYPE_WALL,
  THEME_ARRAY,
} from "../helpers/consts";
import { placementFactory } from "./PlacementFactory";
import { GameLoop } from "./GameLoop";
import { DirectionControls } from "./DirectionControls";
import { Inventory } from "./Inventory";
import { LevelAnimatedFrames } from "./LevelAnimatedFrames";
import { Camera } from "./Camera";
import { Clock } from "./Clock";
// import levels from "../levels/levelsMap";
import findSolutionPath, { createMap } from "@/utils/findSolutionPath";
import { Direction } from "@/types/global";
type OnEmitType = (level: Level) => void;

type EditModePlacementType = {
  type: string;
  corner?: string;
  isRaised?: boolean;
  initialDirection?: Direction;
  direction?: Direction;
};

export class LevelState {
  levels?: Level[];
  id: string;
  onEmit: OnEmitType;
  editModePlacement: EditModePlacementType;

  constructor(levels?: Level[], levelId: string, onEmit: OnEmitType) {
    // publisher-subscriber pattern
    // onEmit 函數在這裡被用作一種回調機制，允許外部程式碼 "訂閱" LevelState 的狀態變化。
    this.levels = levels;
    this.id = levelId;
    this.onEmit = onEmit;
    this.directionControls = new DirectionControls();
    this.isCompleted = false;
    this.editModePlacement = { type: PLACEMENT_TYPE_WALL };

    //Start the level!
    this.start();
  }

  start() {
    const levelData = this.levels[this.id];
    this.deathOutcome = null;
    this.theme = levelData.theme;
    this.tilesWidth = levelData.tilesWidth;
    this.tilesHeight = levelData.tilesHeight;
    this.placements = levelData.placements.map((config) => {
      return placementFactory.createPlacement(config, this);
    });
    this.gameMap = createMap(levelData).gameMap;
    this.solutionPath = findSolutionPath(
      this.gameMap,
      this.tilesWidth,
      this.tilesHeight,
      levelData.placements
    );

    this.inventory = new Inventory();

    // Cache a reference to the hero
    this.heroRef = this.placements.find(
      (p) =>
        p.type === PLACEMENT_TYPE_HERO || p.type === PLACEMENT_TYPE_HERO_EDITING
    );

    // Create a camera
    this.camera = new Camera(this);

    // Create a clock
    this.clock = new Clock(60, this);

    // Create a frame animation manager
    this.animatedFrames = new LevelAnimatedFrames();

    this.startGameLoop();
  }

  addPlacement(config: Placement) {
    if (
      config.type === PLACEMENT_TYPE_HERO_SPAWN ||
      config.type === PLACEMENT_TYPE_GOAL_ENABLED
    ) {
      // 找出目前地圖上已有的相同類型的 placement
      const existing = this.placements.filter((p) => p.type === config.type);
      existing.forEach((placement) => {
        this.deletePlacement(placement);
      });
    }
  
    this.placements.push(placementFactory.createPlacement(config, this));
    this.saveLevelToLocalStorage();
  }

  deletePlacement(placementToRemove) {
    this.placements = this.placements.filter((p) => {
      return p.id !== placementToRemove.id;
    });
    this.saveLevelToLocalStorage();
  }

  clearPlacements() {
    this.placements = this.placements.filter((p) => {
      return !p.canBeDeleted();
    });
    this.saveLevelToLocalStorage();
  }

  saveLevelToLocalStorage() {
    const keys = ["type", "x", "y", "isRaised", "direction", "color", "corner"];

    // 假設 getState 返回一個純資料物件，不包含循環引用
    const levelStateData = {
      id: this.id,
      theme: this.theme,
      tilesWidth: this.tilesWidth,
      tilesHeight: this.tilesHeight,
      placements: this.placements.map((p) => {
        return Object.fromEntries(
          keys.filter((key) => p[key] != null).map((key) => [key, p[key]])
        )
      })
    };

    localStorage.setItem("levelState", JSON.stringify(levelStateData));
  }


  

  updateTilesWidth(diff: number) {
    this.tilesWidth = this.tilesWidth + diff;
    this.saveLevelToLocalStorage();
    return this.tilesWidth;
  }

  updateTilesHeight(diff: number) {
    this.tilesHeight = this.tilesHeight + diff;
    this.saveLevelToLocalStorage();
    return this.tilesHeight;
  }

  startGameLoop() {
    // 先停止，以免重複開新的 GameLoop
    this.gameLoop?.stop();
    this.gameLoop = new GameLoop(() => {
      this.tick();
    });
  }

  updateSolutionPath() {
    this.gameMap = createMap(this.getState()).gameMap;
    this.solutionPath = findSolutionPath(
      this.gameMap,
      this.tilesWidth,
      this.tilesHeight,
      this.placements
    );
    // this.onEmit(this.getState());
  }

  tick() {
    // Check for movement here...
    // 透過  get direction 取得按鍵方向
    if (this.directionControls.direction) {
      this.heroRef.controllerMoveRequested(this.directionControls.direction);
    }

    // Call 'tick' on any Placement that wants to update
    this.placements.forEach((placement) => {
      placement.tick();
    });

    // Work on animation frames
    this.animatedFrames.tick();

    // Update the camera
    this.camera.tick();

    // Update the clock
    // this.clock.tick();

    //Emit any changes to React
    this.onEmit(this.getState());
  }

  isPositionOutOfBounds(x: number, y: number) {
    // 確認角色是否有脫離地圖範圍
    return (
      x === 0 ||
      y === 0 ||
      x >= this.tilesWidth + 1 ||
      y >= this.tilesHeight + 1
    );
  }

  copyPlacementsToClipboard() {
    // Convert the Placements to type,x,y JSON
    // 先將 PlacementsData 轉成 json

    const keys = ["type", "x", "y", "isRaised", "direction", "color", "corner"];

    const overrideMapping: Record<
      string,
      { type: string; initialDirection?: string }
    > = {
      ENEMY_LEFT_SPAWN: {
        type: PLACEMENT_TYPE_GROUND_ENEMY,
        initialDirection: DIRECTION_LEFT,
      },
      ENEMY_RIGHT_SPAWN: {
        type: PLACEMENT_TYPE_GROUND_ENEMY,
        initialDirection: DIRECTION_RIGHT,
      },
      ENEMY_UP_SPAWN: {
        type: PLACEMENT_TYPE_GROUND_ENEMY,
        initialDirection: DIRECTION_DOWN,
      },
      ENEMY_DOWN_SPAWN: {
        type: PLACEMENT_TYPE_GROUND_ENEMY,
        initialDirection: DIRECTION_UP,
      },
      ENEMY_FLYING_RIGHT_SPAWN: {
        type: PLACEMENT_TYPE_FLYING_ENEMY,
        initialDirection: DIRECTION_RIGHT,
      },
      ENEMY_FLYING_LEFT_SPAWN: {
        type: PLACEMENT_TYPE_FLYING_ENEMY,
        initialDirection: DIRECTION_LEFT,
      },
      ENEMY_FLYING_UP_SPAWN: {
        type: PLACEMENT_TYPE_FLYING_ENEMY,
        initialDirection: DIRECTION_UP,
      },
      ENEMY_FLYING_DOWN_SPAWN: {
        type: PLACEMENT_TYPE_FLYING_ENEMY,
        initialDirection: DIRECTION_DOWN,
      },
      ENEMY_ROAMING_SPAWN: {
        type: PLACEMENT_TYPE_ROAMING_ENEMY,
      },
      HERO_SPAWN: {
        type: PLACEMENT_TYPE_HERO,
      },
      CIABATTA_SPAWN: {
        type: PLACEMENT_TYPE_CIABATTA,
      },
    };

    const placementsData = this.placements
      .filter((p) => p.type !== PLACEMENT_TYPE_HERO_EDITING)
      .map((p) => {
        if (overrideMapping[p.type]) {
          return {
            x: p.x,
            y: p.y,
            ...overrideMapping[p.type],
          };
        }

        return Object.fromEntries(
          keys.filter((key) => p[key] != null).map((key) => [key, p[key]])
        );
      });

    const level = {
      theme: this.theme,
      tilesWidth: this.tilesWidth,
      tilesHeight: this.tilesHeight,
      placements: placementsData,
    };

    // Copy the data to the clipboard for moving into map files after editing
    // 複製到剪貼簿
    navigator.clipboard.writeText(JSON.stringify(level)).then(
      () => {
        console.log("Content copied to clipboard");

        // Also console log the output
        console.log(level);
      },
      () => {
        console.error("Failed to copy");
      }
    );
  }

  setEditModePlacement(newPlacement: EditModePlacementType) {
    this.editModePlacement = newPlacement;
  }

  changeTheme() {
    const index = THEME_ARRAY.indexOf(this.theme);
    // 如果找不到或是最後一個，就回到第一個
    this.theme = THEME_ARRAY[index + 1];
    if (index === -1 || index === THEME_ARRAY.length - 1) {
      this.theme = THEME_ARRAY[0];
    }
  }

  setZoom(n) {
    this.camera.setZoom(n);
    return this.camera.zoom;
  }

  // // 用來從 localStorage 中讀取的資料重建 LevelState 實例
  // static fromJSON(savedData: any, levels: Level[], onEmit: (level: Level) => void): LevelState {
  //   // 使用預設的建構式建立一個 LevelState
  //   const levelState = new LevelState(levels, savedData.id, onEmit);

  //   // 根據 savedData 設定各項屬性
  //   levelState.theme = savedData.theme;
  //   levelState.tilesWidth = savedData.tilesWidth;
  //   levelState.tilesHeight = savedData.tilesHeight;
  //   // 如果 placements 存的是純資料，就用 factory 重新建立實例（假設 savedData.placements 是陣列）
  //   levelState.placements = savedData.placements.map((config: any) =>
  //     placementFactory.createPlacement(config, levelState)
  //   );

  //   // 其他需要還原的屬性也在這裡設定，例如 solutionPath、inventory、camera 等
  //   // 注意：camera、clock、gameLoop 等可能需要在建構式內重新初始化

  //   return levelState;
  // }

  getState() {
    // 讓外部使用 levelState
    return {
      theme: this.theme,
      tilesWidth: this.tilesWidth,
      tilesHeight: this.tilesHeight,
      placements: this.placements,
      solutionPath: this.solutionPath,
      deathOutcome: this.deathOutcome,
      isCompleted: this.isCompleted,
      cameraTransformX: this.camera.transformX,
      cameraTransformY: this.camera.transformY,
      zoom: this.camera.zoom,
      secondsRemaining: this.clock.secondsRemaining,
      inventory: this.inventory,
      // 重新開始
      restart: () => {
        this.start();
      },

      // Edit Mode API
      // 將 method 傳出去供外部使用
      enableEditing: true,
      editModePlacement: this.editModePlacement,
      setZoom: this.setZoom.bind(this),
      changeTheme: this.changeTheme.bind(this),
      addPlacement: this.addPlacement.bind(this),
      deletePlacement: this.deletePlacement.bind(this),
      clearPlacements: this.clearPlacements.bind(this),
      updateTilesWidth: this.updateTilesWidth.bind(this),
      updateTilesHeight: this.updateTilesHeight.bind(this),
      setEditModePlacement: this.setEditModePlacement.bind(this),
      copyPlacementsToClipboard: this.copyPlacementsToClipboard.bind(this),
      updateSolutionPath: this.updateSolutionPath.bind(this),
    };
  }

  stealInventory() {
    this.placements.forEach((p) => {
      p.resetHasBeenCollected();
    });
    this.inventory.clear();
  }

  setDeathOutcome(causeOfDeath) {
    this.deathOutcome = causeOfDeath;
    this.gameLoop.stop();
  }

  completeLevel() {
    this.isCompleted = true;
    // 當角色完成該 level 後，所有動作均停止(包含角色移動)
    this.gameLoop.stop();
  }

  switchAllDoors() {
    this.placements.forEach((placement) => {
      if (placement.toggleIsRaised) {
        placement.toggleIsRaised();
      }
    });
  }
  destroy() {
    // Tear down the level.
    this.gameLoop.stop();
    this.directionControls.unbind();
  }
}
