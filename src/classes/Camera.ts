import { Level } from "@/helpers/types";
import { CELL_SIZE } from "../helpers/consts";
import {
  DIRECTION_RIGHT,
  DIRECTION_LEFT,
  DIRECTION_UP,
  DIRECTION_DOWN,
} from "../helpers/consts";
import { LevelStateSnapshot } from "@/types/global";
import { HeroPlacement } from "@/game-objects/HeroPlacement";
import { HeroEditingPlacement } from "@/game-objects/HeroEditingPlacement";
import { LevelState } from "./LevelState";
const CAMERA_SPEED = 0.02;
const CAMERA_LOOKAHEAD = 3;
const USE_SMOOTH_CAMERA = true;

export class Camera {
  level: LevelState;
  cameraX: number;
  cameraY: number;
  transformOffset: number;
  private _zoom: number;

  constructor(level: LevelState) {
    this.level = level;
    const [heroX, heroY] = (
      this.level.heroRef as HeroPlacement | HeroEditingPlacement
    )?.displayXY();
    this.cameraX = heroX;
    this.cameraY = heroY;
    this.transformOffset = -5.5 * CELL_SIZE;
    this._zoom = 0.54;
  }

  setZoom(newZoom: number) {
    this._zoom = newZoom;
  }

  get transformX() {
    return -this.cameraX - this.transformOffset;
  }

  get transformY() {
    return -this.cameraY - this.transformOffset;
  }

  get zoom() {
    return this._zoom;
  }

  static lerp(currentValue: number, destinationValue: number, time: number) {
    return currentValue * (1 - time) + destinationValue * time;
  }

  tick() {
    // Start where the Hero is now
    const hero = this.level.heroRef;
    if (!hero) return;
    const [heroX, heroY] = hero.displayXY();
    let cameraDestinationX = heroX;
    let cameraDestinationY = heroY;

    if (this.level.enableEditing) {
      //  編輯模式下將 CAMERA 固定在地圖中間
      cameraDestinationX = Math.floor(this.level.tilesWidth / 2 - 1) * CELL_SIZE;
      // console.log(this.level.tilesWidth, cameraDestinationX);
      cameraDestinationY = Math.floor(this.level.tilesHeight / 2 - 3) * CELL_SIZE;
    }
    if (!this.level.enableEditing && hero.movingPixelsRemaining > 0) {
      //  非編輯模式下將 CAMERA 隨 HERO 移動
      //If moving, put the camera slightly ahead of where Hero is going
      if (hero.movingPixelDirection === DIRECTION_DOWN) {
        cameraDestinationY += CAMERA_LOOKAHEAD * CELL_SIZE;
      } else if (hero.movingPixelDirection === DIRECTION_UP) {
        cameraDestinationY -= CAMERA_LOOKAHEAD * CELL_SIZE;
      } else if (hero.movingPixelDirection === DIRECTION_LEFT) {
        cameraDestinationX -= CAMERA_LOOKAHEAD * CELL_SIZE;
      } else if (hero.movingPixelDirection === DIRECTION_RIGHT) {
        cameraDestinationX += CAMERA_LOOKAHEAD * CELL_SIZE;
      }
    }

    if (USE_SMOOTH_CAMERA) {
      // 使用 smooth camera
      this.cameraX = Camera.lerp(
        this.cameraX,
        cameraDestinationX,
        CAMERA_SPEED
      );
      this.cameraY = Camera.lerp(
        this.cameraY,
        cameraDestinationY,
        CAMERA_SPEED
      );
    } else {
      // 不想使用 smooth camera
      this.cameraX = cameraDestinationX;
      this.cameraY = cameraDestinationY;
    }
  }
}
