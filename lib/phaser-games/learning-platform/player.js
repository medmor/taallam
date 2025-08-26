// Phaser Player wrapper: encapsulates sprite, physics, movement, and state
import colors from "./helpers/colors.js";
import { GameEvents } from "./helpers/events.js";
import Inventory from "./inventory.js";

export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x = 100, y = 100, options = {}) {
    super(scene, x, y, options);

    this.spawnX = x;
    this.spawnY = y;

    this._initPlayer(options);

    this.maxXvelocity = 400;
    this.maxYvelocity = 600;
    this.jumpCount = 0;
    this.maxJumps = 2;

    this.cursors = scene.input.keyboard.createCursorKeys();
    // Add space key for jump
    this.spaceKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this._lastMove = 0;
    this._prevUpDown = false;
    this._prevGround = false;
    this._animState = "idle";
    this._jumpAnim = 0;
    // Health system
    this.health = options.health || 10;
    this.maxHealth = options.maxHealth || this.health;

    // Initialize inventory
    this.inventory = new Inventory(scene);
  }

  addItemToInventory(item) {
    this.inventory.addItem(item);
  }

  removeItemFromInventory(item) {
    this.inventory.removeItem(item);
  }

  getInventoryItems() {
    return this.inventory.getItems();
  }

  _initPlayer(options) {
    const diameter = options.diameter || 40;
    const radius = Math.floor(diameter / 2);
    const g = this.scene.add.graphics();
    g.fillStyle(colors.player, 1);
    g.fillCircle(radius, radius, radius);
    const texKey = "player-circle-" + Phaser.Math.RND.uuid();
    g.generateTexture(texKey, diameter, diameter);

    g.destroy();

    this.setTexture(texKey);

    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);

    this.body.setCircle(radius);
    this.body.setCollideWorldBounds(true);

    this.body.setDrag(10000, 0);

    try {
      scene.sys.events.emit(
        GameEvents.PLAYER_HEALTH_CHANGED,
        this.health,
        this.maxHealth
      );
    } catch (e) {}
  }

  update() {
    const cursors = this.cursors;
    const groundedNow = this._isGrounded();

    // Horizontal: use acceleration
    if (cursors.left.isDown) {
      const accel = groundedNow ? -3000 : -800;
      this.body.setAccelerationX(accel);
      this._lastMove = -1;
      this.setFlipX(true);
      if (groundedNow) this._animState = "moveLeft";
    } else if (cursors.right.isDown) {
      const accel = this.body.blocked.down ? 3000 : 800;
      this.body.setAccelerationX(accel);
      this._lastMove = 1;
      this.setFlipX(false);
      if (groundedNow) this._animState = "moveRight";
    } else if (groundedNow) {
      this.body.setAccelerationX(0);
      this._animState = "idle";
    }

    const jumpPressed = cursors.up.isDown || this.spaceKey.isDown;
    if (jumpPressed && !this._prevJumpDown) {
      const did = this.doJump();
      if (did) {
        this._animState = "jump";
        this._jumpAnim = 1;
        try {
          this.scene.sys.events.emit(GameEvents.PLAYER_JUMP);
        } catch (e) {}
      }
    }

    //this._animateBody(groundedNow);

    this._prevJumpDown = jumpPressed;
    this._prevGround = groundedNow;

    this._clampVelocity();
  }

  doJump() {
    const jumpVelocity = -1500;
    if (this.jumpCount < this.maxJumps) {
      this.body.setVelocityY(jumpVelocity);
      this.jumpCount++;
      this.scene.sound.play("jump");
      return true;
    }
    return false;
  }

  takeDamage(amount = 1) {
    if (typeof amount !== "number" || amount <= 0) return;
    this.health = Math.max(0, this.health - amount);
    try {
      this.scene.sound.play("hit");
    } catch (e) {}
    this._emitHealth();
    if (this.health <= 0) {
      try {
        this.scene.sound.play("lose");
      } catch (e) {}
      // reset to spawn
      this.reset(this.spawnX, this.spawnY);
      // ensure UI sees full health after reset
      this._emitHealth();
    }
  }

  _emitHealth() {
    try {
      this.scene.sys.events.emit(
        GameEvents.PLAYER_HEALTH_CHANGED,
        this.health,
        this.maxHealth
      );
    } catch (e) {}
  }

  _animateBody(groundedNow) {
    if (this._animState === "jump" && this._jumpAnim > 0) {
      const t = this._jumpAnim;
      const scaleY = 0.7 + 0.6 * Math.abs(Math.sin(t * Math.PI));
      const scaleX = 1.2 - 0.2 * Math.abs(Math.sin(t * Math.PI));
      this.setScale(scaleX, scaleY);
      this.setRotation(
        this._lastMove > 0 ? -0.18 : this._lastMove < 0 ? 0.18 : 0
      );
      if (groundedNow && !(this._jumpAnim == t)) {
        this._jumpAnim = 0;
        this._animState = "idle";
        this.setScale(1, 1);
        this.setRotation(0);
      }
      this._jumpAnim -= 0.012;
    } else if (this._animState === "moveRight") {
      this.setScale(1.15, 0.9);
      this.setRotation(0.12);
    } else if (this._animState === "moveLeft") {
      this.setScale(1.15, 0.9);
      this.setRotation(-0.12);
    } else {
      this.setScale(1, 1);
      this.setRotation(0);
    }
  }

  reset(x = 100, y = 100) {
    try {
      this.setPosition(x, y);
      this.setVelocity(0, 0);
      this.clearTint();
    } catch (e) {}
    this.health = this.maxHealth;
    this._emitHealth();
  }

  destroy() {
    try {
      this.destroy();
    } catch (e) {}
  }

  _isGrounded() {
    return this.body.blocked.down;
  }

  _clampVelocity(groundedNow) {
    if (groundedNow) {
      if (Math.abs(this.body.velocity.x) > this.maxXvelocity) {
        this.body.setVelocityX(
          Math.sign(this.body.velocity.x) * this.maxXvelocity
        );
      }
    } else {
      if (Math.abs(this.body.velocity.x) > this.maxXvelocity/2) {
        this.body.setVelocityX(
          Math.sign(this.body.velocity.x) * this.maxXvelocity/2
        );
      }
    }
    if (Math.abs(this.body.velocity.y) > this.maxYvelocity) {
      this.body.setVelocityY(
        Math.sign(this.body.velocity.y) * this.maxYvelocity
      );
    }
  }
}
