import CollectableBase from "./collectibleBase.js";

export default class Coin extends CollectableBase {
  constructor(scene, x, y, options = {}) {
    super(scene, x, y, options);

    // Set coin-specific properties
    this.value = options.value || 10;
  }

  _drawShape(scene, options) {
    // Create a temporary graphics object
    const graphics = scene.add.graphics();
    // Default shape: circle
    const color = options.color || 0xffff00; // Default yellow
    const radius = options.radius || 10;
    graphics.fillStyle(color, 1);
    graphics.fillCircle(radius, radius, radius); // Draw circle centered at (radius, radius)

    const detailRadius = radius * 0.5;
    graphics.fillStyle(0xffe066, 1); // Lighter gold
    graphics.fillCircle(radius, radius, detailRadius);

    // Generate a texture from the graphics
    const textureKey = `collectable-${Phaser.Math.RND.uuid()}`;
    graphics.generateTexture(textureKey, radius * 2, radius * 2); // Texture size matches the circle
    graphics.destroy();

    return textureKey;
  }

  collect() {
    // Add the coin to the player's inventory
    this.scene.player.addItemToInventory({ type: "coin", value: this.value });

    // Play a sound effect
    try {
      this.scene.sound.play("coinCollect");
    } catch (e) {
      console.error("Failed to play coin collect sound", e);
    }

    // Call the base class collect method
    super.collect();
  }
}
