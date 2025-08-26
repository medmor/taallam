import Coin from "./collectibles/coin";
import { GameEvents } from "./helpers/events";
export default class UIManager {
  constructor(scene) {
    this.scene = scene;
    this.healthContainer = null;
    this.healthBar = null;
    this.currentHealth = 0;
    this.maxHealth = 1;
    this.coinText = null; // Text to display coin count
    this._onPlayerHealthChanged = this._onPlayerHealthChanged.bind(this);
    this._onGamePaused = this._onGamePaused.bind(this);
    this._onSoundMutedChanged = this._onSoundMutedChanged.bind(this);
    this._onFullscreenChanged = this._onFullscreenChanged.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onInventoryItemAdded = this._onInventoryItemAdded.bind(this);

    this._create();
    try {
      this.scene.sys.events.on(
        GameEvents.PLAYER_HEALTH_CHANGED,
        this._onPlayerHealthChanged,
        this
      );

      this.scene.sys.events.on(
        GameEvents.INVENTORY_ITEM_ADDED,
        this._onInventoryItemAdded,
        this
      );

      this.scene.sys.events.on(
        GameEvents.GAME_PAUSED,
        this._onGamePaused,
        this
      );

      this.scene.sys.events.on(
        GameEvents.SOUND_MUTED_CHANGED,
        this._onSoundMutedChanged,
        this
      );

      this.scene.sys.events.on(
        GameEvents.FULLSCREEN_CHANGED,
        this._onFullscreenChanged,
        this
      );

      this.scene.sys.events.on(GameEvents.RESIZE, this._onResize, this);
    } catch (e) {}
  }

  _create() {
    const scene = this.scene;
    const camWidth = scene.cameras?.main?.width ?? 800;

    // --- Health bar setup ---
    const margin = 16;
    const hudWidth = 140;
    const hudHeight = 18;

    // Y position for all UI elements
    const hudY = margin;

    // Button layout
    const btnSize = 22;
    const gap = 8;

    // Compute button positions from right to left
    const soundX = camWidth - margin - btnSize / 2;
    const fullscreenX = soundX - (btnSize + gap);
    const pauseX = fullscreenX - (btnSize + gap);

    const btnY = hudY + hudHeight / 2;

    // Health container aligned to the left of pause button
    const containerRight = pauseX - 2 * gap;
    const containerLeft = Math.max(margin, containerRight - hudWidth);

    const barHeight = Math.max(0, hudHeight - 4);
    const barWidth = Math.max(0, hudWidth - 4);
    this._barWidth = barWidth;

    this.healthContainer = scene.add
      .rectangle(containerLeft, btnY, hudWidth, hudHeight, 0x222222)
      .setScrollFactor(0)
      .setDepth(1000)
      .setOrigin(0, 0.5);

    this.healthBar = scene.add
      .rectangle(containerLeft + 2, btnY, barWidth, barHeight, 0x00ff00)
      .setScrollFactor(0)
      .setDepth(1001)
      .setOrigin(0, 0.5);

    // --- Helper to create buttons ---
    const createButton = (x, y, label, event, fontSize = "14px") => {
      const btn = scene.add
        .rectangle(x, y, btnSize, btnSize, 0x444444)
        .setScrollFactor(0)
        .setDepth(1100)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      const icon = scene.add
        .text(x, y, label, { fontSize, color: "#fff" })
        .setScrollFactor(0)
        .setDepth(1101)
        .setOrigin(0.5);

      btn.on("pointerdown", () => {
        this.scene?.sys?.events?.emit?.(event);
      });

      return { btn, icon };
    };

    // --- Buttons ---
    this.pauseBtn = createButton(pauseX, btnY, "⏸", GameEvents.GAME_PAUSED);
    this.soundBtn = createButton(soundX, btnY, "🔊", GameEvents.SOUND_MUTED_CHANGED);
    this.fullscreenBtn = createButton(
      fullscreenX,
      btnY,
      "FS",
      GameEvents.FULLSCREEN_CHANGED,
      "12px"
    );

    // Place coin icon to the left of the health bar
    const coinIconX = containerLeft - 24; // 24px gap before health bar
    const coinIconY = hudY + hudHeight / 2;
    this.coinIcon = new Coin(scene, coinIconX, coinIconY, { radius: 10 });
    this.coinIcon.setScrollFactor(0).setDepth(1000);

    // Place coin text info under the coin icon
    this.coinText = scene.add
      .text(coinIconX, coinIconY + 10, "0", {
        fontSize: "16px",
        color: "#000000ff",
      })
      .setScrollFactor(0)
      .setDepth(1000)
      .setOrigin(0.5, 0);
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

  _onFullscreenChanged(isFullscreen) {
    this._isFullscreen = !!isFullscreen;
    try {
      if (this._isFullscreen) {
        this.fullscreenBtn && (this.fullscreenBtn.fillColor = 0x666666);
        this.fullscreenIcon && this.fullscreenIcon.setText("X");
      } else {
        this.fullscreenBtn && (this.fullscreenBtn.fillColor = 0x444444);
        this.fullscreenIcon && this.fullscreenIcon.setText("FS");
      }
    } catch (e) {}
  }

  _onResize() {
    // recompute positions based on camera width
    try {
      if (!this.scene || !this.scene.cameras || !this.scene.cameras.main)
        return;
      const camW = this.scene.cameras.main.width;
      const btnSize = 22;
      const gap = 8;
      const soundX = camW - 16 - btnSize / 2;
      const fullscreenX = soundX - (btnSize + gap);
      const pauseX = fullscreenX - (btnSize + gap);
      const containerRight = pauseX - gap;
      const w = this.healthContainer ? this.healthContainer.width : 140;
      const containerLeft = Math.max(8, containerRight - w);
      const containerCenterX = containerLeft + w / 2;
      const containerCenterY = this.healthContainer
        ? this.healthContainer.y
        : 16 + (this.healthContainer ? this.healthContainer.height / 2 : 9);
      // reposition
      this.healthContainer &&
        this.healthContainer.setPosition(containerCenterX, containerCenterY);
      this.healthBar &&
        this.healthBar.setPosition(containerLeft + 2, containerCenterY);
      // reposition buttons/icons
      this.pauseBtn && this.pauseBtn.setPosition(pauseX, containerCenterY);
      this.pauseIcon && this.pauseIcon.setPosition(pauseX, containerCenterY);
      this.fullscreenBtn &&
        this.fullscreenBtn.setPosition(fullscreenX, containerCenterY);
      this.fullscreenIcon &&
        this.fullscreenIcon.setPosition(fullscreenX, containerCenterY);
      this.soundBtn && this.soundBtn.setPosition(soundX, containerCenterY);
      this.soundIcon && this.soundIcon.setPosition(soundX, containerCenterY);
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

  _onInventoryItemAdded(item) {
    if (item.type === "coin") {
      this._updateCoinCount(item.value);
    }
  }

  _updateCoinCount(newTotal) {
    this.coinText.setText(newTotal);
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
      this.fullscreenBtn && this.fullscreenBtn.destroy();
    } catch (e) {}
    try {
      this.fullscreenIcon && this.fullscreenIcon.destroy();
    } catch (e) {}
    try {
      this.coinText && this.coinText.destroy();
    } catch (e) {}
    try {
      this.scene.sys.events.off(
        GameEvents.PLAYER_HEALTH_CHANGED,
        this._onPlayerHealthChanged
      );
    } catch (e) {}
    try {
      this.scene.sys.events.off(
        GameEvents.GAME_PAUSED,
        this._onGamePaused,
        this
      );
    } catch (e) {}
    try {
      this.scene.sys.events.off(
        GameEvents.SOUND_MUTED_CHANGED,
        this._onSoundMutedChanged,
        this
      );
    } catch (e) {}
    try {
      this.scene.sys.events.off(
        GameEvents.FULLSCREEN_CHANGED,
        this._onFullscreenChanged,
        this
      );
    } catch (e) {}
    try {
      this.scene.sys.events.off(GameEvents.RESIZE, this._onResize, this);
    } catch (e) {}
    try {
      this.scene.sys.events.off(
        GameEvents.INVENTORY_ITEM_ADDED,
        this._onInventoryItemAdded,
        this
      );
    } catch (e) {}
  }
}
