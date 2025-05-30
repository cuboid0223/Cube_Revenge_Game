// import { Level } from "@/helpers/types";
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
  DEATH_TYPE_CLOCK,
  PLACEMENT_TYPE_GOAL,
} from "../helpers/consts";
import { placementFactory, PlacementType } from "./PlacementFactory";
import { GameLoop } from "./GameLoop";
import { DirectionControls } from "./DirectionControls";
import { Inventory } from "./Inventory";
import { LevelAnimatedFrames } from "./LevelAnimatedFrames";
import { Camera } from "./Camera";
import { Clock } from "./Clock";
import findSolutionPath, { createMap } from "@/utils/findSolutionPath";

import {
  DeathCause,
  Direction,
  LevelStateSnapshot,
  PlacementConfig,
} from "@/types/global";
import { Placement } from "@/game-objects/Placement";
import { SwitchableDoorPlacement } from "@/game-objects/SwitchableDoorPlacement";
import { ConveyorPlacement } from "@/game-objects/ConveyorPlacement";
import { IcePlacement } from "@/game-objects/IcePlacement";
import { LockPlacement } from "@/game-objects/LockPlacement";
import { HeroPlacement } from "@/game-objects/HeroPlacement";
import { HeroEditingPlacement } from "@/game-objects/HeroEditingPlacement";
import { KeyPlacement } from "@/game-objects/KeyPlacement";
import { encodeGameMap, encodePlacements } from "@/utils/encodeObject";

type OnEmitType = (level: LevelStateSnapshot) => void;

type EditModePlacementType = {
  type: string;
  corner?: string;
  isRaised?: boolean;
  initialDirection?: Direction;
  direction?: Direction;
};
type VisibleTileBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export class LevelState {
  levels?: Record<string, LevelStateSnapshot>;
  id: string;
  onEmit: OnEmitType;
  editModePlacement: EditModePlacementType;
  inventory: Inventory;
  directionControls: DirectionControls;
  isCompleted: boolean;
  gameLoop!: GameLoop;
  theme!: string;
  tilesWidth!: number;
  tilesHeight!: number;
  placements!: Placement[];
  visiblePlacements!: Placement[];
  heroRef: HeroPlacement | HeroEditingPlacement | undefined;
  camera!: Camera;
  clock!: Clock;
  animatedFrames!: LevelAnimatedFrames;
  solutionPath!: [number, number][] | null;
  deathOutcome!: PlacementType | null;
  gameMap!: string[][];
  enableEditing: boolean;
  static wasmModule: any = null;
  visibleTileBounds: VisibleTileBounds;
  readonly RENDER_RADIUS = 10; // Configurable: Tiles to render around the hero (adjust for performance/view)

  constructor(
    levelId: string,
    onEmit: OnEmitType,
    levels?: Record<string, LevelStateSnapshot>
  ) {
    this.levels = levels;
    this.id = levelId;
    this.onEmit = onEmit;
    this.directionControls = new DirectionControls();
    this.isCompleted = false;
    this.editModePlacement = { type: PLACEMENT_TYPE_WALL };
    this.inventory = new Inventory();
    this.enableEditing = false;
    this.visibleTileBounds = {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
  };

    this.start();
  }

  async start() {
    const levelData = this.levels![this.id];
    this.deathOutcome = null;
    this.theme = levelData.theme;
    this.tilesWidth = levelData.tilesWidth;
    this.tilesHeight = levelData.tilesHeight;
    this.placements = levelData.placements.map((config: PlacementConfig) => {
      return placementFactory.createPlacement(config, this);
    });
    this.visiblePlacements = [];
    this.gameMap = createMap(levelData).gameMap;

    this.heroRef = this.placements.find(
      (p): p is HeroPlacement | HeroEditingPlacement =>
        p.type === PLACEMENT_TYPE_HERO || p.type === PLACEMENT_TYPE_HERO_EDITING
    );

    this.camera = new Camera(this);
    this.clock = new Clock(60, this);
    this.animatedFrames = new LevelAnimatedFrames();
    this.visibleTileBounds = {
      minX: 0,
      maxX: this.tilesWidth,
      minY: 0, 
      maxY: this.tilesHeight,
  };
    this.startGameLoop();
    this.solutionPath = [];
    // this.solutionPath = await this.updateSolutionPath();
  }

  setEditingMode(enableEditing: boolean) {
    this.enableEditing = enableEditing;
  }

  addPlacement(config: PlacementConfig) {
    // 如果是 PLACEMENT_TYPE_HERO_SPAWN或是PLACEMENT_TYPE_GOAL_ENABLED
    // 一關中各只能存在一個
    if (
      config.type === PLACEMENT_TYPE_HERO_SPAWN ||
      config.type === PLACEMENT_TYPE_GOAL_ENABLED
    ) {
      const existing = this.placements.filter((p) => p.type === config.type);
      existing.forEach((placement) => {
        this.deletePlacement(placement);
      });
    }

    this.placements.push(placementFactory.createPlacement(config, this));
    if (this.enableEditing) {
      this.saveLevelToLocalStorage();
    }
  }

  deletePlacement(placementToRemove: Placement) {
    this.placements = this.placements.filter((p) => {
      return p.id !== placementToRemove.id;
    });
    if (this.enableEditing) {
      this.saveLevelToLocalStorage();
    }
  }

  clearPlacements() {
    this.placements = this.placements.filter((p) => {
      return !p.canBeDeleted();
    });
    this.saveLevelToLocalStorage();
  }

  saveLevelToLocalStorage() {
    const baseKeys: (keyof Placement)[] = ["type", "x", "y"];
    const extendedKeys: ("isRaised" | "direction" | "color" | "corner")[] = [
      "isRaised",
      "direction",
      "color",
      "corner",
    ];

    // 輔助函數：根據不同的 Placement 子類別提取擴展屬性
    function getExtendedProperties(
      p: Placement
    ): Partial<Record<"isRaised" | "direction" | "color" | "corner", unknown>> {
      // 如果是具有擴展屬性的子類，則提取相應的屬性
      if (
        p instanceof SwitchableDoorPlacement ||
        p instanceof ConveyorPlacement ||
        p instanceof IcePlacement ||
        p instanceof LockPlacement ||
        p instanceof KeyPlacement
      ) {
        const extendedProps: Partial<
          Record<"isRaised" | "direction" | "color" | "corner", unknown>
        > = {};
        extendedKeys.forEach((key) => {
          // 如果屬性存在且不為 null/undefined，就加入結果
          if (p[key as keyof typeof p] != null) {
            extendedProps[key] = p[key as keyof typeof p];
          }
        });
        return extendedProps;
      }
      return {};
    }

    const levelStateData = {
      id: this.id,
      theme: this.theme,
      tilesWidth: this.tilesWidth,
      tilesHeight: this.tilesHeight,
      placements: this.placements.map((p) => {
        const baseData = Object.fromEntries(
          baseKeys.filter((key) => p[key] != null).map((key) => [key, p[key]])
        );
        const extendedData = getExtendedProperties(p);
        return { ...baseData, ...extendedData };
      }),
    };

    localStorage.setItem("levelState", JSON.stringify(levelStateData));
  }

  updateTilesWidth(diff: number): number {
    this.tilesWidth = this.tilesWidth + diff;
    this.saveLevelToLocalStorage();
    return this.tilesWidth;
  }

  updateTilesHeight(diff: number): number {
    this.tilesHeight = this.tilesHeight + diff;
    this.saveLevelToLocalStorage();
    return this.tilesHeight;
  }

  startGameLoop() {
    this.gameLoop?.stop();
    this.gameLoop = new GameLoop(() => {
      this.tick();
    });
  }

  // 定義一個靜態的輔助方法，動態載入 wasm 模組
  static async loadWasmModule() {
    if (!LevelState.wasmModule) {
      try {
        // 注意檢查路徑是否正確（依照專案結構調整相對路徑）
        LevelState.wasmModule = await import(
          "../../public/wasm/findSolutionPath"
        );
      } catch (error) {
        console.error("WASM 模組載入失敗:", error);
        throw error;
      }
    }
    return LevelState.wasmModule;
  }

  async updateSolutionPath() {
    if (!this.gameMap || !this.placements) {
      console.warn("缺少 gameMap 或 placements 的資料");
      return;
    }

    const encodedMap = encodeGameMap(this.gameMap);
    const encodedPlacements = encodePlacements(this.placements);

    try {
      const wasm = await LevelState.loadWasmModule();

      const solution = wasm.findSolutionPathSimple(
        encodedMap,
        this.tilesWidth,
        this.tilesHeight,
        encodedPlacements
      );

      console.log("WASM 找到解決方案:", solution);

      // 根據需求，可以將 solution 更新到 LevelState 中，例如：
      this.solutionPath = solution; // 假設你已有定義 solutionPath

      return solution;
    } catch (error) {
      console.error("呼叫 WASM 版本 findSolutionPathSimple 失敗:", error);
      // 若需要進一步處理錯誤可在這裡擴充
    }
  }

  clearSolutionPath() {
    this.solutionPath = [];
    return this.solutionPath;
  }

  tick() {
    if (this.directionControls.direction) {
      (this.heroRef as HeroPlacement)?.controllerMoveRequested(
        this.directionControls.direction
      );
    }

    this.placements.forEach((placement) => {
      placement.tick();
    });

    this.animatedFrames.tick();
    this.camera.tick();
    this.onEmit(this.getState());
  }

  isPositionOutOfBounds(x: number, y: number): boolean {
    return (
      x === 0 ||
      y === 0 ||
      x >= this.tilesWidth + 1 ||
      y >= this.tilesHeight + 1
    );
  }

  copyPlacementsToClipboard() {
    const keys = ["type", "x", "y", "isRaised", "direction", "color", "corner"];
    const overrideMapping: Record<
      string,
      { type: PlacementType; initialDirection?: string }
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
        initialDirection: DIRECTION_UP,
      },
      ENEMY_DOWN_SPAWN: {
        type: PLACEMENT_TYPE_GROUND_ENEMY,
        initialDirection: DIRECTION_DOWN,
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
      GOAL_ENABLED: {
        type: PLACEMENT_TYPE_GOAL,
      },
    };
    // 類型保護函數 hasKey
    // 這個函數用來檢查一個物件 obj 是否具有指定的屬性 key。
    function hasKey<T extends object, K extends PropertyKey>(
      obj: T,
      key: K
    ): obj is T & Record<K, unknown> {
      //返回一個型別謂詞 obj is T & Record<K, unknown>。這告訴 TypeScript：如果函數回傳 true，則 obj 不僅是原來的型別 T，同時還包含一個屬性 key，而且該屬性的值型別是 unknown。
      return key in obj;
    }

    let placementsData = this.placements.map((p) => {
      // 如果 overrideMapping 中有該 placement type，則回傳合併後的結果
      if (overrideMapping[p.type]) {
        return {
          x: p.x,
          y: p.y,
          ...overrideMapping[p.type],
        };
      }
      // 否則，使用 keys 陣列動態取出屬性
      const entries: [string, unknown][] = [];
      for (const key of keys) {
        // 使用類型保護確認屬性存在
        if (hasKey(p, key) && p[key] != null) {
          entries.push([key, p[key]]);
        }
      }
      return Object.fromEntries(entries);
    });

    placementsData = placementsData.filter(
      (p) => p.type !== PLACEMENT_TYPE_HERO_EDITING
    );

    const level = {
      theme: this.theme,
      tilesWidth: this.tilesWidth,
      tilesHeight: this.tilesHeight,
      placements: placementsData,
    };

    navigator.clipboard.writeText(JSON.stringify(level)).then(
      () => {
        console.log("Content copied to clipboard");
        console.log(level);
      },
      () => {
        console.error("Failed to copy");
      }
    );
  }

  copyGameMapToClipboard() {
    try {
      this.gameMap = createMap(this.getState()).gameMap;
      navigator.clipboard.writeText(JSON.stringify(this.gameMap));
      console.log("gameMap copied to clipboard");
      console.log(this.gameMap);
      return { success: true, message: "Success to copy gameMap" };
    } catch (e) {
      console.error("Failed to copy gameMap");
      return { success: false, message: "Failed to copy gameMap" };
    }
  }

  setEditModePlacement(newPlacement: EditModePlacementType) {
    this.editModePlacement = newPlacement;
  }

  changeTheme() {
    const index = THEME_ARRAY.indexOf(this.theme);
    if (index === -1 || index === THEME_ARRAY.length - 1) {
      this.theme = THEME_ARRAY[0];
    } else {
      this.theme = THEME_ARRAY[index + 1];
    }
  }

  setZoom(n: number) {
    this.camera.setZoom(n);
    return this.camera.zoom;
  }

  getState(): LevelStateSnapshot {
   

    if (this.heroRef) {
        const heroX = this.heroRef.x;
        const heroY = this.heroRef.y;

        // Calculate tile bounds for filtering
        // Use Math.floor/Math.ceil to ensure integer tile indices
        const minVisibleX = Math.max(0, Math.floor(heroX - this.RENDER_RADIUS));
        const maxVisibleX = Math.min(this.tilesWidth, Math.ceil(heroX + this.RENDER_RADIUS));
        const minVisibleY = Math.max(0, Math.floor(heroY - this.RENDER_RADIUS));
        const maxVisibleY = Math.min(this.tilesHeight, Math.ceil(heroY + this.RENDER_RADIUS)) ;

        // Filter placements
        this.visiblePlacements = this.placements.filter(p =>
            p.x >= minVisibleX && p.x <= maxVisibleX &&
            p.y >= minVisibleY && p.y <= maxVisibleY
        );

        // Store these bounds for background rendering
        this.visibleTileBounds = {
            minX: minVisibleX,
            maxX: maxVisibleX,
            minY: minVisibleY,
            maxY: maxVisibleY,
        };

    } else {
        // If no hero, maybe render a default area or everything (less ideal for large maps)
        // For now, let's filter based on camera if no hero, or default to all
        this.visiblePlacements = this.placements; // Or filter based on camera center
         // visibleTileBounds remain full map size
    }
    return {
      theme: this.theme,
      tilesWidth: this.tilesWidth,
      tilesHeight: this.tilesHeight,
      // placements: this.placements,
      placements: this.visiblePlacements, // **Only visible placements**
      visibleTileBounds: this.visibleTileBounds, // **Bounds for background rendering**
      solutionPath: this.solutionPath,
      deathOutcome: this.deathOutcome,
      isCompleted: this.isCompleted,
      cameraTransformX: this.camera.transformX,
      cameraTransformY: this.camera.transformY,
      zoom: this.camera.zoom,
      secondsRemaining: this.clock.secondsRemaining,
      inventory: this.inventory,
      heroRef: this.heroRef,
      restart: () => {
        this.start();
      },
      enableEditing: true,
      gameMap: this.gameMap,

      editModePlacement: this.editModePlacement,
      setEditingMode: this.setEditingMode.bind(this),
      setZoom: this.setZoom.bind(this),
      changeTheme: this.changeTheme.bind(this),
      addPlacement: this.addPlacement.bind(this),
      deletePlacement: this.deletePlacement.bind(this),
      clearPlacements: this.clearPlacements.bind(this),
      updateTilesWidth: this.updateTilesWidth.bind(this),
      updateTilesHeight: this.updateTilesHeight.bind(this),
      setEditModePlacement: this.setEditModePlacement.bind(this),
      copyPlacementsToClipboard: this.copyPlacementsToClipboard.bind(this),
      copyGameMapToClipboard: this.copyGameMapToClipboard.bind(this),
      updateSolutionPath: this.updateSolutionPath.bind(this),
      clearSolutionPath: this.clearSolutionPath.bind(this),
    };
  }

  stealInventory() {
    this.placements.forEach((p) => {
      p.resetHasBeenCollected();
    });
    this.inventory.clear();
  }

  setDeathOutcome(causeOfDeath: DeathCause) {
    this.deathOutcome = causeOfDeath;
    this.gameLoop.stop();
  }

  completeLevel() {
    this.isCompleted = true;
    this.gameLoop.stop();
  }

  switchAllDoors() {
    this.placements.forEach((p) => {
      if (p instanceof SwitchableDoorPlacement) {
        p.toggleIsRaised();
      }
    });
  }

  destroy() {
    this.gameLoop.stop();
    this.directionControls.unbind();
  }
}
