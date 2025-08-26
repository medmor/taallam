import { GameEvents } from "./helpers/events.js";
import colors from "./helpers/colors.js";

// Minimal Phaser game wrapper to mirror the Pixi Game API surface used by PlatformerPixi
export default class Game {
  constructor(container) {
    this.container = container;
    this.game = null;
    this._ready = false;
  }

  // ────────────────────────────────
  // Dependencies & Initialization
  // ────────────────────────────────

  async loadDependencies() {
    if (!this.Phaser) {
      const ph = await import("phaser"); // dynamic import to avoid bundling issues
      this.Phaser = ph.default || ph;
    }
  }

  async init(opts = {}) {
    const Phaser = this.Phaser;
    if (!Phaser) throw new Error("Phaser not loaded");

    this._initOpts = opts;
    const self = this;

    const config = {
      type: Phaser.AUTO,
      parent: this.container,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        fullscreenTarget: this.container,
      },
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 2000 }, debug: false },
      },
      scene: {
        preload() { self.preload(this); },
        create() { self.create(this); },
        update(time, delta) { self.update(this, time, delta); },
      },
    };

    this.game = new Phaser.Game(config);
    this._ready = true;
  }

  async destroy() {
    if (this.game) {
      try { this.game.destroy(true); } catch (e) {}
      this.game = null;
    }
    this._ready = false;
  }

  // ────────────────────────────────
  // Asset Loading
  // ────────────────────────────────

  preload(scene) {
    // Level JSON
    scene.load.json("level1", "/learning-platformer/levels/level1.json");

    // Sounds
      scene.load.audio("jump", "/sounds/effects/jump.mp3");
      scene.load.audio("hit", "/sounds/effects/wrong.mp3");
      scene.load.audio("lose", "/sounds/effects/wrong.mp3");
      scene.load.audio("theme", "/sounds/loops/loop1.mp3");

      // Draw a spike shape, generate texture, and destroy the graphic
      const spikeGraphics = scene.add.graphics();
      spikeGraphics.fillStyle(colors['danger'], 1);
      spikeGraphics.beginPath();
      spikeGraphics.moveTo(0, 30);   // left base
      spikeGraphics.lineTo(10, 0);   // tip
      spikeGraphics.lineTo(20, 30);  // right base
      spikeGraphics.closePath();
      spikeGraphics.fillPath();
      spikeGraphics.generateTexture("spike", 20, 30);
      spikeGraphics.destroy();
  }

  // ────────────────────────────────
  // Scene Creation
  // ────────────────────────────────

  async create(scene) {

    const lvl = scene.cache.json.get("level1");

    // Load classes dynamically (lazy imports)
    const [PlayerClass, UIClass, PlatformBase, Coin] = await Promise.all([
      (await import("./player.js")).default,
      (await import("./ui.js")).default,
      (await import("./platforms/platformBase.js")).default,
      (await import("./collectibles/coin.js")).default,
    ]);

    // World setup
    const { worldW, worldH } = this._setupWorld(scene, lvl);

    // Groups
    const platforms = scene.physics.add.staticGroup();
    const spikes = scene.physics.add.staticGroup();
    const collectibles = scene.physics.add.group({ allowGravity: false });

    // Build level
    await this._parseLevelObjects(scene, lvl, { platforms, spikes, collectibles });

    // Player
    this._setupPlayer(scene, PlayerClass, lvl);

    // Camera
    this._setupCamera(scene, worldW, worldH);

    // UI
    this.ui = new UIClass(scene);
    this._setupUIEvents(scene);

    // Music
    this._startThemeMusic(scene);

    // Collisions
    this._setupCollisions(scene, { platforms, spikes, collectibles });
  }

  // ────────────────────────────────
  // Update Loop
  // ────────────────────────────────

  update(scene, time, delta) {
    if (typeof scene === "number") { // compatibility with Phaser callback
      delta = time;
      time = scene;
      scene = this;
    }

    if (!this.playerObj) return;

    if (!this._paused && typeof this.playerObj.update === "function") {
      try { this.playerObj.update(); } catch (e) {}
    }

    this._updateCamera(scene);
    //this._clampPlayerVelocity();
  }

  // ────────────────────────────────
  // Helpers (Events, World, Player, Camera, Collisions, etc.)
  // ────────────────────────────────



  _setupWorld(scene, lvl) {
    const worldW = (lvl && lvl.width) || 1600;
    const worldH = (lvl && lvl.height) || 1000;

    // Background gradient
    const bgGraphics = scene.add.graphics();
    const topColor = 0x87ceeb, bottomColor = 0xf0f8ff;
    for (let y = 0; y < worldH; y += 2) {
      const t = y / worldH;
      const r = Math.round((1 - t) * ((topColor >> 16) & 0xff) + t * ((bottomColor >> 16) & 0xff));
      const g = Math.round((1 - t) * ((topColor >> 8) & 0xff) + t * ((bottomColor >> 8) & 0xff));
      const b = Math.round((1 - t) * (topColor & 0xff) + t * (bottomColor & 0xff));
      bgGraphics.fillStyle((r << 16) | (g << 8) | b, 1);
      bgGraphics.fillRect(0, y, worldW, 2);
    }
    bgGraphics.setDepth(-100);

    return { worldW, worldH };
  }

  async _parseLevelObjects(scene, lvl, { platforms, spikes, collectibles }) {
    if (!lvl || !lvl.objects) return;
    const PlatformBase = (await import("./platforms/platformBase.js")).default;
    const { default: SpikesBase } = await import("./enemies/spikes/SpikesBase.js");
    const Coin = (await import("./collectibles/coin.js")).default;

    for (const obj of lvl.objects) {
      if (obj.type === "rect") {
        const p = new PlatformBase(scene, obj.x, obj.y, obj.w, obj.h, { color: obj.color });
        platforms.add(p.gfx);

      } else if (obj.type === "pin") {
        const spike = new SpikesBase(scene, obj.x, obj.y, obj.w, obj.h, {
          color: colors[obj.color],
          damage: obj.damage,
          depth: -1,
        });
        spikes.add(spike.hitbox);

      } else if (obj.type === "collectible") {
        const c = new Coin(scene, obj.x, obj.y, { value: obj.value });
        collectibles.add(c);
      }
    }
  }

  _setupPlayer(scene, PlayerClass, lvl) {
    const spawnX = (lvl && lvl.playerX) || 100;
    const spawnY = (lvl && lvl.playerY) || 100;

    this.playerObj = new PlayerClass(scene, spawnX, spawnY);

  }

  _setupCamera(scene, worldW, worldH) {
    scene.physics.world.setBounds(0, 0, worldW, worldH);

    if (!scene.cameras?.main) return;
    scene.cameras.main.setBounds(0, 0, worldW, worldH);

    const camYOffset = this._initOpts.cameraYOffset ?? -80;
    scene.cameras.main.startFollow(this.playerObj, true, 0.08, 0.08, 0, camYOffset);
    try { scene.cameras.main.setDeadzone(200, 120); } catch (e) {}
  }

  _setupUIEvents(scene) {
    // ───────── Pause toggle
    this._paused = false;
    this._uiTogglePauseHandler = () => {
      this._paused = !this._paused;

      // pause/resume physics
      if (scene.physics?.world) {
        if (this._paused) scene.physics.world.pause?.();
        else scene.physics.world.resume?.();
      }

    };

    // ───────── Sound toggle
    this._uiToggleSoundHandler = () => {
      const newMuted = !(scene.sound?.mute);
      if (scene.sound) scene.sound.mute = newMuted;
    };

    // ───────── Fullscreen toggle
    this._uiToggleFullscreenHandler = () => {
      if (scene.scale) {
        if (!scene.scale.isFullscreen) scene.scale.startFullscreen();
        else scene.scale.stopFullscreen();
      }
    };

    // ───────── Wire UI events
    scene.sys?.events?.on(GameEvents.GAME_PAUSED, this._uiTogglePauseHandler);
    scene.sys?.events?.on(GameEvents.SOUND_MUTED_CHANGED, this._uiToggleSoundHandler);
    scene.sys?.events?.on(GameEvents.FULLSCREEN_CHANGED, this._uiToggleFullscreenHandler);

    // ───────── Fullscreen enter/leave handling
    if (scene.scale?.on) {
      scene.scale.on("enterfullscreen", () => {
        // resize game to fullscreen dimensions
        scene.scale.resize(window.innerWidth, window.innerHeight);
        scene.sys?.events?.emit("fullscreenChanged", true);
        scene.sys?.events?.emit("resize");
      });

      scene.scale.on("leavefullscreen", () => {
        // resize back to container size
        const containerWidth = this.container?.clientWidth || 800;
        const containerHeight = this._initOpts.height || 600;
        scene.scale.resize(containerWidth, containerHeight);
        scene.sys?.events?.emit("fullscreenChanged", false);
        scene.sys?.events?.emit("resize");
      });

      scene.scale.on("resize", () => {
        console.log("scale resize event");
      });
    }

    // ───────── Emit initial sound state
    scene.sys?.events?.emit(
      "soundMutedChanged",
      !!(scene.sound && scene.sound.mute)
    );
  }

  _startThemeMusic(scene) {
    try {
      if (scene.sound && scene.cache.audio.exists("theme")) {
        const mus = scene.sound.add("theme", { loop: true, volume: 0.45 });
        mus.play();
        this._themeMusic = mus;
      }
    } catch (e) {}
  }

  _setupCollisions(scene, { platforms, spikes, collectibles }) {
    // ───────── Platform collision
    scene.physics.add.collider(this.playerObj, platforms, () => {
      // reset jump count when touching platform
      this.playerObj.jumpCount = 0;
    });

    // ───────── Spikes collision
    scene.physics.add.collider(this.playerObj, spikes, (p, s) => {
      try {
        // brief red flash
        p.setTint(0xff0000);

        // bounce upwards
        p.body.setVelocityY(-260);

        // knockback left/right depending on spike position
        const knock = p.x < s.x ? -120 : 120;
        p.body.setVelocityX(knock);

        // apply damage
        p.takeDamage?.(s.damage);

        // clear tint shortly after
        scene.time.delayedCall(220, () => p.clearTint());
      } catch (e) {}
    });

    // ───────── Collectibles overlap
    scene.physics.add.overlap(this.playerObj, collectibles, (p, c) => {
      c.collect(this.playerObj.inventory);
    });

  }


  _updateCamera(scene) {
    if (!scene.cameras?.main || !this.playerObj) return;
    const camYOffset = this._initOpts.cameraYOffset ?? -80;
    scene.cameras.main.scrollY = this.playerObj.y + camYOffset - scene.cameras.main.height / 2;
  }

}
