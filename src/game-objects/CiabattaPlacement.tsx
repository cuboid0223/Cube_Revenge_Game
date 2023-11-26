import { TILES } from "@/helpers/tiles";
import { GroundEnemyPlacement } from "./GroundEnemyPlacement";
import CiabattaBody from "@/components/object-graphics/CiabattaBody";
import { CELL_SIZE, PLACEMENT_TYPE_ROAMING_ENEMY } from "@/helpers/consts";

const ATTACKS = {
  TACKLE: "TACKLE",
  SPAWN: "SPAWN",
};

export class CiabattaPlacement extends GroundEnemyPlacement {
  constructor(properties, level) {
    super(properties, level);
    this.tickBetweenMovesInterval = 40; // 每一步之間經過的 frame 數
    this.ticksUntilNextMove = this.tickBetweenMovesInterval;
    this.turnsAroundAtWater = true;
    this.interactsWithGround = true;

    this.normalMovesRemaining = 4; // 走完四格會出招
    this.hp = 3;
    this.painFramesRemaining = 0;

    this.currentAttack = null;
    this.deathFramesUntilDisappear = 0;
  }

  tickAttemptAiMove() {
    // tickAttemptAiMove() 會每個 frame 呼叫
    // Phase 1: Check if we hit the hero -----------------
    this.checkForOverlapWithHero();

    // Phase 2: counters
    if (this.ticksUntilNextMove > 0) {
      this.ticksUntilNextMove -= 1;
      return;
    }

    // Phase 3: Work on behaviors
    if (this.currentAttack) {
      this.workOnAttackFrame();
      return;
    }

    //Turn if next to a wall
    const direction = this.movingPixelDirection;
    if (this.isSolidAtNextPosition(direction)) {
      this.switchDirection();
      return;
    }

    // Next spot is free, so walk there
    if (this.movingPixelsRemaining === 0) {
      // 每走完一步 重置下列屬性
      this.ticksUntilNextMove = this.tickBetweenMovesInterval;
      this.movingPixelsRemaining = CELL_SIZE;
      this.movingPixelDirection = direction;
      this.updateFacingDirection();
      this.updateWalkFrame();
    }
  }

  onPostMove() {
    // Launch new attack if we are done with normal movement
    if (this.normalMovesRemaining === 0) {
      this.normalMovesRemaining = 4;
      this.startAttack();
      return;
    }
    // Keep moving
    this.normalMovesRemaining -= 1;
  }

  startAttack() {
    // Choose a random next attack
    const possibleNextAttacks = [ATTACKS.SPAWN, ATTACKS.TACKLE];
    // const possibleNextAttacks = [ATTACKS.SPAWN];
    // const possibleNextAttacks = [ATTACKS.TACKLE];
    const next =
      possibleNextAttacks[
        Math.floor(Math.random() * possibleNextAttacks.length)
      ];

    // Populate current attack slot
    if (next === ATTACKS.TACKLE) {
      this.currentAttack = {
        type: ATTACKS.TACKLE,
        framesRemaining: 120, // 這個攻擊的持續時間
        returnToY: this.y,
      };
    }
    if (next === ATTACKS.SPAWN) {
      this.currentAttack = {
        type: ATTACKS.SPAWN,
        framesRemaining: 220, // 這個攻擊的持續時間
      };
    }
  }

  workOnAttackFrame() {
    // 這個 function 會經過 tick() ，每個 frame 呼叫並持續遞減
    this.currentAttack.framesRemaining -= 1;
    // 當攻擊持續時間結束
    if (this.currentAttack.framesRemaining === 0) {
      this.currentAttack = null;
      return;
    }

    if (this.currentAttack.type === ATTACKS.TACKLE) {
      this.handleTackleAttackFrame();
    }
    if (this.currentAttack.type === ATTACKS.SPAWN) {
      this.handleSpawnAttackFrame();
    }
  }

  // 捕捉攻擊
  handleTackleAttackFrame() {
    const { framesRemaining, returnToY } = this.currentAttack;
    // Teleport to above hero's position 瞬移到主角上方一格(警告意味)
    if (framesRemaining === 119) {
      this.x = this.level.heroRef.x;
      this.y = this.level.heroRef.y - 1;
      if (this.y < 1) {
        this.y = 1;
      }
    }

    //  Lunge at the Hero 瞬移到主角上方一格後，往下一格抓主角
    if (framesRemaining === 90) {
      this.y = this.y + 1;
    }

    // Return to previous row
    if (framesRemaining === 50) {
      this.y = returnToY;
    }
  }

  // 召喚小丑攻擊
  handleSpawnAttackFrame() {
    const { framesRemaining } = this.currentAttack;
    if (framesRemaining === 210) {
      // Configure three roaming enemies around the hero
      [
        {
          type: PLACEMENT_TYPE_ROAMING_ENEMY,
          x: this.level.heroRef.x,
          y: this.level.heroRef.y + 2,
        },
        {
          type: PLACEMENT_TYPE_ROAMING_ENEMY,
          x: this.level.heroRef.x + 2,
          y: this.level.heroRef.y,
        },
        {
          type: PLACEMENT_TYPE_ROAMING_ENEMY,
          x: this.level.heroRef.x - 2,
          y: this.level.heroRef.y,
        },
      ]
        .filter((p) => {
          // Remove placements that are out of bounds
          // 若製造出來的小丑超出邊界範圍則排除掉
          return (
            p.x > 0 &&
            p.x <= this.level.tilesWidth &&
            p.y < this.level.tilesHeight
          );
        })
        .forEach((enemyConfig) => {
          // Add to level
          this.level.addPlacement(enemyConfig);
        });
    }

    // Remove all roaming enemies when the attack is ending
    // 此攻擊結束後收回場上所有小丑
    if (framesRemaining === 1) {
      this.level.placements.forEach((p) => {
        if (p.type === PLACEMENT_TYPE_ROAMING_ENEMY) {
          this.level.deletePlacement(p);
        }
      });
    }
  }

  getFrame() {
    // 若是 捕捉攻擊則更改 skin(CIABATTA_TELEPORT)
    if (this.currentAttack?.type === ATTACKS.TACKLE) {
      return TILES.CIABATTA_TELEPORT;
    }

    // Raise arms when moving or spawning
    // 若是 行走 或是 召喚小丑攻擊 則更改 skin(CIABATTA1)
    if (
      this.currentAttack?.type === ATTACKS.SPAWN ||
      this.movingPixelsRemaining > 0
    ) {
      return TILES.CIABATTA1;
    }

    return TILES.CIABATTA2;
  }

  renderComponent() {
    return <CiabattaBody frameCoord={this.getFrame()} />;
  }
}
