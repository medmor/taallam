export default class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.healthContainer = null;
    this.healthBar = null;
    this.currentHealth = 0;
    this.maxHealth = 1;
    this._onPlayerHealthChanged = this._onPlayerHealthChanged.bind(this);
    this._onGamePaused = this._onGamePaused.bind(this);
    this._onSoundMutedChanged = this._onSoundMutedChanged.bind(this);
    this._create();
    try {
      this.scene &&
        this.scene.sys &&
        this.scene.sys.events &&
        this.scene.sys.events.on &&
        this.scene.sys.events.on(
          "playerHealthChanged",
          this._onPlayerHealthChanged,
          this
        );
      this.scene &&
        this.scene.sys &&
        this.scene.sys.events &&
        this.scene.sys.events.on &&
        this.scene.sys.events.on("gamePaused", this._onGamePaused, this);
      this.scene &&
        this.scene.sys &&
        this.scene.sys.events &&
        this.scene.sys.events.on &&
        this.scene.sys.events.on(
          "soundMutedChanged",
          this._onSoundMutedChanged,
          this
        );
    } catch (e) {}
  }

  _create() {
    const scene = this.scene;
    const camW =
      scene.cameras && scene.cameras.main ? scene.cameras.main.width : 800;
    const right = camW - 16; // 16px margin from right edge
    const x = right - 160; // left anchor for the HUD block
    const y = 16;
    const w = 140;
    const h = 18;
    // compute container center and left for the inner bar
    const containerCenterX = x + w / 2;
    const containerCenterY = y + h / 2;
    const barLeft = x + 2; // small padding inside container
    const barHeight = Math.max(0, h - 4);
    const barWidth = Math.max(0, w - 4);
    this._barWidth = barWidth;
    this.healthContainer = scene.add
      .rectangle(containerCenterX, containerCenterY, w, h, 0x222222)
      .setScrollFactor(0)
      .setDepth(1000)
      .setOrigin(0.5);
    this.healthBar = scene.add
      .rectangle(barLeft, containerCenterY, barWidth, barHeight, 0x00ff00)
      .setScrollFactor(0)
      .setDepth(1001)
      .setOrigin(0, 0.5);
    // no text label — keep only the visual bar
    // add pause and sound toggle buttons anchored to the right edge so they remain visible
    try {
      const btnSize = 22; // slightly larger for visibility
      const gap = 8;
      const camWidth = camW;
      // anchor sound button to right margin
      const soundX = camWidth - 16 - btnSize / 2;
      const btnY = containerCenterY;
      // place pause button to the left of sound button
      const pauseX = soundX - (btnSize + gap);
      // move container left if it would overlap buttons
      const containerRight = pauseX - gap;
      const containerLeft = containerRight - w;
      const adjustedCenterX = containerLeft + w / 2;
      // reposition container and bar accordingly
      this.healthContainer.setPosition(adjustedCenterX-10, containerCenterY);
      this.healthBar.setPosition(containerLeft -8, containerCenterY);

      this.pauseBtn = scene.add
        .rectangle(pauseX, btnY, btnSize, btnSize, 0x444444)
        .setScrollFactor(0)
        .setDepth(1100)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      this.pauseIcon = scene.add
        .text(pauseX, btnY, "⏸", { fontSize: "14px", color: "#fff" })
        .setScrollFactor(0)
        .setDepth(1101)
        .setOrigin(0.5);
      this.soundBtn = scene.add
        .rectangle(soundX, btnY, btnSize, btnSize, 0x444444)
        .setScrollFactor(0)
        .setDepth(1100)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      this.soundIcon = scene.add
        .text(soundX, btnY, "🔊", { fontSize: "14px", color: "#fff" })
        .setScrollFactor(0)
        .setDepth(1101)
        .setOrigin(0.5);

      // interactions: emit UI events; game will handle actual state changes and emit back
      this.pauseBtn.on("pointerdown", () => {
        try {
          this.scene &&
            this.scene.sys &&
            this.scene.sys.events &&
            this.scene.sys.events.emit &&
            this.scene.sys.events.emit("ui:togglePause");
        } catch (e) {}
      });
      this.soundBtn.on("pointerdown", () => {
        try {
          this.scene &&
            this.scene.sys &&
            this.scene.sys.events &&
            this.scene.sys.events.emit &&
            this.scene.sys.events.emit("ui:toggleSound");
        } catch (e) {}
      });
    } catch (e) {}
  }

  _onGamePaused(isPaused) {
    this._isPaused = !!isPaused;
    try {
      if (this._isPaused) {
        this.pauseBtn && (this.pauseBtn.fillColor = 0x666666);
        this.pauseIcon && this.pauseIcon.setText("▶");
      } else {
        this.pauseBtn && (this.pauseBtn.fillColor = 0x444444);
        this.pauseIcon && this.pauseIcon.setText("⏸");
      }
    } catch (e) {}
  }

  _onSoundMutedChanged(isMuted) {
    this._isMuted = !!isMuted;
    try {
      if (this._isMuted) {
        this.soundBtn && (this.soundBtn.fillColor = 0x666666);
        this.soundIcon && this.soundIcon.setText("🔇");
      } else {
        this.soundBtn && (this.soundBtn.fillColor = 0x444444);
        this.soundIcon && this.soundIcon.setText("🔊");
      }
    } catch (e) {}
  }

  _onPlayerHealthChanged(health, maxHealth) {
    this.currentHealth =
      typeof health === "number" ? health : this.currentHealth;
    this.maxHealth =
      typeof maxHealth === "number"
        ? maxHealth
        : this.maxHealth || this.currentHealth || 1;
    this._renderHealth();
  }

  _renderHealth() {
    if (!this.healthBar || !this.healthContainer) return;
    const pct = Math.max(
      0,
      Math.min(1, this.currentHealth / Math.max(1, this.maxHealth))
    );
    const newWidth = Math.max(1, Math.round(this._barWidth * pct));
    try {
      // keep bar anchored to left; only change width
      this.healthBar.width = newWidth;
      // interpolate color from green (full) to red (empty)
      const green = Math.round(255 * pct);
      const red = Math.round(255 * (1 - pct));
      const color = (red << 16) | (green << 8);
      this.healthBar.fillColor = color;
      // only visual update; no textual indicator
    } catch (e) {}
  }

  destroy() {
    try {
      this.healthBar && this.healthBar.destroy();
    } catch (e) {}
    try {
      this.healthContainer && this.healthContainer.destroy();
    } catch (e) {}
    try {
      this.pauseBtn && this.pauseBtn.destroy();
    } catch (e) {}
    try {
      this.pauseIcon && this.pauseIcon.destroy();
    } catch (e) {}
    try {
      this.soundBtn && this.soundBtn.destroy();
    } catch (e) {}
    try {
      this.soundIcon && this.soundIcon.destroy();
    } catch (e) {}
    try {
      this.scene &&
        this.scene.sys &&
        this.scene.sys.events &&
        this.scene.sys.events.off &&
        this.scene.sys.events.off(
          "playerHealthChanged",
          this._onPlayerHealthChanged
        );
    } catch (e) {}
    try {
      this.scene &&
        this.scene.sys &&
        this.scene.sys.events &&
        this.scene.sys.events.off &&
        this.scene.sys.events.off("gamePaused", this._onGamePaused, this);
    } catch (e) {}
    try {
      this.scene &&
        this.scene.sys &&
        this.scene.sys.events &&
        this.scene.sys.events.off &&
        this.scene.sys.events.off(
          "soundMutedChanged",
          this._onSoundMutedChanged,
          this
        );
    } catch (e) {}
  }
}
