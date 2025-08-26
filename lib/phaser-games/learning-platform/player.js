// Phaser Player wrapper: encapsulates sprite, physics, movement, and state
import colors from "./helpers/colors.js";
import { GameEvents } from "./helpers/events.js";
import Inventory from "./inventory.js";

export default class Player {
  constructor(scene, x = 100, y = 100, options = {}) {
    this.scene = scene;
    // remember spawn for reset
    this.spawnX = x;
    this.spawnY = y;

    this._initPlayer(scene, x, y, options);

    this.sprite.setCollideWorldBounds(true);

    // tuning
    this.sprite.body.setDrag(600, 0);
    this.sprite.maxXvelocity = options.maxXvelocity || 220;
    this.sprite.maxYvelocity = options.maxYvelocity || 500;
    this.sprite.jumpCount = 0;
    this.sprite.maxJumps = options.maxJumps || 2;

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

  _initPlayer(scene, x, y, options) {
    const diameter = options.diameter || 40;
    const radius = Math.floor(diameter / 2);
    const g = scene.add.graphics();
    g.fillStyle(colors.player, 1);
    g.fillCircle(radius, radius, radius);
    const texKey = "player-circle-" + Phaser.Math.RND.uuid();
    try {
      g.generateTexture(texKey, diameter, diameter);
    } catch (e) {
      // fallback: if generateTexture not available, still keep graphics as-is
    }
    // destroy the temporary graphics used for texture
    try {
      g.destroy();
    } catch (e) {}
    // create sprite with an Arcade physics body so collisions work reliably
    if (scene.textures.exists(texKey)) {
      this.sprite = scene.physics.add.sprite(x, y, texKey);
      // make the physics body circular to match the texture

      this.sprite.body.setCircle(radius);
    }
    // emit initial health so UI can pick it up (UI listens on scene events)
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
    if (!this.sprite) return;
    // Horizontal: use acceleration
    if (cursors.left.isDown) {
      const accel = groundedNow ? -2400 : -800;
      this.sprite.body.setAccelerationX(accel);
      this._lastMove = -1;
      this.sprite.setFlipX(true);
      if (groundedNow) this._animState = "moveLeft";
    } else if (cursors.right.isDown) {
      const accel = this.sprite.body.blocked.down ? 2400 : 800;
      this.sprite.body.setAccelerationX(accel);
      this._lastMove = 1;
      this.sprite.setFlipX(false);
      if (groundedNow) this._animState = "moveRight";
    } else if (groundedNow) {
      this.sprite.body.setAccelerationX(0);
      this._animState = "idle";
    }
    // Jump edge detection: trigger on up key or space just pressed
    const upDown = !!(cursors.up && cursors.up.isDown);
    const spaceDown = !!(this.spaceKey && this.spaceKey.isDown);
    const jumpPressed = upDown || spaceDown;
    // reset jump count when landing
    if (groundedNow && !this._prevGround) {
      this.sprite.jumpCount = 0;
      this._jumpAnim = 0;
      this.sprite.setScale(1, 1);
      this.sprite.setRotation(0);
    }
    if (jumpPressed && !this._prevJumpDown) {
      // just pressed
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
  }

  doJump() {
    if (!this.sprite) return false;
    if (this.sprite.body.blocked.down || this.sprite.jumpCount === 0) {
      this.sprite.setVelocityY(-420);
      this.sprite.jumpCount = 1;
      try {
        this.scene &&
          this.scene.sound &&
          this.scene.sound.play &&
          this.scene.sound.play("jump");
      } catch (e) {}
      return true;
    } else if (this.sprite.jumpCount < this.sprite.maxJumps) {
      this.sprite.setVelocityY(-380);
      this.sprite.jumpCount++;
      try {
        this.scene &&
          this.scene.sound &&
          this.scene.sound.play &&
          this.scene.sound.play("jump");
      } catch (e) {}
      return true;
    }
    return false;
  }

  takeDamage(amount = 1) {
    if (typeof amount !== "number" || amount <= 0) return;
    this.health = Math.max(0, this.health - amount);
    try {
      this.scene &&
        this.scene.sound &&
        this.scene.sound.play &&
        this.scene.sound.play("hit");
    } catch (e) {}
    this._emitHealth();
    if (this.health <= 0) {
      try {
        this.scene &&
          this.scene.sound &&
          this.scene.sound.play &&
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

  _animateBody(groundedNow){
    if (this._animState === "jump" && this._jumpAnim > 0) {
      const t = this._jumpAnim;
      const scaleY = 0.7 + 0.6 * Math.abs(Math.sin(t * Math.PI));
      const scaleX = 1.2 - 0.2 * Math.abs(Math.sin(t * Math.PI));
      this.sprite.setScale(scaleX, scaleY);
      this.sprite.setRotation(
        this._lastMove > 0 ? -0.18 : this._lastMove < 0 ? 0.18 : 0
      );
      if (groundedNow && !(this._jumpAnim == t)) {
        this._jumpAnim = 0;
        this._animState = "idle";
        this.sprite.setScale(1, 1);
        this.sprite.setRotation(0);
      }
      this._jumpAnim -= 0.012;
    } else if (this._animState === "moveRight") {
      this.sprite.setScale(1.15, 0.9);
      this.sprite.setRotation(0.12);
    } else if (this._animState === "moveLeft") {
      this.sprite.setScale(1.15, 0.9);
      this.sprite.setRotation(-0.12);
    } else {
      this.sprite.setScale(1, 1);
      this.sprite.setRotation(0);
    }
  }

  reset(x = 100, y = 100) {
    try {
      this.sprite.setPosition(x, y);
      this.sprite.setVelocity(0, 0);
      this.sprite.clearTint();
    } catch (e) {}
    this.health = this.maxHealth;
    this._emitHealth();
  }

  destroy() {
    try {
      this.sprite.destroy();
    } catch (e) {}
    this.sprite = null;
  }

  _isGrounded() {
    return (
      this.sprite.body &&
      this.sprite.body.blocked &&
      this.sprite.body.blocked.down
    );
  }
}
