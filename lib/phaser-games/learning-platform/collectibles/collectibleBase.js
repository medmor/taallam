export default class CollectableBase extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, options = {}) {
    // Draw shape to a graphics object and generate a texture key
    super(scene, x, y);
    this.textureKey = this._drawShape( options);
    this.setTexture(this.textureKey);
    // Call Phaser.Sprite constructor

    // Add to scene
    scene.add.existing(this);

    // Optional custom properties
    this.type = options.type || 'coin';
    this.value = options.value || 1;
  }

  _drawShape( options) {
    //to be overriden in derived classes
    console.log('You need to implement the _drawShape method in your collectible class');
  }

  collect() {
    this.destroy();
  }
}