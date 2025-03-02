import {
  PLACEMENT_TYPE_HERO,
  PLACEMENT_TYPE_GOAL,
  PLACEMENT_TYPE_WALL,
  PLACEMENT_TYPE_FLOUR,
  PLACEMENT_TYPE_CELEBRATION,
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
  PLACEMENT_TYPE_HERO_SPAWN,
  PLACEMENT_TYPE_GOAL_ENABLED,
  PLACEMENT_TYPE_CIABATTA_SPAWN,
  PLACEMENT_TYPE_GROUND_ENEMY_LEFT_SPAWN,
  PLACEMENT_TYPE_ENEMY_LEFT_SPAWN,
  PLACEMENT_TYPE_ENEMY_RIGHT_SPAWN,
  PLACEMENT_TYPE_ENEMY_DOWN_SPAWN,
  PLACEMENT_TYPE_ENEMY_UP_SPAWN,
  PLACEMENT_TYPE_ENEMY_FLYING_LEFT_SPAWN,
  PLACEMENT_TYPE_ENEMY_FLYING_RIGHT_SPAWN,
  PLACEMENT_TYPE_ENEMY_FLYING_DOWN_SPAWN,
  PLACEMENT_TYPE_ENEMY_FLYING_UP_SPAWN,
  PLACEMENT_TYPE_ROAMING_ENEMY_SPAWN,
  PLACEMENT_TYPE_HERO_EDITING,
} from "../helpers/consts";

import { HeroPlacement } from "../game-objects/HeroPlacement";
import { GoalPlacement } from "../game-objects/GoalPlacement";
import { WallPlacement } from "../game-objects/WallPlacement";
import { FlourPlacement } from "../game-objects/FlourPlacement";
import { CelebrationPlacement } from "../game-objects/CelebrationPlacement";
import { LockPlacement } from "../game-objects/LockPlacement";
import { KeyPlacement } from "../game-objects/KeyPlacement";
import { WaterPlacement } from "../game-objects/WaterPlacement";
import { GroundEnemyPlacement } from "../game-objects/GroundEnemyPlacement";
import { FlyingEnemyPlacement } from "../game-objects/FlyingEnemyPlacement";
import { RoamingEnemyPlacement } from "../game-objects/RoamingEnemyPlacement";
import { ConveyorPlacement } from "../game-objects/ConveyorPlacement";
import { IcePlacement } from "../game-objects/IcePlacement";
import { IcePickupPlacement } from "../game-objects/IcePickupPlacement";
import { FirePlacement } from "../game-objects/FirePlacement";
import { FirePickupPlacement } from "../game-objects/FirePickupPlacement";
import { SwitchableDoorPlacement } from "../game-objects/SwitchableDoorPlacement";
import { DoorSwitchPlacement } from "../game-objects/DoorSwitchPlacement";
import { TeleportPlacement } from "../game-objects/TeleportPlacement";
import { ThiefPlacement } from "../game-objects/ThiefPlacement";
import { CiabattaPlacement } from "../game-objects/CiabattaPlacement";

// types
import { Level, Placement } from "@/helpers/types";
import { WaterPickupPlacement } from "@/game-objects/WaterPickupPlacement";
import { HeroSpawnPlacement } from "@/game-objects/HeroSpawnPlacement";
import { GoalEnabledPlacement } from "@/game-objects/GoalEnabledPlacement";
import { CiabattaSpawnPlacement } from "@/game-objects/CiabattaSpawnPlacement";
import { EnemyLeftSpawnPlacement } from "@/game-objects/EnemyLeftSpawnPlacement";
import { EnemyRightSpawnPlacement } from "@/game-objects/EnemyRightSpawnPlacement";
import { EnemyDownSpawnPlacement } from "@/game-objects/EnemyDownSpawnPlacement";
import { EnemyUpSpawnPlacement } from "@/game-objects/EnemyUpSpawnPlacement";
import { EnemyFlyingLeftSpawnPlacement } from "@/game-objects/EnemyFlyingLeftSpawnPlacement";
import { EnemyFlyingRightSpawnPlacement } from "@/game-objects/EnemyFlyingRightSpawnPlacement";
import { EnemyFlyingDownSpawnPlacement } from "@/game-objects/EnemyFlyingDownSpawnPlacement";
import { EnemyFlyingUpSpawnPlacement } from "@/game-objects/EnemyFlyingUpSpawnPlacement";
import { RoamingEnemySpawnPlacement } from "@/game-objects/RoamingEnemySpawnPlacement";
import { HeroEditingPlacement } from "@/game-objects/HeroEditingPlacement";

const placementTypeClassMap = {
  [PLACEMENT_TYPE_HERO]: HeroPlacement,
  [PLACEMENT_TYPE_HERO_SPAWN]: HeroSpawnPlacement,
  [PLACEMENT_TYPE_HERO_EDITING]: HeroEditingPlacement,

  [PLACEMENT_TYPE_GOAL]: GoalPlacement,
  [PLACEMENT_TYPE_GOAL_ENABLED]: GoalEnabledPlacement,
  [PLACEMENT_TYPE_WALL]: WallPlacement,
  [PLACEMENT_TYPE_FLOUR]: FlourPlacement,
  [PLACEMENT_TYPE_CELEBRATION]: CelebrationPlacement,
  [PLACEMENT_TYPE_LOCK]: LockPlacement,
  [PLACEMENT_TYPE_KEY]: KeyPlacement,
  [PLACEMENT_TYPE_WATER]: WaterPlacement,
  [PLACEMENT_TYPE_WATER_PICKUP]: WaterPickupPlacement,
  [PLACEMENT_TYPE_GROUND_ENEMY]: GroundEnemyPlacement,
  [PLACEMENT_TYPE_ENEMY_LEFT_SPAWN]: EnemyLeftSpawnPlacement,
  [PLACEMENT_TYPE_ENEMY_RIGHT_SPAWN]: EnemyRightSpawnPlacement,
  [PLACEMENT_TYPE_ENEMY_DOWN_SPAWN]: EnemyDownSpawnPlacement,
  [PLACEMENT_TYPE_ENEMY_UP_SPAWN]: EnemyUpSpawnPlacement,

  [PLACEMENT_TYPE_FLYING_ENEMY]: FlyingEnemyPlacement,
  [PLACEMENT_TYPE_ENEMY_FLYING_LEFT_SPAWN]: EnemyFlyingLeftSpawnPlacement,
  [PLACEMENT_TYPE_ENEMY_FLYING_RIGHT_SPAWN]: EnemyFlyingRightSpawnPlacement,
  [PLACEMENT_TYPE_ENEMY_FLYING_DOWN_SPAWN]: EnemyFlyingDownSpawnPlacement,
  [PLACEMENT_TYPE_ENEMY_FLYING_UP_SPAWN]: EnemyFlyingUpSpawnPlacement,




  [PLACEMENT_TYPE_ROAMING_ENEMY]: RoamingEnemyPlacement,
  [PLACEMENT_TYPE_ROAMING_ENEMY_SPAWN]: RoamingEnemySpawnPlacement,
  [PLACEMENT_TYPE_CONVEYOR]: ConveyorPlacement,
  [PLACEMENT_TYPE_ICE]: IcePlacement,
  [PLACEMENT_TYPE_ICE_PICKUP]: IcePickupPlacement,
  [PLACEMENT_TYPE_FIRE]: FirePlacement,
  [PLACEMENT_TYPE_FIRE_PICKUP]: FirePickupPlacement,
  [PLACEMENT_TYPE_SWITCH_DOOR]: SwitchableDoorPlacement,
  [PLACEMENT_TYPE_SWITCH]: DoorSwitchPlacement,
  [PLACEMENT_TYPE_TELEPORT]: TeleportPlacement,
  [PLACEMENT_TYPE_THIEF]: ThiefPlacement,
  [PLACEMENT_TYPE_CIABATTA]: CiabattaPlacement,
  [PLACEMENT_TYPE_CIABATTA_SPAWN]: CiabattaSpawnPlacement,
};

class PlacementFactory {
  createPlacement(config: Placement, level: Level) {
    console.log(config)
    const placementClass = placementTypeClassMap[config.type];
    if (!placementClass) {
      console.warn("NO TYPE FOUND", config.type);
    }
    // Generate a new instance with random ID
    const instance = new placementClass(config, level);
    instance.id = Math.floor(Math.random() * 9999999) + 1;
    return instance;
  }

  // getInstance(config: Placement, level: Level) {
  //   switch (config.type) {
  //     case PLACEMENT_TYPE_HERO:
  //       return new HeroPlacement(config, level);
  //     case PLACEMENT_TYPE_GOAL:
  //       return new GoalPlacement(config, level);
  //     case PLACEMENT_TYPE_WALL:
  //       return new WallPlacement(config, level);
  //     case PLACEMENT_TYPE_FLOUR:
  //       return new FlourPlacement(config, level);
  //     default:
  //       console.warn("NO TYPE FOUND", config.type);
  //       return null;
  //   }
  // }
}

export const placementFactory = new PlacementFactory();
