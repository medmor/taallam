import { preloadSfx, playSfx } from '@/lib/sfx';
import UIManager from '@/lib/pixi-games/learning-platform/ui';

// Static map of available levels to keep imports statically analyzable for bundlers
const LEVEL_MAP = {
    'level1': () => import('@/lib/pixi-games/learning-platform/levels/level1.json'),
    // add more levels here, e.g.
    // 'level2': () => import('@/lib/pixi-games/learning-platform/levels/level2.json'),
};

export default class Game {
    constructor(container, opts = {}) {
        this.container = container;
        this.opts = opts || {};
        this.state = 'idle'; // idle | loading | running | paused
        this.app = null;
        this.Matter = null;
        this.PIXI = null;
        this.engine = null;
        this.world = null;
        this.player = null;
        this.levelObj = null;
        this.worldContainer = null;
        this.keys = { left: false, right: false, up: false };
        this._boundLoop = null;
        this._onKeyDown = null;
        this._onKeyUp = null;
        this.debugVisible = true;
    }

    async loadDependencies() {
        this.state = 'loading';
        try {
            const [PIXI, Matter] = await Promise.all([import('pixi.js'), import('matter-js')]);
            this.PIXI = PIXI;
            this.Matter = Matter;
        } catch (e) {
            console.error('Failed to load dependencies', e);
            throw e;
        }
    try { preloadSfx(); unlockSfxOnGesture(); } catch (e) { }
    }

    async init({ width = 800, height = 600, levelJsonPath, levelKey } = {}) {
        if (!this.PIXI) throw new Error('Dependencies not loaded');
        this.state = 'initializing';
        const PIXI = this.PIXI;
        const Matter = this.Matter;

        this.app = new PIXI.Application();
        await this.app.init({ background: '#1099bb', width, height });
        if (this.container && this.app.canvas) this.container.appendChild(this.app.canvas);

    // allow explicit zIndex sorting on stage so HUD can be placed above world
    try { this.app.stage.sortableChildren = true; } catch (e) { }

        // UI manager (HUD) - add on top of stage so it remains fixed
        try {
            this.ui = new UIManager(PIXI, this.app.stage, { width: this.app.canvas.width, height: this.app.canvas.height });
            this.ui.setMessage('Loading...', 800);
        } catch (e) { this.ui = null; }

        // physics
        this.engine = Matter.Engine.create();
        this.engine.gravity.y = 1;
        this.world = this.engine.world;

        // load level definition
        let levelDef = null;
        if (levelKey && LEVEL_MAP[levelKey]) {
            try {
                const mod = await LEVEL_MAP[levelKey]();
                levelDef = mod && mod.default ? mod.default : mod;
            } catch (e) {
                console.warn('Failed to load level for key', levelKey, e);
            }
        } else if (levelJsonPath) {
            // fallback for backward compatibility, though dynamic imports with
            // a runtime path may not be bundled by webpack/Next.js.
            try {
                console.log('Loading level from', levelJsonPath);
                const mod = await import(levelJsonPath);
                levelDef = mod && mod.default ? mod.default : mod;
            } catch (e) {
                console.warn('Failed to dynamically import levelJsonPath', levelJsonPath, e);
            }
        }
        const { default: Level } = await import('@/lib/pixi-games/learning-platform/level');
        this.levelObj = new Level(Matter, PIXI, levelDef || {}, { viewportWidth: this.app.canvas.width, viewportHeight: height, levelMultiplier: 2 });
        this.levelObj.addToWorld(this.world);

        // create a canvas-backed vertical blue gradient for the background
        try {
            const w = this.app.canvas.width;
            const h = this.app.canvas.height;
            const cvs = document.createElement('canvas');
            cvs.width = Math.max(1, w);
            cvs.height = Math.max(1, h);
            const ctx = cvs.getContext('2d');
            const grad = ctx.createLinearGradient(0, cvs.height, 0, 0);
            // bottom -> top colors (light bottom, darker top) - made overall lighter
            grad.addColorStop(0, '#e6f8ff');
            grad.addColorStop(0.5, '#bfeeff');
            grad.addColorStop(1, '#66c0ea');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, cvs.width, cvs.height);
            const tex = PIXI.Texture.from(cvs);
            this.bgSprite = new PIXI.Sprite(tex);
            this.bgSprite.x = 0; this.bgSprite.y = 0;
            this.bgSprite.width = w; this.bgSprite.height = h;
            this.bgSprite.zIndex = 0;
            this.app.stage.addChild(this.bgSprite);
        } catch (e) {
            // ignore background failures
            this.bgSprite = null;
        }

        // world container
        this.worldContainer = new PIXI.Container();
        this.worldContainer.zIndex = 10;
        this.app.stage.addChild(this.worldContainer);
        this.levelObj.addToContainer(this.worldContainer);

        // debug overlay (in world coords) and HUD (screen fixed)
        this.debugG = new PIXI.Graphics();
        this.worldContainer.addChild(this.debugG);
        this.debugBg = new PIXI.Graphics();
    this.debugBg.zIndex = 20;
    this.app.stage.addChild(this.debugBg);
        this.debugHud = new PIXI.Text({ text: '', style: { fontFamily: 'monospace', fontSize: 12, fill: 0xffffff } });
        this.debugHud.x = 8; this.debugHud.y = 8;
    this.debugHud.zIndex = 30;
    this.app.stage.addChild(this.debugHud);

        // ensure UI (if created earlier) is on top of world and debug HUD
        try {
            if (this.ui && this.ui.container && this.app && this.app.stage) {
                // ensure UI is parented to stage and placed above world by zIndex
                try { if (this.ui.container.parent !== this.app.stage) this.app.stage.addChild(this.ui.container); } catch (e) { }
                try { this.ui.container.zIndex = 100; } catch (e) { }
            }
        } catch (e) { }

        // create player
        const { Player } = await import('@/lib/pixi-games/learning-platform/player');
        this.player = new Player(Matter, PIXI, 80, 60, 32, 48, this.world, this.worldContainer);
        try { this.player.attachCollisionHandlers(this.engine); } catch (e) { }

        // input handlers
        this._onKeyDown = (e) => {

            if (['ArrowLeft', 'a'].includes(e.key)) this.keys.left = true;
            if (['ArrowRight', 'd'].includes(e.key)) this.keys.right = true;
            if (['ArrowUp', 'w', ' '].includes(e.key)) this.keys.up = true;
        };
        this._onKeyUp = (e) => { if (['ArrowLeft', 'a'].includes(e.key)) this.keys.left = false; if (['ArrowRight', 'd'].includes(e.key)) this.keys.right = false; if (['ArrowUp', 'w', ' '].includes(e.key)) this.keys.up = false; };
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);

        // loop
        this._boundLoop = this.loop.bind(this);
        this.app.ticker.add(this._boundLoop);
        this.state = 'running';
    }

    pause() {
        if (!this.app) return;
        if (this.state === 'running') {
            this.state = 'paused';
            this.app.ticker.stop();
        } else if (this.state === 'paused') {
            this.state = 'running';
            this.app.ticker.start();
        }
    }

    handleControls() {
        if (!this.player) return;
        const speed = 5.5;
        const jumpPower = -12;
        if (this.keys.left) this.player.move(-1, speed);
        else if (this.keys.right) this.player.move(1, speed);
        else this.player.move(0, speed);
        if (this.keys.up) { this.player.jump(jumpPower); this.keys.up = false; }
    }

    loop() {
        if (!this.engine || this.state !== 'running') return;
        this.handleControls();
        this.Matter.Engine.update(this.engine, 1000 / 60);
        if (this.player) this.player.updateGraphics();
        if (this.levelObj) this.levelObj.updateGraphics();
        if (this.player) {
            const levelWidth = this.levelObj.width;
            const levelHeight = Math.max(this.levelObj.height, 800);

            this.player.updateCamera(this.worldContainer, levelWidth, levelHeight, this.app.canvas.width, this.app.canvas.height, 0.14, { offsetFactor: 0.2 });

        }
        // update UI with health + timer
        try {
            if (this.ui && this.player) {
                this.ui.setHealth(this.player.health, this.player.maxHealth);
                this.ui.update(1000 / 60);
            }
        } catch (e) { }
        // clamp player
        if (this.player && this.player.body) {
            const pb = this.player.body;
            const halfPW = 32 / 2;
            const minX = halfPW;
            const maxX = this.levelObj.width - halfPW;
            if (pb.position.x < minX) { this.Matter.Body.setPosition(pb, { x: minX, y: pb.position.y }); this.Matter.Body.setVelocity(pb, { x: 0, y: pb.velocity.y }); }
            else if (pb.position.x > maxX) { this.Matter.Body.setPosition(pb, { x: maxX, y: pb.position.y }); this.Matter.Body.setVelocity(pb, { x: 0, y: pb.velocity.y }); }
        }
    }

    async destroy() {
        try { window.removeEventListener('keydown', this._onKeyDown); window.removeEventListener('keyup', this._onKeyUp); } catch (e) { }
        try { if (this.player && typeof this.player.detachCollisionHandlers === 'function') this.player.detachCollisionHandlers(); } catch (e) { }
        // cleanup background sprite & texture first to avoid leaking GPU resources
        try {
            if (this.bgSprite) {
                try { if (this.app && this.app.stage && this.app.stage.children && this.app.stage.children.includes(this.bgSprite)) this.app.stage.removeChild(this.bgSprite); } catch (e) { }
                try { if (this.bgSprite.texture && typeof this.bgSprite.texture.destroy === 'function') this.bgSprite.texture.destroy(true); } catch (e) { }
                try { this.bgSprite.destroy && this.bgSprite.destroy({ children: true }); } catch (e) { }
                this.bgSprite = null;
            }
        } catch (e) { }
    try { if (this.app) { this.app.ticker.remove(this._boundLoop); this.app.destroy && this.app.destroy(true, { children: true }); if (this.container && this.app.canvas && this.app.canvas.parentNode === this.container) this.container.removeChild(this.app.canvas); } } catch (e) { }
    try { if (this.ui) { try { this.ui.destroy(); } catch (e) { } this.ui = null; } } catch (e) { }
        try { if (this.engine) this.engine.timing = null; } catch (e) { }
        this.state = 'destroyed';
    }
}
