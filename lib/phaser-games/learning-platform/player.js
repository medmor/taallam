// Phaser Player wrapper: encapsulates sprite, physics, movement, and state
import colors from "./colors.js";

export default class Player {
  constructor(scene, x = 100, y = 100, options = {}) {
    this.scene = scene;
    // draw player as a circle using Graphics, generate a texture and create a sprite from it
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


    }

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
          this.scene &&
            this.scene.sys &&
            this.scene.sys.events &&
            this.scene.sys.events.emit &&
            this.scene.sys.events.emit("playerJump");
        } catch (e) {}
      }
    }
    
    if (this._animState === "jump" && this._jumpAnim > 0) {
      const t = this._jumpAnim;
      const scaleY = 0.7 + 0.6 * Math.abs(Math.sin(t * Math.PI));
      const scaleX = 1.2 - 0.2 * Math.abs(Math.sin(t * Math.PI));
      this.sprite.setScale(scaleX, scaleY);
      // this.sprite.setRotation(
      //   this._lastMove > 0 ? -0.18 : this._lastMove < 0 ? 0.18 : 0
      // );
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
    this._prevJumpDown = jumpPressed;
    this._prevGround = groundedNow;
  }

  doJump() {
    if (!this.sprite) return false;
    if (this.sprite.body.blocked.down || this.sprite.jumpCount === 0) {
      this.sprite.setVelocityY(-420);
      this.sprite.jumpCount = 1;
      return true;
    } else if (this.sprite.jumpCount < this.sprite.maxJumps) {
      this.sprite.setVelocityY(-380);
      this.sprite.jumpCount++;
      return true;
    }
    return false;
  }

  reset(x = 100, y = 100) {
    try {
      this.sprite.setPosition(x, y);
      this.sprite.setVelocity(0, 0);
      this.sprite.clearTint();
    } catch (e) {}
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
