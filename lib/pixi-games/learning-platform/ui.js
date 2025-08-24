// Simple UI manager for health, timer and messages (Pixi v8)
export default class UIManager {
    constructor(PIXI, stage, opts = {}) {
        this.PIXI = PIXI;
        this.stage = stage;
        this.opts = opts || {};
        this.width = opts.width || 800;
        this.height = opts.height || 600;

    this.container = new PIXI.Container();
    try { this.container.zIndex = 100; } catch (e) { }
    // Keep HUD at top-left fixed; add to stage after world so it's on top
    this.container.x = 0; this.container.y = 0;

        // Health bar
        this._barX = 12; this._barY = 12;
        this._barW = Math.min(260, Math.floor(this.width * 0.28));
        this._barH = 18;
        this.healthBg = new PIXI.Graphics();
        this.healthBg.beginFill(0x222222, 0.8);
        this.healthBg.drawRect(0, 0, this._barW, this._barH);
        this.healthBg.endFill();
        this.healthBg.x = this._barX; this.healthBg.y = this._barY;

        this.healthFg = new PIXI.Graphics();
        this.healthFg.beginFill(0xff4444);
        this.healthFg.drawRect(0, 0, this._barW, this._barH);
        this.healthFg.endFill();
        this.healthFg.x = this._barX; this.healthFg.y = this._barY;

    // numeric health text intentionally omitted (HUD shows only bar)

        // Timer
        this.timerSec = 0;
        this.timerText = new PIXI.Text({ text: '00:00', style: { fontFamily: 'monospace', fontSize: 12, fill: 0xffffff } });
        this.timerText.x = this.width - 80; this.timerText.y = 12;

        // Message overlay (centered)
    this.messageText = new PIXI.Text({ text: '', style: { fontFamily: 'monospace', fontSize: 18, fill: 0xffffff } });
    try { this.messageText.anchor.set(0.5, 0.5); } catch (e) { }
        this.messageText.x = Math.round(this.width / 2);
        this.messageText.y = 40;

    this.container.addChild(this.healthBg, this.healthFg, this.timerText, this.messageText);
        this.stage.addChild(this.container);

        this._visible = true;
        this._lastUpdateMs = 0;
        this._msgTimer = null;
    }

    setHealth(current, max) {
        const c = Math.max(0, Math.min(current || 0, max || 1));
        const pct = (max && max > 0) ? (c / max) : 0;
        const w = Math.max(0, Math.round(this._barW * pct));
        try {
            this.healthFg.clear();
            // Interpolate color from green -> yellow -> red
            const color = (pct > 0.5) ? 0x66ff66 : (pct > 0.25 ? 0xffcc00 : 0xff4444);
            this.healthFg.beginFill(color);
            this.healthFg.drawRect(0, 0, w, this._barH);
            this.healthFg.endFill();
        } catch (e) { }
    // no numeric text display; only the colored bar updates
    }

    setMessage(text = '', timeoutMs = 0) {
        try { this.messageText.text = text || ''; } catch (e) { }
        if (this._msgTimer) { clearTimeout(this._msgTimer); this._msgTimer = null; }
        if (timeoutMs > 0 && text) {
            this._msgTimer = setTimeout(() => { try { this.messageText.text = ''; } catch (e) { } }, timeoutMs);
        }
    }

    resetTimer() { this.timerSec = 0; }

    update(deltaMs) {
        if (!deltaMs) return;
        this.timerSec += (deltaMs / 1000);
        const s = Math.floor(this.timerSec % 60);
        const m = Math.floor(this.timerSec / 60);
        try { this.timerText.text = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`; } catch (e) { }
    }

    destroy() {
        try { if (this._msgTimer) clearTimeout(this._msgTimer); } catch (e) { }
    try { this.container.removeChild(this.healthBg); this.container.removeChild(this.healthFg); this.container.removeChild(this.timerText); this.container.removeChild(this.messageText); } catch (e) { }
    try { this.healthBg.destroy && this.healthBg.destroy({ children: true }); } catch (e) { }
    try { this.healthFg.destroy && this.healthFg.destroy({ children: true }); } catch (e) { }
    try { this.timerText.destroy && this.timerText.destroy({ children: true }); } catch (e) { }
    try { this.messageText.destroy && this.messageText.destroy({ children: true }); } catch (e) { }
        try { this.container.destroy && this.container.destroy({ children: true }); } catch (e) { }
    }
}
