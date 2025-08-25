import { playSfx } from "@/lib/sfx";

// Player class for Pixi + Matter platformer
export class Player {
  constructor(Matter, PIXI, x, y, width, height, world, stage) {
    this.Matter = Matter;
    // Use a circle body for the player
    this.body = Matter.Bodies.circle(x, y, Math.max(width, height) / 2, {
      friction: 0.1,
      restitution: 0.0,
    });
    Matter.World.add(world, this.body);



    this.gfx = new PIXI.Graphics();
    this.drawPlayerShape(width, height);
    this.gfx.x = this.body.position.x;
    this.gfx.y = this.body.position.y;
    stage.addChild(this.gfx);

    this.width = width;
    this.height = height;
    this.state = "idle";
    this.lastDirection = 0;
    this.jumpAnim = 0;
    // health system
    this.maxHealth = 10;
    this.health = this.maxHealth;
    this._invulnerable = false;
    this._invulnMs = 1000; // 1s invulnerability after hit
    // spawn position for respawn
    this._spawn = { x: x, y: y };
    // Double jump logic
    this.jumpCount = 0;
    this.maxJumps = 2;
    // Maximum horizontal velocity
    this.maxXvelocity = 4;
    // Maximum vertical velocity
    this.maxYvelocity = 8;
  }

  drawPlayerShape(width, height) {
    this.gfx.clear();
    this.gfx.circle(0, 0, width / 1.4);
    // orange fill, warm darker stroke
    this.gfx.fill({ color: 0xff8c00 });
    this.gfx.stroke({ color: 0x8b3e00, width: 2 });
  }

  move(direction) {
    // Always apply the same force regardless of grounded state
    let forceX = direction * (this.isGrounded ? 0.01 : 0.001); // scale for Matter.js force
    if (this.isGrounded)
      if (direction === 0&&this.isGrounded) {
        this.state = "idle";
      } else if (direction === 1) {
        this.state = "moveRight";
      } else if (direction === -1) {
        this.state = "moveLeft";
      }
    this.lastDirection = direction;
    if (this.body && this.body.position && direction !== 0) {
      this.Matter.Body.applyForce(
        this.body,
        { x: this.body.position.x, y: this.body.position.y },
        { x: forceX, y: 0 }
      );
      // Clamp horizontal velocity to maxXvelocity
      const vx = this.body.velocity.x;
      if (Math.abs(vx) > this.maxXvelocity) {
        this.Matter.Body.setVelocity(this.body, {
          x: Math.sign(vx) * this.maxXvelocity,
          y: this.body.velocity.y,
        });
      }
    }
    // Clamp vertical velocity to maxYvelocity
    const vy = this.body.velocity.y;
    if (Math.abs(vy) > this.maxYvelocity) {
      this.Matter.Body.setVelocity(this.body, {
        x: this.body.velocity.x,
        y: Math.sign(vy) * this.maxYvelocity,
      });
    }
  }

  jump() {
    // Double jump logic
    const grounded =
      typeof this.isGrounded === "boolean"
        ? this.isGrounded
        : Math.abs(this.body.velocity.y) < 1 &&
          this.body.position.y + this.height / 2 >= groundY - 30;
    if (grounded) {
      this.jumpCount = 0;
    }
    if (grounded || this.jumpCount < this.maxJumps) {
      // Apply upward force for jump, preserve horizontal velocity
      const forceY = -0.08;
      this.Matter.Body.applyForce(
        this.body,
        { x: this.body.position.x, y: this.body.position.y },
        { x: 0, y: forceY }
      );

      this.state = "jump";
      this.jumpAnim = 1;
      this.jumpCount++;
      if (typeof playSfx === "function") {
        try {
          playSfx("jump");
        } catch (e) {
          console.log("jump sfx error", e);
        }
      }
    }
  }

  // Attach Matter collision handlers to maintain isGrounded/supporting set
  attachCollisionHandlers(engine) {
    if (!engine || !this.body || this._collisionStart) return;
    this._supporting = new Set();
    this.isGrounded = false;
    this._collisionStart = (event) => {
      for (const pair of event.pairs) {
        const a = pair.bodyA,
          b = pair.bodyB;
        if (a === this.body || b === this.body) {
          const other = a === this.body ? b : a;
          // maintain supporting set for ground/platforms
          if (other.isStatic) {
            this._supporting.add(other.id);
            this.isGrounded = this._supporting.size > 0;
            // Reset jump count on landing
            this.jumpCount = 0;
          }
          if (other.damage) {
            this._onHitObstacle(other, other.damage);
          }
        }
      }
    };
    this._collisionActive = (event) => {
      for (const pair of event.pairs) {
        const a = pair.bodyA,
          b = pair.bodyB;
        if (a === this.body || b === this.body) {
          const other = a === this.body ? b : a;
          if (other.isStatic) {
            this._supporting.add(other.id);
            this.isGrounded = this._supporting.size > 0;
          }

          if (other.damage) {
            this._onHitObstacle(other, other.damage);
          }
        }
      }
    };
    this._collisionEnd = (event) => {
      for (const pair of event.pairs) {
        const a = pair.bodyA,
          b = pair.bodyB;
        if (a === this.body || b === this.body) {
          const other = a === this.body ? b : a;
          if (this._supporting) {
            this._supporting.delete(other.id);
            this.isGrounded = this._supporting.size > 0;
          }
        }
      }
    };
    this._engine = engine;
    this.Matter.Events.on(engine, "collisionStart", this._collisionStart);
    this.Matter.Events.on(engine, "collisionActive", this._collisionActive);
    this.Matter.Events.on(engine, "collisionEnd", this._collisionEnd);
  }

  _onHitObstacle(obstacleBody, damage = 1) {
    if (this._invulnerable) return;
    // normalize damage to a positive integer
    const dmg =
      typeof damage === "number" && !isNaN(damage) && damage > 0
        ? Math.floor(Math.abs(damage))
        : 1;
    // reduce health
    this.health = Math.max(0, this.health - dmg);
    this._invulnerable = true;
    // play hit sound
    try {
      if (typeof playSfx === "function") playSfx("hit");
    } catch (e) {}
    // visual feedback: tint or briefly scale
    try {
      this.gfx.tint = 0xffcccc;
    } catch (e) {}
    setTimeout(() => {
      try {
        this._invulnerable = false;
        this.gfx.tint = 0xffffff;
      } catch (e) {}
    }, this._invulnMs);
    // bounce away from obstacle
    try {
      const ox = obstacleBody.position ? obstacleBody.position.x : 0;
      const dir = this.body.position.x >= ox ? 1 : -1; // push right if obstacle is left of player
      const bounceX = dir * 6; // horizontal push
      const bounceY = -8; // upward push
      this.Matter.Body.setVelocity(this.body, { x: bounceX, y: bounceY });
      // small scale pulse
      try {
        this.gfx.scale.set(1.3);
        setTimeout(() => {
          try {
            this.gfx.scale.set(1);
          } catch (e) {}
        }, 150);
      } catch (e) {}
    } catch (e) {}
    // if dead, handle death
    if (this.health <= 0) {
      this.dieAndReset();
    }
  }

  dieAndReset() {
    // simple death: play sfx, reset position and health
    try {
      if (typeof playSfx === "function") playSfx("death");
    } catch (e) {}
    // teleport to spawn
    try {
      this.Matter.Body.setPosition(this.body, {
        x: this._spawn.x,
        y: this._spawn.y,
      });
      this.Matter.Body.setVelocity(this.body, { x: 0, y: 0 });
    } catch (e) {}
    // reset health
    this.health = this.maxHealth;
    this._invulnerable = true;
    setTimeout(() => {
      this._invulnerable = false;
    }, 500);
    // small reset animation pulse
    try {
      this.gfx.scale.set(1.2);
      setTimeout(() => {
        try {
          this.gfx.scale.set(1);
        } catch (e) {}
      }, 150);
    } catch (e) {}
  }

  detachCollisionHandlers() {
    if (!this._engine) return;
    try {
      this.Matter.Events.off(
        this._engine,
        "collisionStart",
        this._collisionStart
      );
      this.Matter.Events.off(
        this._engine,
        "collisionActive",
        this._collisionActive
      );
      this.Matter.Events.off(this._engine, "collisionEnd", this._collisionEnd);
    } catch (e) {}
    this._collisionStart = null;
    this._collisionActive = null;
    this._collisionEnd = null;
    this._engine = null;
    this._supporting = new Set();
    this.isGrounded = false;
  }

  updateGraphics() {
    if (!this.gfx || !this.body) return;

    this.gfx.x = this.body.position.x;
    this.gfx.y = this.body.position.y;
    this.gfx.rotation = 0; // keep sprite upright
    // Animation: squash/stretch based on state
    let scaleX = 1,
      scaleY = 1,
      rotation = 0;
    if (this.state === "jump") {
      if (this.jumpAnim > 0) {
        scaleY = 0.7 + 0.6 * Math.abs(Math.sin(this.jumpAnim * Math.PI));
        scaleX = 1.2 - 0.2 * Math.abs(Math.sin(this.jumpAnim * Math.PI));
        rotation = this.lastDirection > 0 ? -10 : this.lastDirection < 0 ? 10 : 0;
        this.jumpAnim -= 0.013;
        if (this.isGrounded) {
          this.state = "idle";
          this.jumpAnim = 0;
        }
      }
    } else if (this.state === "moveRight") {
      scaleY = 0.9;
      scaleX = 1.15;
      rotation = 10;
    } else if (this.state === "moveLeft") {
      scaleY = 0.9;
      scaleX = 1.15;
      rotation = -10;
    } else {
      scaleX = 1;
      scaleY = 1;
    }
    this.gfx.scale.x = scaleX;
    this.gfx.scale.y = scaleY;
    this.gfx.rotation = rotation; // keep upright
  }

  // Prefer using a world/container as the camera target. Call this each frame from your game loop.
  // worldContainer: a PIXI.Container that holds all world sprites (player, ground, items)
  // levelWidth/levelHeight: total world dimensions
  // screenWidth/screenHeight: current viewport size (app.view.width/height)
  // smooth: 0..1 lerp factor (higher = snappier)
  updateCamera(
    worldContainer,
    levelWidth,
    levelHeight,
    screenWidth,
    screenHeight,
    smooth = 0.12,
    opts = {}
  ) {
    if (!this.body || !worldContainer) return;

    // If level is smaller than screen, just center the world
    const halfW = screenWidth / 2;
    const halfH = screenHeight / 2;

    // Compute the unclamped target in world coordinates (we want the camera centered slightly above the player)
    let targetX = this.body.position.x;
    // support offset in pixels (opts.offsetY) or as fraction of screen height (opts.offsetFactor)
    let offset = 0;
    if (opts && typeof opts.offsetY === "number") offset = opts.offsetY;
    else if (opts && typeof opts.offsetFactor === "number")
      offset = opts.offsetFactor * screenHeight;
    let targetY = this.body.position.y - offset;

    // Clamp so camera doesn't show beyond level bounds
    if (levelWidth > screenWidth) {
      targetX = Math.min(Math.max(targetX, halfW), levelWidth - halfW);
    } else {
      targetX = levelWidth / 2;
    }
    if (levelHeight > screenHeight) {
      targetY = Math.min(Math.max(targetY, halfH), levelHeight - halfH);
    } else {
      targetY = levelHeight / 2;
    }

    // No ground-based clamping here; keep camera clamping limited to level bounds.

    // Smoothly move the world container pivot toward the target.
    // Using pivot + position keeps the viewport centered at (screenWidth/2, screenHeight/2)
    worldContainer.pivot.x = worldContainer.pivot.x || 0;
    worldContainer.pivot.y = worldContainer.pivot.y || 0;

    worldContainer.pivot.x += (targetX - worldContainer.pivot.x) * smooth;
    worldContainer.pivot.y += (targetY - worldContainer.pivot.y) * smooth;

    worldContainer.position.x = Math.round(screenWidth / 2);
    worldContainer.position.y = Math.round(screenHeight / 2);
  }
}
