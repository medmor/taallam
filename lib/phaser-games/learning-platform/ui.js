export default class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.collected = [];
    this.target = null;
    this.text = null;
    this.winText = null;
    this.create();
  }

  create() {
    const scene = this.scene;
    this.text = scene.add.text(16, 16, 'Collected: ', { fontSize: '18px', color: '#000' }).setScrollFactor(0).setDepth(1000);
  }

  setTargetSequence(seq = []) {
    this.target = seq;
    this.updateText();
  }

  addCollected(letter) {
    this.collected.push(letter || '?');
    this.updateText();
  }

  wrong() {
    // flash red
    if (!this.winText) {
      const scene = this.scene;
      const t = scene.add.text(scene.cameras.main.centerX, 80, 'Wrong order!', { fontSize: '22px', color: '#fff', backgroundColor: '#c00' }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
      scene.time.delayedCall(700, () => { try { t.destroy(); } catch (e) {} });
    }
  }

  updateText() {
    const mask = this.target ? this.target.map((_,i)=> this.collected[i] || '_').join('') : this.collected.join('');
    try { this.text.setText('Collected: ' + mask); } catch (e) {}
  }

  showWin() {
    const scene = this.scene;
    if (!this.winText) {
      this.winText = scene.add.text(scene.cameras.main.centerX, scene.cameras.main.centerY, 'Level Complete!', { fontSize: '28px', color: '#fff', backgroundColor: '#28a745' }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    }
  }

  destroy() {
    try { this.text && this.text.destroy(); } catch (e) {}
    try { this.winText && this.winText.destroy(); } catch (e) {}
  }
}
