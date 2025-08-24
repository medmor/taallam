// SpidesBase: creates a spike obstacle (rounded box + spikes) for the platformer
export class SpidesBase {
  constructor(Matter, PIXI, def, resolveColor) {
    this.Matter = Matter;
    this.PIXI = PIXI;
    this.def = def;
    this.bodies = [];
    this.graphics = [];
    const o = def;
    const w = o.w || 36;
    const h = o.h || 36;
    const radius = Math.min(8, Math.floor(Math.min(w, h) * 0.15));
    const spikeH = Math.max(6, Math.floor(Math.min(w, h) * 0.28));
    const spikeW = Math.max(6, Math.floor(Math.min(w, h) * 0.22));
    const spacing = Math.max(
      spikeW + 6,
      Math.floor(w / Math.max(1, Math.floor(w / (spikeW * 2))))
    );
    const baseBody = Matter.Bodies.rectangle(o.x, o.y, w, h, {
      isStatic: !!o.isStatic,
    });
    const damageVal =
      typeof o.damage === "number"
        ? o.damage
        : o.damage
        ? Number(o.damage) || 1
        : 1;
    try {
      baseBody.isObstacle = !!o.isObstacle;
      baseBody.damage = damageVal;
    } catch (e) {
      if (baseBody.label) baseBody.label += " base";
    }
    this.bodies.push({ name: (o.name || "") + "-base", body: baseBody, def: o });
    // top edge
    const topCount = Math.max(1, Math.floor(w / spacing));
    for (let i = 0; i < topCount; i++) {
      const x = o.x - w / 2 + spacing / 2 + i * spacing;
      const y = o.y - h / 2;
      const verts = [
        { x: x - spikeW / 2 - o.x, y: y - o.y },
        { x: x + spikeW / 2 - o.x, y: y - o.y },
        { x: x - o.x, y: y - spikeH - o.y },
      ];
      let b = null;
      try {
        b = Matter.Bodies.fromVertices(o.x, o.y, verts, {
          isStatic: !!o.isStatic,
        });
      } catch (e) {
        b = Matter.Bodies.rectangle(x, y - spikeH / 2, spikeW, spikeH, {
          isStatic: !!o.isStatic,
        });
      }
      if (b) {
        try {
          b.isObstacle = true;
          b.damage = damageVal;
        } catch (e) {
          b.label = (b.label || "") + " obstacle";
          b.damage = damageVal;
        }
        this.bodies.push({ name: (o.name || "") + "-topspike" + i, body: b, def: o });
      }
    }
    // bottom edge
    const bottomCount = Math.max(1, Math.floor(w / spacing));
    for (let i = 0; i < bottomCount; i++) {
      const x = o.x - w / 2 + spacing / 2 + i * spacing;
      const y = o.y + h / 2;
      const verts = [
        { x: x - spikeW / 2 - o.x, y: y - o.y },
        { x: x + spikeW / 2 - o.x, y: y - o.y },
        { x: x - o.x, y: y + spikeH - o.y },
      ];
      let b = null;
      try {
        b = Matter.Bodies.fromVertices(o.x, o.y, verts, {
          isStatic: !!o.isStatic,
        });
      } catch (e) {
        b = Matter.Bodies.rectangle(x, y + spikeH / 2, spikeW, spikeH, {
          isStatic: !!o.isStatic,
        });
      }
      if (b) {
        try {
          b.isObstacle = true;
          b.damage = damageVal;
        } catch (e) {
          b.label = (b.label || "") + " obstacle";
          b.damage = damageVal;
        }
        this.bodies.push({ name: (o.name || "") + "-bottomspike" + i, body: b, def: o });
      }
    }
    // left edge
    const leftCount = Math.max(1, Math.floor(h / spacing));
    for (let i = 0; i < leftCount; i++) {
      const y = o.y - h / 2 + spacing / 2 + i * spacing;
      const x = o.x - w / 2;
      const verts = [
        { x: x - o.x, y: y - spikeW / 2 - o.y },
        { x: x - spikeH - o.x, y: y - o.y },
        { x: x - o.x, y: y + spikeW / 2 - o.y },
      ];
      let b = null;
      try {
        b = Matter.Bodies.fromVertices(o.x, o.y, verts, {
          isStatic: !!o.isStatic,
        });
      } catch (e) {
        b = Matter.Bodies.rectangle(x - spikeH / 2, y, spikeH, spikeW, {
          isStatic: !!o.isStatic,
        });
      }
      if (b) {
        try {
          b.isObstacle = true;
          b.damage = damageVal;
        } catch (e) {
          b.label = (b.label || "") + " obstacle";
          b.damage = damageVal;
        }
        this.bodies.push({ name: (o.name || "") + "-leftspike" + i, body: b, def: o });
      }
    }
    // right edge
    const rightCount = Math.max(1, Math.floor(h / spacing));
    for (let i = 0; i < rightCount; i++) {
      const y = o.y - h / 2 + spacing / 2 + i * spacing;
      const x = o.x + w / 2;
      const verts = [
        { x: x - o.x, y: y - spikeW / 2 - o.y },
        { x: x + spikeH - o.x, y: y - o.y },
        { x: x - o.x, y: y + spikeW / 2 - o.y },
      ];
      let b = null;
      try {
        b = Matter.Bodies.fromVertices(o.x, o.y, verts, {
          isStatic: !!o.isStatic,
        });
      } catch (e) {
        b = Matter.Bodies.rectangle(x + spikeH / 2, y, spikeH, spikeW, {
          isStatic: !!o.isStatic,
        });
      }
      if (b) {
        try {
          b.isObstacle = true;
          b.damage = damageVal;
        } catch (e) {
          b.label = (b.label || "") + " obstacle";
          b.damage = damageVal;
        }
        this.bodies.push({ name: (o.name || "") + "-rightspike" + i, body: b, def: o });
      }
    }
    // graphics: rounded rect + spikes
    const g = new PIXI.Graphics();
    const colorVal = resolveColor(o.color || "danger");
    g.roundRect(-w / 2, -h / 2, w, h, radius);
    g.fill({ color: colorVal });
    // top
    for (let i = 0; i < topCount; i++) {
      const xRel = -w / 2 + spacing / 2 + i * spacing;
      const yRel = -h / 2;
      g.moveTo(xRel - spikeW / 2, yRel);
      g.lineTo(xRel + spikeW / 2, yRel);
      g.lineTo(xRel, yRel - spikeH);
      g.closePath();
    }
    // bottom
    for (let i = 0; i < bottomCount; i++) {
      const xRel = -w / 2 + spacing / 2 + i * spacing;
      const yRel = h / 2;
      g.moveTo(xRel - spikeW / 2, yRel);
      g.lineTo(xRel + spikeW / 2, yRel);
      g.lineTo(xRel, yRel + spikeH);
      g.closePath();
    }
    // left
    for (let i = 0; i < leftCount; i++) {
      const yRel = -h / 2 + spacing / 2 + i * spacing;
      const xRel = -w / 2;
      g.moveTo(xRel, yRel - spikeW / 2);
      g.lineTo(xRel - spikeH, yRel);
      g.lineTo(xRel, yRel + spikeW / 2);
      g.closePath();
    }
    // right
    for (let i = 0; i < rightCount; i++) {
      const yRel = -h / 2 + spacing / 2 + i * spacing;
      const xRel = w / 2;
      g.moveTo(xRel, yRel - spikeW / 2);
      g.lineTo(xRel + spikeH, yRel);
      g.lineTo(xRel, yRel + spikeW / 2);
      g.closePath();
    }
    g.fill();
    g.setStrokeStyle(1, 0x222222, 1);
    g.stroke();
    g.x = o.x;
    g.y = o.y;
    this.graphics.push({ name: o.name || "", gfx: g, def: o });
  }
}
