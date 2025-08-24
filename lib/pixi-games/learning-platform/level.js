// Level helper for Pixi + Matter platformer
export class Level {
    constructor(Matter, PIXI, levelDef = {}, opts = {}) {
        this.Matter = Matter;
        this.PIXI = PIXI;
        this.levelDef = levelDef || {};
        this.width = levelDef.width || (Math.floor((opts.viewportWidth || 800) * (opts.levelMultiplier || 2)));
        this.height = levelDef.height || (opts.viewportHeight || 600);

        this.bodies = [];
        this.graphics = [];

        // build objects from definition
        const objs = levelDef.objects || [];
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
                let colorVal = o.color || '0x654321';
                if (typeof colorVal === 'string' && colorVal.startsWith('0x')) colorVal = parseInt(colorVal, 16);
                else colorVal = parseInt(colorVal);
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
