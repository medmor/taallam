import colors from "../helpers/colors.js";

export default class PlatformBase {
  constructor(scene, x, y, w, h, opts = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.opts = opts;
    // Phaser rectangles use center origin by default — place at (x,y) which matches Pixi/Matter center coords
    const fillColor = opts.color === "ground" ? colors.ground : colors.platform;
    this.gfx = scene.add.rectangle(x, y, w, h, fillColor);
    scene.physics.add.existing(this.gfx, true);
    this.body = this.gfx.body;
  }

  destroy() {
    try {
      this.gfx.destroy();
    } catch (e) {}
  }
}
