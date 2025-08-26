// Minimal Phaser game wrapper to mirror the Pixi Game API surface used by PlatformerPixi
export default class Game {
  constructor(container) {
    this.container = container;
    this.game = null;
    this._ready = false;
  }

  async loadDependencies() {
    // Dynamic import of phaser to avoid bundling issues
    if (!this.Phaser) {
      const ph = await import("phaser");
      this.Phaser = ph.default || ph;
    }
    return Promise.resolve();
  }

  async init(opts = {}) {
    const Phaser = this.Phaser;
    if (!Phaser) throw new Error("Phaser not loaded");
    const width = opts.width || 800;
    const height = opts.height || 600;
    // keep init options for later (camera offset, tuning)
    this._initOpts = opts || {};

    const self = this;
    const config = {
      type: Phaser.AUTO,
      width,
      height,
      parent: this.container,
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 800 }, debug: false },
      },
      scene: {
        preload: function () {
          self.preload(this);
        },
        create: function () {
          self.create(this);
        },
        update: function (time, delta) {
          self.update(this, time, delta);
        },
      },
    };

    this.game = new Phaser.Game(config);
    this._ready = true;
    return Promise.resolve();
  }

  preload(scene) {
    scene = scene || this;
    // load level JSON used by Pixi version
    scene.load.json("level1", "/learning-platformer/levels/level1.json");
    // preload sounds used by the Phaser version
    try {
      scene.load.audio('jump', '/sounds/effects/jump.mp3');
      scene.load.audio('hit', '/sounds/effects/wrong.mp3');
      scene.load.audio('lose', '/sounds/effects/wrong.mp3');
      scene.load.audio('theme', '/sounds/loops/loop1.mp3');
    } catch (e) {}
    // minimal placeholder assets if needed
  }

  async create(scene) {
    scene = scene || this;
    // simple internal event handlers
    this._callbacks = {};
    this.on = (ev, cb) => {
      this._callbacks[ev] = this._callbacks[ev] || [];
      this._callbacks[ev].push(cb);
    };
    this._emit = (ev, ...args) => {
      (this._callbacks[ev] || []).forEach((cb) => {
        try {
          cb(...args);
        } catch (e) {}
      });
    };
    const lvl = scene.cache.json.get("level1");
    // import modular classes (lazy to avoid bundling issues)
    // NOTE: do not swallow import errors — fail fast if a required module is missing.
    const [pMod, uMod, platMod] = await Promise.all([
      import("./player.js"),
      import("./ui.js"),
      import("./platforms/platformBase.js"),
    ]);
    const PlayerClass = pMod && (pMod.default || pMod);
    const UIClass = uMod && (uMod.default || uMod);
    const PlatformBase = platMod && (platMod.default || platMod);

    
    // Use world size from level JSON (default 1600x1000)
    const worldW = (lvl && lvl.width) ? lvl.width : 1600;
    const worldH = (lvl && lvl.height) ? lvl.height : 1000;
    // Draw a vertical sky gradient background (lighter at the bottom)
    const bgGraphics = scene.add.graphics();
    const topColor = 0x87ceeb; // sky blue
    const bottomColor = 0xf0f8ff; // very light blue/white
    for (let y = 0; y < worldH; y += 2) {
      const t = y / worldH;
      const r = Math.round((1 - t) * ((topColor >> 16) & 0xff) + t * ((bottomColor >> 16) & 0xff));
      const g = Math.round((1 - t) * ((topColor >> 8) & 0xff) + t * ((bottomColor >> 8) & 0xff));
      const b = Math.round((1 - t) * (topColor & 0xff) + t * (bottomColor & 0xff));
      const color = (r << 16) | (g << 8) | b;
      bgGraphics.fillStyle(color, 1);
      bgGraphics.fillRect(0, y, worldW, 2);
    }
    bgGraphics.setDepth(-100);

    // Groups
    const platforms = scene.physics.add.staticGroup();
    const spikes = scene.physics.add.staticGroup();
    const collectibles = scene.physics.add.group({ allowGravity: false });

    // Parse level objects
    if (lvl && lvl.objects) {
      for (const obj of lvl.objects) {
        if (obj.type === "rect") {
          // platform or ground — PlatformBase is required
          const p = new PlatformBase(scene, obj.x, obj.y, obj.w, obj.h, {
            color: obj.color,
          });
          platforms.add(p.gfx);
        } else if (obj.type === "pin") {
          // Use SpikesBase for spike creation
          const { default: SpikesBase } = await import('./enemies/spikes/SpikesBase.js');
          const spike = new SpikesBase(scene, obj.x, obj.y, obj.w, obj.h, {
            color: obj.color === 'danger' ? 0xff3333 : 0x888888,
            damage: obj.damage,
            depth: -1
          });
          spikes.add(spike.hitbox);
        } else if (obj.type === "collectible") {
          const cx = obj.x;
          const cy = obj.y;
          const c = scene.add
            .text(cx, cy - 8, obj.letter || "?", {
              fontSize: "20px",
              color: "#000",
            })
            .setOrigin(0.5);
          scene.physics.add.existing(c);
          c.body.setAllowGravity(false);
          c.letter = obj.letter || null;
          c.order = typeof obj.order === "number" ? obj.order : null;
          collectibles.add(c);
        }
      }
    }
    // Use playerX/playerY from level JSON if present
    const spawnX = (lvl && typeof lvl.playerX === 'number') ? lvl.playerX : 100;
    const spawnY = (lvl && typeof lvl.playerY === 'number') ? lvl.playerY : 100;
    this.playerObj = new PlayerClass(scene, spawnX, spawnY, {
      maxXvelocity: 220,
      maxYvelocity: 500,
      maxJumps: 2,
    });
    this.playerObj.sprite.setCollideWorldBounds(true);
    scene.cursors = scene.input.keyboard.createCursorKeys();
    scene._lastMove = 0;

    // Use world size for camera and physics bounds
    const minX = 0, minY = 0, worldWidth = worldW, worldHeight = worldH;
    if (
      scene.physics &&
      scene.physics.world &&
      typeof scene.physics.world.setBounds === "function"
    ) {
      scene.physics.world.setBounds(minX, minY, worldWidth, worldHeight);
    }
    if (scene.cameras && scene.cameras.main) {
      scene.cameras.main.setBounds(minX, minY, worldWidth, worldHeight);
      // camera Y offset: allow overriding via init opts, default to -80 (so camera shows more above the player)
      const camYOffset =
        this._initOpts && typeof this._initOpts.cameraYOffset === "number"
          ? this._initOpts.cameraYOffset
          : -80;
      scene.cameras.main.startFollow(
        this.playerObj.sprite,
        true,
        0.08,
        0.08,
        0,
        camYOffset
      );
      // create an invisible camera bounding rectangle GameObject (useful for debugging or future logic)
      try {
        const centerX = minX + worldWidth / 2;
        const centerY = minY + worldHeight / 2;
        const cameraBox = scene.add.rectangle(
          centerX,
          centerY,
          worldWidth,
          worldHeight,
          0x000000,
          0
        );
        cameraBox.setVisible(false);
        cameraBox.name = "cameraBox";
        // keep a reference in case caller wants it
        this.cameraBox = cameraBox;
      } catch (e) {
        // intentionally let errors surface elsewhere; this is best-effort
      }
      // optional nicer framing
      try {
        scene.cameras.main.setDeadzone(200, 120);
      } catch (e) {}
    }

    // UI manager (required)
    this.ui = new UIClass(scene);

    // hook UI events to game behavior
    this._paused = false;
    this._uiTogglePauseHandler = () => {
      try {
        this._paused = !this._paused;
        if (scene.physics && scene.physics.world) {
          try {
            if (this._paused && typeof scene.physics.world.pause === 'function') scene.physics.world.pause();
            else if (!this._paused && typeof scene.physics.world.resume === 'function') scene.physics.world.resume();
          } catch (e) {}
        }
        try { scene.sys.events.emit('gamePaused', this._paused); } catch (e) {}
      } catch (e) {}
    };
    this._uiToggleSoundHandler = () => {
      try {
        const newMuted = !(scene.sound && scene.sound.mute);
        if (scene.sound) scene.sound.mute = newMuted;
        try { scene.sys.events.emit('soundMutedChanged', !!newMuted); } catch (e) {}
      } catch (e) {}
    };
    try {
      scene.sys && scene.sys.events && scene.sys.events.on && scene.sys.events.on('ui:togglePause', this._uiTogglePauseHandler);
      scene.sys && scene.sys.events && scene.sys.events.on && scene.sys.events.on('ui:toggleSound', this._uiToggleSoundHandler);
      // emit initial sound state
      try { scene.sys.events.emit('soundMutedChanged', !!(scene.sound && scene.sound.mute)); } catch (e) {}
    } catch (e) {}

    // start theme music if available
    try {
      if (scene.sound && scene.cache.audio.exists && scene.cache.audio.exists('theme')) {
        const mus = scene.sound.add('theme', { loop: true, volume: 0.45 });
        try { mus.play(); } catch (e) {}
        this._themeMusic = mus;
      }
    } catch (e) {}

    // Collisions
    scene.physics.add.collider(this.playerObj.sprite, platforms, () => {
      // reset jump count when touching platform
      this.playerObj.sprite.jumpCount = 0;
    });
    scene.physics.add.collider(this.playerObj.sprite, spikes, (p, s) => {
      try {
        // brief red flash
        p.setTint(0xff0000);
        // bounce upwards
        try { p.setVelocityY(-260); } catch (e) {}
        // small horizontal knockback away from spike
        try {
          const knock = p.x < s.x ? -120 : 120;
          p.setVelocityX(knock);
        } catch (e) {}

        
        try {
          this.playerObj && typeof this.playerObj.takeDamage === 'function' && this.playerObj.takeDamage(s.damage);
        } catch (e) {}
        // clear tint shortly after
        try { scene.time.delayedCall(220, () => { try { p.clearTint(); } catch (e) {} }); } catch (e) {}
      } catch (e) {}
    });
    scene.physics.add.overlap(this.playerObj.sprite, collectibles, (p, c) => {
      try {
        const letter = c.letter || null;
        const order = typeof c.order === "number" ? c.order : null;
        const nextIndex =
          typeof this._nextCollectIndex === "number"
            ? this._nextCollectIndex
            : 0;
        // if a target sequence is defined, enforce order
        if (this._targetSequence && this._targetSequence.length > 0) {
          if (order === nextIndex) {
            c.destroy();
            this._collected = (this._collected || 0) + 1;
            this._nextCollectIndex = nextIndex + 1;
            this._emit("collect", { letter, order });
          } else {
            // wrong order -> small bounce and emit wrong
            p.setVelocityY(-180);
            this._emit("wrong", { letter, order, expected: nextIndex });
          }
        } else {
          // free collect
          c.destroy();
          this._collected = (this._collected || 0) + 1;
          this._emit("collect", { letter, order });
        }
        if (
          this._collected >=
          (this._totalCollectibles || collectibles.getLength())
        ) {
          this._emit("win");
        }
      } catch (e) {}
    });
    // prepare collectible totals
    this._totalCollectibles = collectibles.getLength();
    this._collected = 0;
    // build ordered target sequence if collectibles have 'order'
    const list = collectibles.getChildren().slice();
    const ordered = list
      .filter((c) => typeof c.order === "number")
      .sort((a, b) => a.order - b.order)
      .map((c) => c.letter);
    if (ordered.length > 0) {
      this._targetSequence = ordered;
      this._nextCollectIndex = 0;
      this._emit("levelInfo", { targetSequence: this._targetSequence });
      // inform UI manager
      try {
        this.ui && this.ui.setTargetSequence(this._targetSequence);
      } catch (e) {}
    }
  }

  update(scene, time, delta) {
    // Phaser will call update(scene, time, delta) from our wrapper; ensure backwards compatibility
    if (typeof scene === "number") {
      // called with (time, delta) because binding was different; restore values
      delta = time;
      time = scene;
      scene = this;
    }
    scene = scene || this;
    if (!this.playerObj || !this.playerObj.sprite) return;

    // when paused, skip player updates
    if (!this._paused) {
      // If we have a Player class instance, let it handle input/jump/update
      if (typeof this.playerObj.update === "function") {
        try {
          this.playerObj.update();
        } catch (e) {}
      }
    }

    // Camera Y offset: manually adjust camera scrollY to follow player plus offset
    if (scene.cameras && scene.cameras.main && this.playerObj.sprite) {
      const camYOffset = (this._initOpts && typeof this._initOpts.cameraYOffset === "number") ? this._initOpts.cameraYOffset : -80;
      // Center camera on player plus offset
      scene.cameras.main.scrollY = this.playerObj.sprite.y + camYOffset - scene.cameras.main.height / 2;
    }

    // Clamp velocities (ensure max speeds)
    const vx = this.playerObj.sprite.body.velocity.x;
    const vy = this.playerObj.sprite.body.velocity.y;
    if (Math.abs(vx) > this.playerObj.sprite.maxXvelocity) {
      this.playerObj.sprite.setVelocityX(Math.sign(vx) * this.playerObj.sprite.maxXvelocity);
    }
    if (Math.abs(vy) > this.playerObj.sprite.maxYvelocity) {
      this.playerObj.sprite.setVelocityY(Math.sign(vy) * this.playerObj.sprite.maxYvelocity);
    }

  }

  async destroy() {
    if (this.game) {
      try {
        this.game.destroy(true);
      } catch (e) {}
      this.game = null;
    }
    this._ready = false;
    return Promise.resolve();
  }
}
