// export type Level = {
//   theme: string,
//   tilesWidth: number,
//   tilesHeight: number,
//   placements: Placement[]
// };

import { LevelState } from "@/classes/LevelState";
import { PlacementType } from "@/classes/PlacementFactory";
import { HeroPlacement } from "@/game-objects/HeroPlacement";

export type FrameCoord = `${number}x${number}`;
export type DeathCause = DEATH_TYPE_CLOCK | PlacementType;
export type Direction = "LEFT" | "RIGHT" | "UP" | "DOWN";
export type IceCorner =
  | "TOP_LEFT"
  | "TOP_RIGHT"
  | "BOTTOM_LEFT"
  | "BOTTOM_RIGHT";
export interface LevelStateSnapshot {
  theme: string;
  tilesWidth: number;
  tilesHeight: number;
  placements: Placement[];
  solutionPath: [number, number][] | null;
  deathOutcome: PlacementType | null;
  isCompleted: boolean;
  cameraTransformX: number;
  cameraTransformY: number;
  zoom: number;
  heroRef?: HeroPlacement | HeroEditingPlacement | undefined;
  secondsRemaining: number;
  inventory: Inventory;
  gameMap: string[][];
  restart: () => void;
  enableEditing: boolean;
  editModePlacement: EditModePlacementType;
  setEditingMode: (enableEditing: boolean) => void;
  setZoom: (n: number) => number;
  changeTheme: () => void;
  addPlacement: (config: Placement) => void;
  deletePlacement: (placement: Placement) => void;
  clearPlacements: () => void;
  updateTilesWidth: (diff: number) => number;
  updateTilesHeight: (diff: number) => number;
  setEditModePlacement: (newPlacement: EditModePlacementType) => void;
  copyPlacementsToClipboard: () => void;
  copyGameMapToClipboard: () => { success: boolean; message: string };
  updateSolutionPath: () => [number, number][] | null;
  clearSolutionPath: () => [number, number][];
}

export type PlacementConfig = {
  x: number;
  y: number;
  type: PlacementType;
  id?: number;
  frameCoord?: FrameCoord;
};

export interface ExtendedPlacementConfig extends PlacementConfig {
  corner?: string;
  isRaised?: boolean;
  direction?: string;
  initialDirection?: string;
  color?: string;
}
