// SpikesBase: Phaser spike obstacle, supports custom shapes
export default class SpikesBase {
  constructor(scene, x, y, w, h, opts = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.opts = opts;
    // Draw spike shape (default: triangle teeth)
    this.gfx = this.drawShape(scene, x, y, w, h, opts);
    this.gfx.setDepth(typeof opts.depth === 'number' ? opts.depth : -1);
    // Create invisible hitbox for collisions
    this.hitbox = scene.add.rectangle(x, y, w, h, 0x000000, 0);
    scene.physics.add.existing(this.hitbox, true);
    this.hitbox.isObstacle = true;
    this.hitbox.damage = opts.damage || 1;
  }

  drawShape(scene, x, y, w, h, opts) {
    // Override this for custom shapes
    const color = opts.color || 0xff3333;
    const toothCount = Math.max(1, Math.round(w / 24));
    const toothW = w / toothCount;
    const g = scene.add.graphics({ fillStyle: { color } });
    for (let i = 0; i < toothCount; i++) {
      const tx = -w / 2 + i * toothW + toothW / 2;
      g.fillPoints([
        { x: tx - toothW / 2, y: h / 2 },
        { x: tx + toothW / 2, y: h / 2 },
        { x: tx, y: -h / 2 }
      ], true);
    }
    g.x = x;
    g.y = y;
    return g;
  }

  destroy() {
    try { this.gfx.destroy(); } catch (e) {}
    try { this.hitbox.destroy(); } catch (e) {}
  }
}
