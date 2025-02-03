import { LevelSchema, PlacementSchema } from "@/helpers/types";
import { PLACEMENT_TYPE_HERO, PLACEMENT_TYPE_WALL } from "../helpers/consts";
import { placementFactory } from "./PlacementFactory";
import { GameLoop } from "./GameLoop";
import { DirectionControls } from "./DirectionControls";
import { Inventory } from "./Inventory";
import { LevelAnimatedFrames } from "./LevelAnimatedFrames";
import { Camera } from "./Camera";
import { Clock } from "./Clock";
import levels from "../levels/levelsMap";
import findSolutionPath, { createMap } from "@/utils/findSolutionPath";
type OnEmitType = (level: LevelSchema) => void;

export class LevelState {
  id: string;
  onEmit: OnEmitType;

  constructor(levelId: string, onEmit: OnEmitType) {
    // publisher-subscriber pattern
    // onEmit 函數在這裡被用作一種回調機制，允許外部程式碼 "訂閱" LevelState 的狀態變化。
    this.id = levelId;
    this.onEmit = onEmit;
    this.directionControls = new DirectionControls();
    this.isCompleted = false;
    this.editModePlacementType = PLACEMENT_TYPE_WALL;

    //Start the level!
    this.start();
  }

  start() {
    const levelData = levels[this.id];
    this.deathOutcome = null;
    this.theme = levelData.theme;
    this.tilesWidth = levelData.tilesWidth;
    this.tilesHeight = levelData.tilesHeight;
    this.placements = levelData.placements.map((config) => {
      return placementFactory.createPlacement(config, this);
    });
    this.gameMap = createMap(levelData).gameMap
    this.solutionPath = findSolutionPath(this.gameMap, this.tilesWidth,this.tilesHeight, levelData.placements)

    this.inventory = new Inventory();

    // Cache a reference to the hero
    this.heroRef = this.placements.find((p) => p.type === PLACEMENT_TYPE_HERO);

    // Create a camera
    this.camera = new Camera(this);

    // Create a clock
    this.clock = new Clock(60, this);

    // Create a frame animation manager
    this.animatedFrames = new LevelAnimatedFrames();

    this.startGameLoop();
  }

  addPlacement(config) {
    this.placements.push(placementFactory.createPlacement(config, this));
  }

  deletePlacement(placementToRemove) {
    this.placements = this.placements.filter((p) => {
      return p.id !== placementToRemove.id;
    });
  }

  startGameLoop() {
    // 先停止，以免重複開新的 GameLoop
    this.gameLoop?.stop();
    this.gameLoop = new GameLoop(() => {
      this.tick();
    });
  }

  updateSolutionPath(){
    this.gameMap = createMap(this.getState()).gameMap
    this.solutionPath = findSolutionPath(this.gameMap, this.tilesWidth,this.tilesHeight,this.placements)
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
    const placementsData = this.placements.map((p) => {
      return {
        type: p.type,
        x: p.x,
        y: p.y,
      };
    });

    // Copy the data to the clipboard for moving into map files after editing
    // 複製到剪貼簿
    navigator.clipboard.writeText(JSON.stringify(placementsData)).then(
      () => {
        console.log("Content copied to clipboard");

        // Also console log the output
        console.log(placementsData);
      },
      () => {
        console.error("Failed to copy");
      }
    );
  }

  setEditModePlacementType(newType) {
    this.editModePlacementType = newType;
  }


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
      secondsRemaining: this.clock.secondsRemaining,
      inventory: this.inventory,
      // 重新開始
      restart: () => {
        this.start();
      },
     
      // Edit Mode API
      // 將 method 傳出去供外部使用
      enableEditing: true,
      editModePlacementType: this.editModePlacementType,
      addPlacement: this.addPlacement.bind(this),
      deletePlacement: this.deletePlacement.bind(this),
      setEditModePlacementType: this.setEditModePlacementType.bind(this),
      copyPlacementsToClipboard: this.copyPlacementsToClipboard.bind(this),
      updateSolutionPath: this.updateSolutionPath.bind(this)
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
