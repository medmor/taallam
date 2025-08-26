export default class CollectableBase extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, options = {}) {
    super(scene, x, y);
    this.textureKey = this._drawShape( options);
    this.setTexture(this.textureKey);

    scene.add.existing(this);

    this.type = options.type || 'coin';
    this.value = options.value || 1;
  }

  _drawShape( options) {
    console.log('You need to implement the _drawShape method in your collectible class');
  }

  collect() {
    this.destroy();
  }
}