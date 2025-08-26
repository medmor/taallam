import { GameEvents } from "../helpers/events.js";
import CollectableBase from "./collectibleBase.js";

export default class Coin extends CollectableBase {
  constructor(scene, x, y) {
    super(scene, x, y, { type: "coin", value: 1 });
  }

  _drawShape(options) {
    // Create a temporary graphics object
    const graphics = this.scene.add.graphics();
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

  collect(inventory) {
    inventory.addItem(this);
    const sum = inventory
      .getItems()
      .filter((item) => item.type === "coin")
      .reduce((acc, item) => acc + item.value, 0);
    this.scene.sys.events.emit(GameEvents.INVENTORY_ITEM_ADDED, {
      type: "coin",
      value: sum ,
    });
    super.collect();
  }
}
