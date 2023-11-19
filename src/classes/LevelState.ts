import { LevelSchema, PlacementSchema } from "@/helpers/types";
import {
  LEVEL_THEMES,
  PLACEMENT_TYPE_GOAL,
  PLACEMENT_TYPE_HERO,
  PLACEMENT_TYPE_WALL,
  PLACEMENT_TYPE_FLOUR,
} from "../helpers/consts";
import { TILES } from "../helpers/tiles";
import { placementFactory } from "./PlacementFactory";
import { GameLoop } from "./GameLoop";
import { DirectionControls } from "./DirectionControls";

type OnEmitType = (level: LevelSchema) => void;

export class LevelState {
  id: string;
  onEmit: OnEmitType;
  tilesWidth: number;
  tilesHeight: number;
  theme: string;
  placements: PlacementSchema[];

  constructor(levelId: string, onEmit: OnEmitType) {
    // publisher-subscriber pattern
    // onEmit 函數在這裡被用作一種回調機制，允許外部程式碼 "訂閱" LevelState 的狀態變化。
    this.id = levelId;
    this.onEmit = onEmit;
    this.directionControls = new DirectionControls();
    this.theme = LEVEL_THEMES.BLUE;
    this.tilesWidth = 8;
    this.tilesHeight = 8;
    this.placements = [];
    //Start the level!
    this.start();
  }

  start() {
    this.placements = [
      { id: 0, x: 2, y: 2, type: PLACEMENT_TYPE_HERO },
      { id: 1, x: 6, y: 4, type: PLACEMENT_TYPE_GOAL },
      { id: 2, x: 4, y: 4, type: PLACEMENT_TYPE_WALL },
      { id: 3, x: 5, y: 2, type: PLACEMENT_TYPE_WALL },
      { id: 4, x: 6, y: 6, type: PLACEMENT_TYPE_WALL },
      { id: 5, x: 3, y: 3, type: PLACEMENT_TYPE_FLOUR },
      { id: 6, x: 4, y: 3, type: PLACEMENT_TYPE_FLOUR },
      { id: 7, x: 5, y: 3, type: PLACEMENT_TYPE_FLOUR },
    ].map((config) => {
      return placementFactory.createPlacement(config, this);
    });

    // Cache a reference to the hero
    this.heroRef = this.placements.find((p) => p.type === PLACEMENT_TYPE_HERO);

    this.startGameLoop();
  }

  startGameLoop() {
    // 先停止，以免重複開新的 GameLoop
    this.gameLoop?.stop();
    this.gameLoop = new GameLoop(() => {
      this.tick();
    });
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

  getState() {
    return {
      theme: this.theme,
      tilesWidth: this.tilesWidth,
      tilesHeight: this.tilesHeight,
      placements: this.placements,
    };
  }

  destroy() {
    // Tear down the level.
    this.gameLoop.stop();
    this.directionControls.unbind();
  }
}
