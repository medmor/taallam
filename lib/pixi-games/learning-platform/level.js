// Level helper for Pixi + Matter platformer
import { PlatformBase } from './platforms/platformBase';
import { SpikeBase } from './enemies/spikeBase';
export class Level {
  constructor(Matter, PIXI, levelDef = {}, opts = {}) {
    this.Matter = Matter;
    this.PIXI = PIXI;
    this.levelDef = levelDef || {};
    // compute horizontal and vertical extents
    const defaultWidth = Math.floor(
      (opts.viewportWidth || 800) * (opts.levelMultiplier || 2)
    );
    const defaultHeight = opts.viewportHeight || 600;
    this.width = levelDef.width || defaultWidth;
    this.height = levelDef.height || defaultHeight;

    this.bodies = [];
    this.graphics = [];

    // build objects from definition
    const objs = levelDef.objects || [];
    // determine vertical span of objects so we can set a sensible level height
    let minY = Infinity,
      maxY = -Infinity;
    // helper to resolve color tokens or numeric values
    const resolveColor = (val) => {
      if (!val) return 0x654321;
      if (typeof val === "number") return val;
      if (typeof val === "string") {
        // allow '0xabcdef' or palette names
        if (val.startsWith("0x")) return parseInt(val, 16);
        try {
          const palette = require("./colors").default;
          if (palette && palette[val]) return palette[val];
        } catch (e) {}
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) return parsed;
      }
      return 0x654321;
    };

    objs.forEach((o) => {
      if (typeof o.y === "number" && typeof o.h === "number") {
        minY = Math.min(minY, o.y - o.h / 2);
        maxY = Math.max(maxY, o.y + o.h / 2);
      }
    });
    if (minY !== Infinity && maxY !== -Infinity) {
      // add a little padding
      const padding = levelDef.paddingY || 40;
      const extraBuffer = opts.extraVerticalBuffer || 200;
      const span = Math.ceil(maxY - minY + padding);
      // ensure the computed height is at least the viewport height plus a buffer
      this.height = Math.max(
        defaultHeight + extraBuffer,
        span + extraBuffer,
        this.height
      );
    }

    objs.forEach((o) => {
      if (o.type === "rect") {
        const platform = new PlatformBase(Matter, PIXI, o, resolveColor);
        this.bodies.push({ name: o.name || "", body: platform.body, def: o });
        this.graphics.push({ name: o.name || "", gfx: platform.gfx, def: o });
      } else if (o.type === "pin") {
        const spikes = new SpikeBase(Matter, PIXI, o, resolveColor);
        for (const b of spikes.bodies) {
          this.bodies.push(b);
        }
        for (const g of spikes.graphics) {
          this.graphics.push(g);
        }
      }
    });
  }

  // Return a Y coordinate representing the middle of the ground for camera clamping.
  getGroundMiddleY() {
    return this.groundMiddleY || this.height / 2;
  }

  addToWorld(world) {
    const bodies = this.bodies.map((b) => b.body);
    this.Matter.World.add(world, bodies);
  }

  addToContainer(container) {
    this.graphics.forEach((g) => container.addChild(g.gfx));
  }

  updateGraphics() {
    this.graphics.forEach((item) => {
      const def = item.def;
      // prefer the base physics body for this graphic (bodies created for spikes share the same def)
      let bodyEntry = this.bodies.find(
        (b) =>
          b.def === def &&
          typeof b.name === "string" &&
          b.name.endsWith("-base")
      );
      if (!bodyEntry)
        bodyEntry = this.bodies.find(
          (b) => b.name === item.name || b.def === def
        );
      if (bodyEntry && bodyEntry.body) {
        // some Matter.fromVertices usages can return an array of bodies; normalize
        const phys = Array.isArray(bodyEntry.body)
          ? bodyEntry.body[0]
          : bodyEntry.body;
        if (phys && phys.position) {
          item.gfx.x = phys.position.x;
          item.gfx.y = phys.position.y;
        }
      }
    });
  }
}

export default Level;
