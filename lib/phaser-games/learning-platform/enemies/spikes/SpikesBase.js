// SpikesBase: Phaser spike obstacle, supports custom shapes
export default class SpikesBase extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, w, h, opts = {}) {
    super(scene, x, y);

    this.w = w;
    this.h = h;
    this.opts = opts;

    this.hitbox = scene.add.tileSprite(x, y, w , h , opts.texture || 'spike');

    scene.physics.add.existing(this.hitbox, true);
    this.hitbox.damage = opts.damage || 1;
  }

  destroy() {
    try { this.gfx.destroy(); } catch (e) {}
    try { this.hitbox.destroy(); } catch (e) {}
  }
}
