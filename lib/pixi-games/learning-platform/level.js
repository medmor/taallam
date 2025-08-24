// Level helper for Pixi + Matter platformer
export class Level {
    constructor(Matter, PIXI, levelDef = {}, opts = {}) {
        this.Matter = Matter;
        this.PIXI = PIXI;
    this.levelDef = levelDef || {};
    // compute horizontal and vertical extents
    const defaultWidth = Math.floor((opts.viewportWidth || 800) * (opts.levelMultiplier || 2));
    const defaultHeight = (opts.viewportHeight || 600);
    this.width = levelDef.width || defaultWidth;
    this.height = levelDef.height || defaultHeight;

        this.bodies = [];
        this.graphics = [];

        // build objects from definition
        const objs = levelDef.objects || [];
        // determine vertical span of objects so we can set a sensible level height
        let minY = Infinity, maxY = -Infinity;
        // helper to resolve color tokens or numeric values
        const resolveColor = (val) => {
            if (!val) return 0x654321;
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                // allow '0xabcdef' or palette names
                if (val.startsWith('0x')) return parseInt(val, 16);
                try { const palette = require('./colors').default; if (palette && palette[val]) return palette[val]; } catch (e) {}
                const parsed = parseInt(val, 10);
                if (!isNaN(parsed)) return parsed;
            }
            return 0x654321;
        };

        objs.forEach(o => {
            if (typeof o.y === 'number' && typeof o.h === 'number') {
                minY = Math.min(minY, o.y - (o.h / 2));
                maxY = Math.max(maxY, o.y + (o.h / 2));
            }
        });
        if (minY !== Infinity && maxY !== -Infinity) {
            // add a little padding
            const padding = levelDef.paddingY || 40;
            const extraBuffer = (opts.extraVerticalBuffer || 200);
            const span = Math.ceil(maxY - minY + padding);
            // ensure the computed height is at least the viewport height plus a buffer
            this.height = Math.max(defaultHeight + extraBuffer, span + extraBuffer, this.height);
        }
        // determine a reasonable "ground middle Y" for camera clamping
        // prefer an object explicitly named 'ground', else pick the lowest static object,
        // else fallback to half the level height
        let groundY = null;
        const namedGround = objs.find(o => (o.name && o.name.toLowerCase() === 'ground') || o.isGround);
        if (namedGround) groundY = namedGround.y;
        else {
            const staticObjs = objs.filter(o => !!o.isStatic || o.type === 'rect');
            if (staticObjs.length > 0) {
                // pick the object with largest y (closest to bottom)
                staticObjs.sort((a, b) => (b.y || 0) - (a.y || 0));
                groundY = staticObjs[0].y;
            }
        }
        this.groundMiddleY = (typeof groundY === 'number') ? groundY : (this.height / 2);
        objs.forEach(o => {
            if (o.type === 'rect') {
                const body = Matter.Bodies.rectangle(o.x, o.y, o.w, o.h, { isStatic: !!o.isStatic });
                this.bodies.push({ name: o.name || '', body, def: o });

                const g = new PIXI.Graphics();
                // parse color: allow hex string like '0xabcdef' or decimal
                let colorVal = resolveColor(o.color || 'ground');
                // draw order: rect -> fill -> stroke
                g.rect(-o.w / 2, -o.h / 2, o.w, o.h);
                g.fill({ color: colorVal });
                g.setStrokeStyle(1, 0x222222, 1);
                g.x = o.x;
                g.y = o.y;
                this.graphics.push({ name: o.name || '', gfx: g, def: o });
            }
        });
    }

    // Return a Y coordinate representing the middle of the ground for camera clamping.
    getGroundMiddleY() {
        return this.groundMiddleY || (this.height / 2);
    }

    addToWorld(world) {
        const bodies = this.bodies.map(b => b.body);
        this.Matter.World.add(world, bodies);
    }

    addToContainer(container) {
        this.graphics.forEach(g => container.addChild(g.gfx));
    }

    updateGraphics() {
        this.graphics.forEach(item => {
            const def = item.def;
            const bodyEntry = this.bodies.find(b => b.name === item.name || b.def === def);
            if (bodyEntry && bodyEntry.body) {
                item.gfx.x = bodyEntry.body.position.x;
                item.gfx.y = bodyEntry.body.position.y;
            }
        });
    }
}

export default Level;
