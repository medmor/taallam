export default class CollectableBase {
  constructor(scene, x, y, options = {}) {
    this.scene = scene;

    const textureKey = this._drawShape(scene, options);

    // Create the sprite using the generated texture
    this.sprite = scene.add.sprite(x, y, textureKey);


    // Optional custom properties
    this.value = options.value || 1;
  }

  _drawShape(graphics, options) {
    // Default shape: circle
    const color = options.color || 0xffff00; // Default yellow
    const radius = options.radius || 10;
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, radius);
  }

  collect() {
    // Emit an event when collected
    this.scene.sys.events.emit("collectableCollected", this);

    // Destroy the sprite
    this.sprite.destroy();
  }
}
